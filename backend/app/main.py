import contextlib
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from loguru import logger

from app.core.config import settings
from app.core.exceptions import TtsException
from app.core.queue import TtsQueueManager
from app.core.transcription_queue import TranscriptionQueueManager
from app.services.cleanup_service import CleanupService
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

# CORS configuration (complying with cross-origin safety rules)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,  # Bearer auth does not require credentials/cookies
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

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
