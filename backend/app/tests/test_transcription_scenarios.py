import pytest
import json
import subprocess
import asyncio
from pathlib import Path
from unittest.mock import MagicMock, patch

from app.services.media_service import MediaService
from app.services.transcription_service import TranscriptionService
from app.core.transcription_queue import TranscriptionQueueManager
from app.services.transcription_job_service import TranscriptionJobService
from app.core.exceptions import (
    MediaInspectionFailedException,
    AudioStreamMissingException,
    AudioExtractionFailedException,
    InvalidRequestException
)

def test_deceptive_extension_mismatch(tmp_path):
    from app.utils.file_validation import validate_uploaded_file

    # Save text as .wav (mismatch spoof)
    f = tmp_path / "spoof.wav"
    f.write_bytes(b"some malicious non-wav text contents")

    with pytest.raises(InvalidRequestException) as exc:
        validate_uploaded_file(f, "spoof.wav", "audio/wav")
    assert exc.value.code == "FILE_CONTENT_MISMATCH"

def test_ffprobe_timeout(tmp_path):
    media_service = MediaService()
    # Mock subprocess.run to raise TimeoutExpired
    with patch("subprocess.run", side_effect=subprocess.TimeoutExpired(cmd=["ffprobe"], timeout=15.0)):
        with pytest.raises(MediaInspectionFailedException) as exc:
            media_service.inspect_media(tmp_path / "source.mp3")
        assert "timed out" in exc.value.message

def test_ffmpeg_timeout(tmp_path):
    media_service = MediaService()
    # Mock subprocess.run to raise TimeoutExpired
    with patch("subprocess.run", side_effect=subprocess.TimeoutExpired(cmd=["ffmpeg"], timeout=120.0)):
        with pytest.raises(AudioExtractionFailedException) as exc:
            media_service.extract_audio(tmp_path / "source.mp3", tmp_path / "audio.wav")
        assert "timed out" in exc.value.message

def test_video_without_audio_stream():
    media_service = MediaService()

    # Mock return value of ffprobe process to contain only video streams
    mock_probe_data = {
        "streams": [
            {"codec_type": "video", "codec_name": "h264"}
        ],
        "format": {"duration": "10.0"}
    }

    with patch("subprocess.run") as mock_run:
        mock_proc = MagicMock()
        mock_proc.stdout = json.dumps(mock_probe_data).encode("utf-8")
        mock_run.return_value = mock_proc

        with pytest.raises(AudioStreamMissingException):
            media_service.inspect_media(Path("dummy_path.mp4"))

def test_silence_only_processing(tmp_path):
    # Setup job and temp directories
    job_service = TranscriptionJobService()
    job = job_service.create_job("silence.mp3", 1024, "sentence", "txt")
    job_id = job.job_id

    job_dir = Path("./test_storage/transcription") / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    source_file = job_dir / "source.mp3"
    source_file.write_bytes(b"dummy")

    # Mock components to return empty segments (silence)
    mock_info = {
        "duration": 5.0,
        "format": "mp3",
        "codec": "mp3",
        "channels": 1,
        "sample_rate": 16000
    }

    mock_whisper_result = {
        "detected_language": "en",
        "language_probability": 1.0,
        "duration": 5.0,
        "segments": [] # No speech segments
    }

    queue_mgr = TranscriptionQueueManager()

    with patch("app.services.media_service.MediaService.inspect_media", return_value=mock_info), \
         patch("app.services.media_service.MediaService.extract_audio"), \
         patch("app.services.transcription_service.TranscriptionService.transcribe_audio", return_value=mock_whisper_result):

        queue_mgr._process_job_sync(job_id)

        # Reload job
        updated_job = job_service.get_job(job_id)
        assert updated_job.status == "completed"
        assert updated_job.word_count == 0
        assert updated_job.segment_count == 0

        # Verify empty result and JSON files were written atomically
        export_file = Path(updated_job.export_result_path)
        assert export_file.exists()
        assert export_file.read_text(encoding="utf-8") == "No speech was detected."

        json_file = Path(updated_job.structured_json_path)
        assert json_file.exists()
        json_data = json.loads(json_file.read_text(encoding="utf-8"))
        assert json_data["fullText"] == ""
        assert len(json_data["segments"]) == 0

@pytest.mark.asyncio
async def test_queue_graceful_shutdown():
    queue_mgr = TranscriptionQueueManager()
    queue_mgr.start()
    assert queue_mgr._running is True
    assert len(queue_mgr._worker_tasks) > 0

    # Graceful stop
    await queue_mgr.stop()
    assert queue_mgr._running is False
    assert len(queue_mgr._worker_tasks) == 0
