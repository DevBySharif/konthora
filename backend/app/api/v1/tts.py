from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from loguru import logger

from app.schemas.tts import TtsJobCreate, TtsJobResponse, TtsJobStatusResponse, VoiceInfo
from app.services.edge_tts_service import EdgeTTSService
from app.services.job_service import JobService
from app.services.kokoro_service import KokoroService
from app.services.rate_limit_service import RateLimitService
from app.core.config import settings
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

def _served_voices():
    """
    The full catalogue the workspace may offer: all Kokoro voices, plus
    Edge voices ONLY while Edge is reachable (cached availability probe).
    When Edge is down, its voices are simply absent — the user never sees
    a voice that cannot generate.
    """
    voices = KokoroService().get_voices()
    if EdgeTTSService().is_available():
        voices = voices + EdgeTTSService().get_voices()
    return voices


@router.get("/tts/voices", response_model=List[VoiceInfo])
def get_voices():
    """Returns the served voice catalogue (Kokoro + Edge when available)."""
    return _served_voices()

# One-sentence preview line per language, keyed by the voice's language-code
# prefix (e.g. 'bn' for bn-BD, 'en' for en-US). The user hears the voice in
# its own language before spending a job on it. Unknown prefixes fall back
# to the English line.
_PREVIEW_LINES = {
    "en": "Welcome to Konthora. This is how my voice sounds.",
    "bn": "কণ্ঠরায় স্বাগতম। আমার কণ্ঠস্বর এমন শোনায়।",
    "hi": "कंठोरा में आपका स्वागत है। मेरी आवाज़ ऐसी सुनाई देती है।",
    "es": "Bienvenido a Konthora. Así suena mi voz.",
    "fr": "Bienvenue sur Konthora. Voici comment sonne ma voix.",
    "it": "Benvenuto su Konthora. Ecco come suona la mia voce.",
    "pt": "Bem-vindo ao Konthora. É assim que soa a minha voz.",
}


@router.get("/tts/preview/{voice_id}")
def get_voice_preview(voice_id: str, request: Request):
    """
    Serves a short listen-before-you-generate preview clip for one Edge
    voice. The clip is synthesized once (one sentence, in the voice's own
    language) and then cached on disk at {TTS_STORAGE_ROOT}/previews/
    {voice_id}.mp3. Previews have their own rate-limit bucket (120/hr)
    and never consume the TTS job quota.
    """
    rate_limiter = RateLimitService()
    client_ip = rate_limiter.get_client_ip(request)

    # 1. Own rate-limit bucket (previews are cheap; jobs keep their 30/hr).
    rate_limiter.check_preview_rate_limit(client_ip, request=request)

    # 2. Validate against the SERVED catalogue. Kokoro voices have no
    #    on-demand preview (they are served from static clips elsewhere),
    #    so anything that is not an Edge voice is a 404 here.
    voices = _served_voices()
    voice = next((v for v in voices if v["id"] == voice_id), None)
    if voice is None or voice["engine"] != "edge":
        raise TtsException(
            "VOICE_UNSUPPORTED",
            f"Voice ID '{voice_id}' is not supported.",
            status_code=404,
        )

    # 3. Edge must actually be up right now (its voices can linger in the
    #    catalogue while the availability cache is still warm).
    edge = EdgeTTSService()
    if not edge.is_available():
        raise TtsException(
            "SERVICE_UNAVAILABLE",
            "Edge voice previews are currently unavailable.",
            status_code=503,
        )

    # 4. Serve from the disk cache when present, otherwise synthesize once
    #    and cache. The voice_id comes from the served catalogue, and
    #    resolve_secure_path additionally blocks any traversal.
    cache_path = resolve_secure_path(f"previews/{voice_id}.mp3")
    if cache_path.exists():
        audio = cache_path.read_bytes()
    else:
        language = voice.get("language") or ""
        lang_prefix = language.split("-")[0].lower() if language else "en"
        preview_text = _PREVIEW_LINES.get(lang_prefix, _PREVIEW_LINES["en"])
        audio = edge.synthesize(preview_text, voice_id, 1.0)
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_bytes(audio)

    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "public, max-age=86400"},
    )

@router.post("/tts/jobs", response_model=TtsJobResponse)
def create_tts_job(payload: TtsJobCreate, request: Request):
    """
    Creates a speech synthesis job, runs rate limits and queue capacity checks,
    registers active tasks, and enqueues work.
    """
    rate_limiter = RateLimitService()
    job_service = JobService()
    queue_manager = TtsQueueManager()

    client_ip = rate_limiter.get_client_ip(request)

    # 1. Enforce requests-per-hour rate limits
    rate_limiter.check_tts_rate_limit(client_ip, request=request)

    # 2. Enforce active jobs capacity per client IP
    rate_limiter.check_tts_active_jobs_limit(client_ip, max_active=settings.TTS_MAX_CONCURRENT_PER_IP, request=request)

    # 3. Validate voice selection against the SERVED catalog (Kokoro + Edge
    #    only when available). The engine and accent are taken from the voice
    #    itself — server-authoritative, so a stale client cannot smuggle in a
    #    mismatched engine or an accent the voice does not have.
    voices = _served_voices()
    voice = next((v for v in voices if v["id"] == payload.voiceId), None)
    if voice is None:
        raise InvalidRequestException("VOICE_UNSUPPORTED", f"Voice ID '{payload.voiceId}' is not supported.")
    if payload.engine != "kokoro" and payload.engine != voice["engine"]:
        raise InvalidRequestException(
            "VOICE_UNSUPPORTED",
            f"Voice ID '{payload.voiceId}' is a {voice['engine']} voice, not '{payload.engine}'.",
        )

    # 4. Create the in-memory Job tracking entity
    job = job_service.create_job(
        text=payload.text,
        voice_id=payload.voiceId,
        accent=voice["accent"],
        speed=payload.speed,
        output_format=payload.outputFormat,
        sentence_pause_ms=payload.sentencePauseMs,
        paragraph_pause_ms=payload.paragraphPauseMs,
        normalize_text=payload.normalizeText,
        engine=voice["engine"],
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

@router.api_route("/tts/jobs/{jobId}/audio", methods=["GET", "HEAD"])
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
