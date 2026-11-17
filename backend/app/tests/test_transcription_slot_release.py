"""H4 regression: a transcription concurrency slot must be released by the
worker when the job finishes — success or failure — not when (or if) the
client next polls status.

The slot is registered at upload time (`register_transcription_active_job`)
and the per-IP cap is 1, so a client that never polls held its only slot
until the job record expired (60 min). TTS already deregisters in the
worker's finally block; the transcription worker must do the same.
"""

from pathlib import Path
from unittest.mock import patch

from app.core.transcription_queue import TranscriptionQueueManager
from app.services.rate_limit_service import RateLimitService
from app.services.transcription_job_service import TranscriptionJobService

CLIENT_IP = "203.0.113.9"

_MOCK_INFO = {
    "duration": 5.0,
    "format": "mp3",
    "codec": "mp3",
    "channels": 1,
    "sample_rate": 16000,
}

_MOCK_WHISPER_RESULT = {
    "detected_language": "en",
    "language_probability": 1.0,
    "duration": 5.0,
    "segments": [
        {
            "text": "hello world",
            "start": 0.0,
            "end": 1.0,
            "words": [{"word": "hello", "start": 0.0, "end": 0.5}],
        }
    ],
}


def _stage_job():
    """Create a job with a source file on disk, as the upload endpoint does."""
    job_service = TranscriptionJobService()
    job = job_service.create_job("meeting.mp3", 1024, "sentence", "txt")
    job_dir = Path("./test_storage/transcription") / job.job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    (job_dir / "source.mp3").write_bytes(b"dummy")
    return job


def _slot_held(job_id):
    return job_id in RateLimitService()._trans_active_jobs.get(CLIENT_IP, set())


def test_slot_released_on_worker_success():
    job = _stage_job()
    RateLimitService().register_transcription_active_job(CLIENT_IP, job.job_id)
    assert _slot_held(job.job_id)

    queue_mgr = TranscriptionQueueManager()
    with patch(
        "app.services.media_service.MediaService.inspect_media",
        return_value=_MOCK_INFO,
    ), patch("app.services.media_service.MediaService.extract_audio"), patch(
        "app.services.transcription_service.TranscriptionService.transcribe_audio",
        return_value=_MOCK_WHISPER_RESULT,
    ):
        queue_mgr._process_job_sync(job.job_id)

    assert TranscriptionJobService().get_job(job.job_id).status == "completed"
    assert not _slot_held(job.job_id)


def test_slot_released_on_worker_failure():
    job = _stage_job()
    RateLimitService().register_transcription_active_job(CLIENT_IP, job.job_id)
    assert _slot_held(job.job_id)

    queue_mgr = TranscriptionQueueManager()
    with patch(
        "app.services.media_service.MediaService.inspect_media",
        return_value=_MOCK_INFO,
    ), patch("app.services.media_service.MediaService.extract_audio"), patch(
        "app.services.transcription_service.TranscriptionService.transcribe_audio",
        side_effect=RuntimeError("whisper exploded"),
    ):
        queue_mgr._process_job_sync(job.job_id)

    assert TranscriptionJobService().get_job(job.job_id).status == "failed"
    assert not _slot_held(job.job_id)


def test_slot_released_when_job_record_missing():
    """The worker cannot find the job (e.g. storage wiped mid-flight): the
    slot registered at upload time must still be released, not leaked."""
    job_id = "no-such-job-id"
    RateLimitService().register_transcription_active_job(CLIENT_IP, job_id)
    assert _slot_held(job_id)

    TranscriptionQueueManager()._process_job_sync(job_id)

    assert not _slot_held(job_id)
