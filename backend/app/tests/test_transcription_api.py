import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

from fastapi.testclient import TestClient
from app.services.transcription_job_service import TranscriptionJobService
from app.core.transcription_queue import TranscriptionQueueManager
from app.services.rate_limit_service import RateLimitService

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
