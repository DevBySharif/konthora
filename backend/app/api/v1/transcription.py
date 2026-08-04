import asyncio
import json
import re
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Request, File, Form, UploadFile, Depends
from fastapi.responses import FileResponse, JSONResponse
from loguru import logger

from app.core.config import settings
from app.core.exceptions import (
    InvalidRequestException,
    QueueFullException,
    JobNotFoundException,
    JobExpiredException,
    UnauthorizedJobAccessException
)
from app.services.rate_limit_service import RateLimitService
from app.services.transcription_job_service import TranscriptionJobService
from app.core.transcription_queue import TranscriptionQueueManager
from app.services.media_service import MediaService
from app.utils.file_validation import validate_uploaded_file, SUPPORTED_EXTENSIONS
from app.utils.storage import resolve_secure_path
from app.schemas.transcription import (
    TranscriptionCapabilitiesResponse,
    TranscriptionJobCreateResponse,
    TranscriptionJobStatusResponse,
    StructuredTranscriptResponse
)

router = APIRouter()

# Public Auth Header helper
def get_bearer_token(request: Request) -> str:
    """Extracts bearer token from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise UnauthorizedJobAccessException()
    return auth_header[7:]

@router.get("/transcription/capabilities", response_model=TranscriptionCapabilitiesResponse)
def get_capabilities():
    """Authoritative API endpoint for transcription limits and formatting settings."""
    # Auto detect currently maps to English since we use small.en model.
    return TranscriptionCapabilitiesResponse(
        acceptedExtensions=list(SUPPORTED_EXTENSIONS),
        maximumFileSizeBytes=settings.TRANSCRIPTION_MAX_FILE_SIZE_MB * 1024 * 1024,
        maximumDurationSeconds=settings.TRANSCRIPTION_MAX_DURATION_SECONDS,
        supportedLanguages=[
            {"code": "auto", "name": "Auto Detect (English)"},
            {"code": "en", "name": "English"}
        ],
        timestampModes=["sentence", "paragraph", "word"],
        exportFormats=["txt", "srt", "vtt", "json"],
        wordTimestampsAvailable=settings.TRANSCRIPTION_WORD_TIMESTAMPS
    )

@router.post("/transcription/jobs", response_model=TranscriptionJobCreateResponse)
async def create_transcription_job(
    request: Request,
    file: UploadFile = File(...),
    language: str = Form("auto"),
    timestampMode: str = Form("sentence"),
    exportFormat: str = Form("txt")
):
    """
    Validates form parameters, enforces client limits, reserves a queue slot,
    streams the upload to a sandboxed directory, inspects the container, and enqueues processing.
    """
    # 1. Validate Form Arguments
    if language not in ["en", "auto"]:
        raise InvalidRequestException("LANGUAGE_UNSUPPORTED", f"Language '{language}' is not supported.")
    if timestampMode not in ["sentence", "paragraph", "word"]:
        raise InvalidRequestException("TIMESTAMP_MODE_INVALID", f"Timestamp mode '{timestampMode}' is invalid.")
    if exportFormat not in ["txt", "srt", "vtt", "json"]:
        raise InvalidRequestException("EXPORT_FORMAT_INVALID", f"Export format '{exportFormat}' is invalid.")

    rate_limiter = RateLimitService()
    job_service = TranscriptionJobService()
    queue_manager = TranscriptionQueueManager()
    media_service = MediaService()

    # 2. Rate Limits & Active Jobs Limit Checks
    client_ip = rate_limiter.get_client_ip(request)
    rate_limiter.check_transcription_rate_limit(client_ip)
    rate_limiter.check_transcription_active_jobs_limit(client_ip, settings.TRANSCRIPTION_ACTIVE_JOBS_PER_CLIENT)

    # 3. Reserve Queue Admission Slot
    if not await queue_manager.reserve_admission_slot():
        raise QueueFullException("The transcription queue is currently full. Please try again later.")

    # 4. Initialize job placeholder to get UUID
    job = job_service.create_job(
        original_filename=file.filename or "uploaded_media",
        file_size_bytes=0, # Updated after upload completes
        timestamp_mode=timestampMode,
        export_format=exportFormat
    )
    job_id = job.job_id
    rate_limiter.register_transcription_active_job(client_ip, job_id)

    # Resolve safe path: storage/transcription/<job-id>/
    job_dir = resolve_secure_path(f"transcription/{job_id}")
    job_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "media").suffix.lower()
    temp_part_path = job_dir / "upload.part"
    dest_path = job_dir / f"source{suffix}"

    total_bytes = 0
    max_bytes = settings.TRANSCRIPTION_MAX_FILE_SIZE_MB * 1024 * 1024

    try:
        # Stream file in 1MB chunks to upload.part
        job.progress_stage = "uploading"
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > max_bytes:
                raise InvalidRequestException("FILE_TOO_LARGE", f"File size exceeds the limit of {settings.TRANSCRIPTION_MAX_FILE_SIZE_MB} MB.")
            # Sync write chunk
            with open(temp_part_path, "ab") as f:
                f.write(chunk)

        job.file_size_bytes = total_bytes

        # Atomically rename .part to final source path
        if temp_part_path.exists():
            temp_part_path.rename(dest_path)

        # 5. File Ingestion validation (extension, MIME, signature)
        validate_uploaded_file(dest_path, file.filename or "uploaded_media", file.content_type or "")

        # 6. Authoritative Media Container inspection (FFprobe)
        job.progress_stage = "inspecting_media"
        loop = asyncio.get_running_loop()
        # Inspect media on thread executor
        info = await loop.run_in_executor(
            None,
            media_service.inspect_media,
            dest_path
        )

        # Populate duration and configure language check
        job.media_duration_seconds = info["duration"]
        job.detected_language = "en" # hardcode English under the small.en model

    except Exception as e:
        # Deregister and cleanup everything upon validation/upload errors
        await queue_manager.release_admission_slot()
        rate_limiter.deregister_transcription_active_job(client_ip, job_id)

        # Clean folder transcription/<job_id>
        import shutil
        if job_dir.exists():
            try:
                shutil.rmtree(job_dir)
            except Exception:
                pass

        # Register failure
        job.finalize_failure("VALIDATION_FAILED", str(e))

        if isinstance(e, InvalidRequestException):
            raise e
        raise InvalidRequestException("MEDIA_INSPECTION_FAILED", f"Media file is invalid: {e}")

    # 7. Queue job for processing
    job.status = "queued"
    job.progress_stage = "queued"
    await queue_manager.enqueue_job(job_id)

    return TranscriptionJobCreateResponse(
        jobId=job_id,
        accessToken=job.raw_access_token,
        status=job.status
    )

@router.get("/transcription/jobs/{jobId}", response_model=TranscriptionJobStatusResponse)
def get_job_status(jobId: str, request: Request):
    """Retrieves status and progress updates for a job. Requires Bearer authorization."""
    token = get_bearer_token(request)
    job_service = TranscriptionJobService()
    rate_limiter = RateLimitService()
    client_ip = rate_limiter.get_client_ip(request)

    # Retrieves job with expiration enforcement
    job = job_service.verify_job_access(jobId, token)

    # De-register active job from limit service if completed or failed
    if job.status in ["completed", "failed", "expired"]:
        rate_limiter.deregister_transcription_active_job(client_ip, jobId)

    result_url = None
    if job.status == "completed":
        result_url = f"/api/v1/transcription/jobs/{jobId}/result"

    return TranscriptionJobStatusResponse(
        jobId=job.job_id,
        status=job.status,
        progressStage=job.progress_stage,
        createdAt=job.created_at.isoformat(),
        expiresAt=job.expires_at.isoformat(),
        originalFileName=job.original_filename,
        fileSizeBytes=job.file_size_bytes,
        mediaDurationSeconds=job.media_duration_seconds,
        detectedLanguage=job.detected_language,
        languageProbability=job.language_probability,
        transcriptCharacterCount=job.transcript_character_count,
        segmentCount=job.segment_count,
        wordCount=job.word_count,
        timestampMode=job.timestamp_mode,
        exportFormat=job.export_format,
        resultUrl=result_url,
        errorCode=job.error_code,
        errorMessage=job.error_message
    )

@router.get("/transcription/jobs/{jobId}/transcript", response_model=StructuredTranscriptResponse)
def get_job_transcript(jobId: str, request: Request):
    """Returns the structured transcript preview from disk. Requires Bearer authorization."""
    token = get_bearer_token(request)
    job_service = TranscriptionJobService()
    job = job_service.verify_job_access(jobId, token)

    if job.status != "completed":
        raise InvalidRequestException("RESULT_NOT_READY", "The transcription result is not ready.")

    if not job.structured_json_path:
        raise JobNotFoundException("Structured transcript file is missing.")

    json_path = Path(job.structured_json_path)
    if not json_path.exists():
        logger.error(f"Structured JSON result missing on disk for completed job: {jobId}")
        raise JobNotFoundException("Structured transcript result file not found.")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(
            content=StructuredTranscriptResponse(**data).model_dump(),
            headers={"Cache-Control": "private, no-store"}
        )
    except Exception as e:
        logger.error(f"Failed to read/parse structured JSON for job {jobId}: {e}")
        raise InvalidRequestException("RESULT_CORRUPTED", "Failed to parse stored transcription result.")

@router.get("/transcription/jobs/{jobId}/result")
def get_job_result(jobId: str, request: Request):
    """Downloads the formatted export document from disk. Requires Bearer authorization."""
    token = get_bearer_token(request)
    job_service = TranscriptionJobService()
    job = job_service.verify_job_access(jobId, token)

    if job.status != "completed":
        raise InvalidRequestException("RESULT_NOT_READY", "The transcription result is not ready.")

    if not job.export_result_path:
        raise JobNotFoundException("Export result file is missing.")

    result_path = Path(job.export_result_path)
    if not result_path.exists():
        logger.error(f"Export result file missing on disk for completed job: {jobId}")
        raise JobNotFoundException("Export result file not found.")

    # Content type determination
    content_types = {
        "txt": "text/plain; charset=utf-8",
        "srt": "text/plain; charset=utf-8",
        "vtt": "text/vtt; charset=utf-8",
        "json": "application/json; charset=utf-8"
    }
    content_type = content_types.get(job.export_format, "application/octet-stream")

    # Sanitize and compile export filename (original basename + export extension)
    safe_name = Path(job.original_filename).stem
    # Replace unsafe characters
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', safe_name)
    export_filename = f"{safe_name}.{job.export_format}"

    return FileResponse(
        path=result_path,
        media_type=content_type,
        filename=export_filename,
        headers={
            "Content-Disposition": f"attachment; filename=\"{export_filename}\"",
            "Cache-Control": "private, no-store"
        }
    )
