import os
from dotenv import load_dotenv

# Explicitly load .env from the backend root directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import asyncio
import contextlib
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from loguru import logger

from app.core.config import settings
from app.core.origin_guard import API_PREFIX, is_origin_allowed
from app.core.exceptions import TtsException
from app.core.queue import TtsQueueManager
from app.core.transcription_queue import TranscriptionQueueManager
from app.services.cleanup_service import CleanupService
from app.services.transcription_service import TranscriptionService
from app.api.v1.health import router as health_router
from app.api.v1.tts import router as tts_router
from app.api.v1.transcription import router as transcription_router

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Konthora API services...")
    is_testing = settings.APP_ENV == "testing"

    cleanup_service = CleanupService()

    if not is_testing:
        # 1. Run startup stale storage clean
        await cleanup_service.run_startup_cleanup()

        # 2. Start queue worker background tasks
        queue_manager = TtsQueueManager()
        queue_manager.start()

        trans_queue = TranscriptionQueueManager()
        trans_queue.start()

        # 3. Start background file/metadata cleanup loop
        cleanup_service.start()

        # 4. Trigger initial singleton instantiation and model loading during startup (cold-start optimization)
        logger.info("Pre-warming model singletons for Kokoro TTS and Faster-Whisper...")
        try:
            loop = asyncio.get_running_loop()
            kokoro_service = KokoroService()
            transcription_service = TranscriptionService()
            await loop.run_in_executor(None, kokoro_service.load_pipeline, "a")
            await loop.run_in_executor(None, transcription_service.load_model)
            logger.info("Model warm-up completed successfully.")
        except Exception as e:
            logger.warning(f"Initial model preloading deferred or failed: {e}")

    yield

    # Shutdown
    if not is_testing:
        logger.info("Shutting down Konthora API services...")
        # 1. Cancel periodic cleanup loop
        cleanup_service.stop()
        # 2. Stop queue and thread executors gracefully
        queue_manager = TtsQueueManager()
        await queue_manager.stop()

        trans_queue = TranscriptionQueueManager()
        await trans_queue.stop()

app = FastAPI(
    title="Konthora API",
    version="1.0.0",
    description="Backend speech synthesis processing engine for Konthora.",
    lifespan=lifespan
)

# Middleware stack. Starlette wraps in reverse order, so the LAST added middleware
# is the OUTERMOST. Order (outer -> inner): TrustedHost -> CORS -> GZip.
# Security response headers are emitted by the edge proxy, not by the app,
# to avoid duplication; the edge is also the only layer that covers CORS
# preflight responses.
if settings.COMPRESSION_ENABLED:
    app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration (complying with cross-origin safety rules)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,  # Bearer auth does not require credentials/cookies
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Host header validation (deny unknown Hosts to prevent DNS rebinding / host spoofing)
# DISABLED for local dev to allow CORS preflight OPTIONS
# app.add_middleware(
#     TrustedHostMiddleware,
#     allowed_hosts=settings.trusted_hosts_list,
# )

@app.middleware("http")
async def add_robots_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response

# Server-side Origin enforcement (C1 follow-up). Registered AFTER the
# robots middleware, so it is the OUTERMOST middleware: it runs before
# CORS and before the route handlers, which means a rejected request
# never reaches rate limiting (no quota burned) or job creation.
# Scope: /api/v1/* only, all methods EXCEPT OPTIONS. Preflight OPTIONS
# requests are the CORS middleware's job — and live they never reach the
# app at all, because the HF Spaces edge answers them itself (and
# reflects any Origin, which is why this guard has to exist). The
# allowlist is settings.cors_origins_list, the same single source of
# truth as the CORS middleware; requests with no Origin header
# (curl, server-to-server, mobile apps) are allowed through.
@app.middleware("http")
async def enforce_api_origin(request: Request, call_next):
    if (
        request.url.path.startswith(API_PREFIX)
        and request.method != "OPTIONS"
        and not is_origin_allowed(request.headers.get("origin"))
    ):
        logger.warning(
            f"Rejected cross-origin API request: {request.method} "
            f"{request.url.path} from Origin "
            f"{request.headers.get('origin')!r}"
        )
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "code": "FORBIDDEN_ORIGIN",
                "message": "Cross-origin requests to this API are not allowed.",
            },
        )
    return await call_next(request)

# Register routes
app.include_router(health_router, prefix="/api/v1")
app.include_router(tts_router, prefix="/api/v1")
app.include_router(transcription_router, prefix="/api/v1")

# Global Exception Handlers

@app.exception_handler(TtsException)
async def tts_exception_handler(request: Request, exc: TtsException):
    logger.warning(f"Business logic exception: [{exc.code}] - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation failure: {exc.errors()}")
    # Format a human-readable validation error response
    msg = "Invalid request payload parameters."
    if exc.errors():
        err = exc.errors()[0]
        # Translate location path to string
        field = ".".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = f"Validation failed at '{field}': {err.get('msg')}"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "code": "INVALID_REQUEST",
            "message": msg
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled system exception: {exc}")
    # Privacy rule: never leak Python tracebacks or internal raw exceptions to clients
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred during processing."
        }
    )
