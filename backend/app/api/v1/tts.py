from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from loguru import logger

from app.schemas.tts import TtsJobCreate, TtsJobResponse, TtsJobStatusResponse, VoiceInfo
from app.services.job_service import JobService
from app.services.kokoro_service import KokoroService
from app.services.rate_limit_service import RateLimitService
from app.core.queue import TtsQueueManager
from app.core.exceptions import (
    UnauthorizedJobAccessException,
    QueueFullException,
    InvalidRequestException,
    TtsException
)
from app.utils.storage import resolve_secure_path

router = APIRouter()
security = HTTPBearer(auto_error=False)

def get_bearer_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extracts and returns the raw bearer authorization token safely."""
    if not credentials:
        raise UnauthorizedJobAccessException("Authentication token is missing.")
    return credentials.credentials

@router.get("/tts/voices", response_model=List[VoiceInfo])
def get_voices():
    """Returns the verified catalogue of English voices."""
    kokoro_service = KokoroService()
    return kokoro_service.get_voices()

@router.post("/tts/jobs", response_model=TtsJobResponse)
def create_tts_job(payload: TtsJobCreate, request: Request):
    """
    Creates a speech synthesis job, runs rate limits and queue capacity checks,
    registers active tasks, and enqueues work.
    """
    rate_limiter = RateLimitService()
    job_service = JobService()
    queue_manager = TtsQueueManager()
    kokoro_service = KokoroService()

    client_ip = rate_limiter.get_client_ip(request)

    # 1. Enforce requests-per-hour rate limits
    rate_limiter.check_rate_limit(client_ip)

    # 2. Enforce active jobs capacity per client IP (max 3 concurrent)
    rate_limiter.check_active_jobs_limit(client_ip, max_active=3)

    # 3. Validate voice selection against catalog
    voices = kokoro_service.get_voices()
    if not any(v["id"] == payload.voiceId for v in voices):
        raise InvalidRequestException("VOICE_UNSUPPORTED", f"Voice ID '{payload.voiceId}' is not supported.")

    # 4. Create the in-memory Job tracking entity
    job = job_service.create_job(
        text=payload.text,
        voice_id=payload.voiceId,
        accent=payload.accent,
        speed=payload.speed,
        output_format=payload.outputFormat
    )

    # 5. Register active job before enqueuing to prevent race condition limits bypass
    rate_limiter.register_active_job(client_ip, job.job_id)

    # 6. Try to enqueue the task into the bounded queue
    enqueued = queue_manager.try_enqueue_job(job.job_id)
    if not enqueued:
        # Cleanup registered states upon failure
        rate_limiter.deregister_active_job(client_ip, job.job_id)
        job.finalize_failure("QUEUE_FULL", "The task queue is currently full. Please try again later.")
        raise QueueFullException()

    resp = TtsJobResponse(
        jobId=job.job_id,
        accessToken=job.raw_access_token,
        status=job.status
    )
    job.raw_access_token = None
    return resp

@router.get("/tts/jobs/{jobId}", response_model=TtsJobStatusResponse)
def get_job_status(jobId: str, token: str = Depends(get_bearer_token)):
    """
    Returns the progress and status metadata of a specific job.
    Requires Bearer token authorization header validation.
    """
    job_service = JobService()
    # verify access in constant-time
    job = job_service.verify_job_access(jobId, token)

    download_url = None
    if job.status == "completed":
        download_url = f"/api/v1/tts/jobs/{jobId}/audio"

    return TtsJobStatusResponse(
        jobId=job.job_id,
        status=job.status,
        progressStage=job.progress_stage,
        createdAt=job.created_at.isoformat() + "Z",
        expiresAt=job.expires_at.isoformat() + "Z",
        durationSeconds=job.duration_seconds,
        characterCount=job.character_count,
        outputFormat=job.output_format,
        errorCode=job.error_code,
        errorMessage=job.error_message,
        downloadUrl=download_url
    )

@router.get("/tts/jobs/{jobId}/audio")
def download_audio_file(jobId: str, token: str = Depends(get_bearer_token)):
    """
    Serves the compiled audio file container (MP3 or WAV).
    Requires Bearer token authorization header validation.
    """
    job_service = JobService()
    # verify access in constant-time
    job = job_service.verify_job_access(jobId, token)

    if job.status != "completed" or not job.file_path:
        raise InvalidRequestException("INVALID_REQUEST", "Audio output is not available for this job state.")

    # Secure file path resolution (blocks traversal and inspects symlinks)
    path = Path(job.file_path)
    secure_path = resolve_secure_path(path.name)

    if not secure_path.exists():
        logger.error(f"File resolved but not found on disk: {secure_path.name}")
        raise InvalidRequestException("INVALID_REQUEST", "Requested audio file is missing from cache.")

    media_type = "audio/mpeg" if job.output_format == "mp3" else "audio/wav"
    short_id = jobId[:8]
    filename = f"konthora-speech-{short_id}.{job.output_format}"

    return FileResponse(
        path=str(secure_path),
        media_type=media_type,
        filename=filename,
        headers={
            "Cache-Control": "private, max-age=0, no-cache",
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
