import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

from fastapi.testclient import TestClient
from app.services.transcription_job_service import TranscriptionJobService
from app.core.transcription_queue import TranscriptionQueueManager
from app.services.rate_limit_service import RateLimitService


@pytest.fixture
def completed_transcription_job(tmp_path):
    job_service = TranscriptionJobService()
    job = job_service.create_job("example audio.mp3", 2048, "sentence", "txt")
    structured_result = {
        "schemaVersion": "1.0",
        "jobId": job.job_id,
        "fullText": "Welcome to Konthora.",
        "durationSeconds": 2.5,
        "detectedLanguage": "en",
        "languageProbability": 0.99,
        "segments": [
            {
                "id": 0,
                "text": "Welcome to Konthora.",
                "start": 0.0,
                "end": 2.5,
                "words": [],
            }
        ],
        "words": [],
    }
    structured_path = tmp_path / "transcript.json"
    structured_path.write_text(json.dumps(structured_result), encoding="utf-8")
    job.finalize_success(
        structured_json_path=str(structured_path),
        export_result_path=str(tmp_path / "result.txt"),
        duration=2.5,
        detected_language="en",
        language_probability=0.99,
        word_count=3,
        segment_count=1,
        char_count=20,
    )
    return job

def test_capabilities_endpoint(client):
    response = client.get("/api/v1/transcription/capabilities")
    assert response.status_code == 200
    data = response.json()
    assert "acceptedExtensions" in data
    assert "maximumFileSizeBytes" in data
    assert "supportedLanguages" in data
    assert "exportFormats" in data
    assert "timestampModes" in data

def test_unauthorized_job_access(client):
    # Retrieve non-existing job
    response = client.get("/api/v1/transcription/jobs/some-uuid")
    assert response.status_code == 401 # Bearer missing

    # Retrieve with wrong bearer format
    response = client.get("/api/v1/transcription/jobs/some-uuid", headers={"Authorization": "Basic 123"})
    assert response.status_code == 401

    # Retrieve with invalid token
    response = client.get("/api/v1/transcription/jobs/some-uuid", headers={"Authorization": "Bearer badtoken"})
    assert response.status_code == 404 # Treated as 404 since job doesn't exist

def test_job_retrieval_flow(client):
    job_service = TranscriptionJobService()
    job = job_service.create_job("test_file.mp3", 2048, "sentence", "txt")
    job_id = job.job_id
    token = job.raw_access_token

    # Authorized status check
    response = client.get(
        f"/api/v1/transcription/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["jobId"] == job_id
    assert data["status"] == "queued"
    assert data["originalFileName"] == "test_file.mp3"


@pytest.mark.parametrize(
    ("export_format", "content_type", "signature"),
    [
        ("txt", "text/plain", "Welcome to Konthora."),
        ("srt", "application/x-subrip", "00:00:00,000 --> 00:00:02,500"),
        ("vtt", "text/vtt", "WEBVTT"),
        ("json", "application/json", '"segments"'),
    ],
)
def test_completed_job_exports_requested_format(
    client, completed_transcription_job, export_format, content_type, signature
):
    job = completed_transcription_job
    response = client.get(
        f"/api/v1/transcription/jobs/{job.job_id}/result?format={export_format}",
        headers={"Authorization": f"Bearer {job.raw_access_token}"},
    )

    assert response.status_code == 200
    assert content_type in response.headers["content-type"]
    assert f'filename="example_audio.{export_format}"' in response.headers["content-disposition"]
    assert signature in response.text

    if export_format == "json":
        assert json.loads(response.text)["segments"][0]["text"] == "Welcome to Konthora."
    elif export_format in {"srt", "vtt"}:
        assert response.text != "[00:00]\nWelcome to Konthora.\n"

def test_active_jobs_limit(client):
    rate_limiter = RateLimitService()
    client_ip = "192.168.1.50"

    # Register active job
    rate_limiter.register_transcription_active_job(client_ip, "job-1")

    # Check concurrent job limit (limit is 1 for guests)
    with pytest.raises(Exception) as exc:
        rate_limiter.check_transcription_active_jobs_limit(client_ip, max_active=1)
    assert "active transcription job" in str(exc.value)

    # Deregister
    rate_limiter.deregister_transcription_active_job(client_ip, "job-1")
    # Should pass now
    rate_limiter.check_transcription_active_jobs_limit(client_ip, max_active=1)

@pytest.mark.asyncio
async def test_queue_slots_release():
    queue_mgr = TranscriptionQueueManager()

    # Wipe queue state and slots
    queue_mgr._queue = asyncio_queue = MagicMock()
    queue_mgr._queue.qsize.return_value = 0
    queue_mgr._active_slots = 0

    # Reserve slot
    reserved = await queue_mgr.reserve_admission_slot()
    assert reserved
    assert queue_mgr._active_slots == 1

    # Release slot
    await queue_mgr.release_admission_slot()
    assert queue_mgr._active_slots == 0

def test_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "transcriptionModelReady" in data
    assert "transcriptionModelStatus" in data
    assert "transcriptionQueueDepth" in data
