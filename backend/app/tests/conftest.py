import pytest
import os
import shutil
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import numpy as np
from pathlib import Path

# Setup environment variables for testing
os.environ["APP_ENV"] = "testing"
os.environ["TTS_STORAGE_ROOT"] = "./test_storage"
os.environ["TTS_MAX_QUEUE_SIZE"] = "2"
os.environ["TTS_RATE_LIMIT_REQUESTS"] = "5"
os.environ["TTS_RATE_LIMIT_WINDOW_SECONDS"] = "10"

from app.main import app
from app.services.job_service import JobService
from app.services.rate_limit_service import RateLimitService

@pytest.fixture(autouse=True)
def clean_test_storage():
    """Wipes test storage directory between runs."""
    test_storage = Path("./test_storage").resolve()
    if test_storage.exists():
        shutil.rmtree(test_storage)
    test_storage.mkdir(parents=True, exist_ok=True)
    yield
    if test_storage.exists():
        shutil.rmtree(test_storage)

@pytest.fixture(autouse=True)
def reset_in_memory_states():
    """Resets the singleton in-memory registries for jobs, rate limits, and task queue between tests."""
    JobService()._jobs.clear()

    from app.services.transcription_job_service import TranscriptionJobService
    TranscriptionJobService()._jobs.clear()

    limiter = RateLimitService()
    limiter._request_history.clear()
    limiter._active_jobs.clear()
    limiter._trans_request_history.clear()
    limiter._trans_active_jobs.clear()

    from app.core.queue import TtsQueueManager
    queue_manager = TtsQueueManager()
    while not queue_manager._queue.empty():
        try:
            queue_manager._queue.get_nowait()
            queue_manager._queue.task_done()
        except Exception:
            break

    from app.core.transcription_queue import TranscriptionQueueManager
    trans_queue = TranscriptionQueueManager()
    trans_queue._active_slots = 0
    while not trans_queue._queue.empty():
        try:
            trans_queue._queue.get_nowait()
            trans_queue._queue.task_done()
        except Exception:
            break

    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def mock_kokoro_service(request):
    """Mocks Kokoro inference model loading and synthesis to prevent downloading weights."""
    if "integration" in request.node.nodeid:
        yield
        return

    with patch("app.services.kokoro_service.KokoroService.load_pipeline") as mock_load, \
         patch("app.services.kokoro_service.KokoroService.synthesize_chunk") as mock_synth:

        mock_load.return_value = MagicMock()
        # Returns a 1-second mock silent waveform (24000 samples)
        mock_synth.return_value = np.zeros(24000, dtype=np.float32)

        yield mock_load, mock_synth

@pytest.fixture(autouse=True)
def mock_audio_service(request):
    """Mocks FFmpeg converter execution and checks."""
    if "integration" in request.node.nodeid:
        yield
        return

    with patch("app.services.audio_service.AudioService._discover_ffmpeg") as mock_discover, \
         patch("app.services.audio_service.AudioService.convert_wav_to_mp3") as mock_convert:

        mock_discover.return_value = (True, "mock-ffmpeg")

        # Define a mock converter that writes a dummy 10-byte file
        def fake_convert(wav_path, mp3_path):
            Path(mp3_path).write_bytes(b"MOCK_MP3_DATA")

        mock_convert.side_effect = fake_convert

        yield mock_discover, mock_convert
