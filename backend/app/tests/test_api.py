import time
from unittest.mock import patch, MagicMock
import pytest
from app.services.job_service import JobService
from app.services.rate_limit_service import RateLimitService

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert data["modelReady"] is False # Mocks start as ready False
    assert "queueDepth" in data
    # Safe check: no paths leaked
    assert "storage" not in str(data)
    assert "C:\\" not in str(data)

def test_health_head_endpoint(client):
    response = client.head("/api/v1/health")
    assert response.status_code == 200
    assert response.content == b""

def test_voices_list(client):
    response = client.get("/api/v1/tts/voices")
    assert response.status_code == 200
    voices = response.json()
    assert len(voices) > 0
    assert voices[0]["id"] == "af_heart"
    assert voices[0]["gender"] == "female"

def test_create_job_invalid_inputs(client):
    # Empty text
    response = client.post("/api/v1/tts/jobs", json={
        "text": "   ",
        "voiceId": "af_heart",
        "accent": "american",
        "speed": 1.0,
        "outputFormat": "mp3"
    })
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"

    # Text too long (> 2000 chars)
    response = client.post("/api/v1/tts/jobs", json={
        "text": "a" * 2001,
        "voiceId": "af_heart"
    })
    assert response.status_code == 400
    assert "too_long" in response.json()["message"] or "Validation failed" in response.json()["message"]

    # Unsupported format
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Hello World",
        "voiceId": "af_heart",
        "outputFormat": "ogg"
    })
    assert response.status_code == 400

    # Invalid speed range
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Hello World",
        "voiceId": "af_heart",
        "speed": 3.0
    })
    assert response.status_code == 400

def test_job_access_security(client):
    # Create a job
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Secure test message",
        "voiceId": "af_heart"
    })
    assert response.status_code == 200
    data = response.json()
    job_id = data["jobId"]
    token = data["accessToken"]

    # 1. Access without authorization header -> 401
    response = client.get(f"/api/v1/tts/jobs/{job_id}")
    assert response.status_code == 401

    # 2. Access with wrong token -> 401
    response = client.get(
        f"/api/v1/tts/jobs/{job_id}",
        headers={"Authorization": "Bearer wrong-token"}
    )
    assert response.status_code == 401

    # 3. Access with valid token -> 200
    response = client.get(
        f"/api/v1/tts/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "queued"

def test_cross_job_token_access(client):
    # Job 1
    res1 = client.post("/api/v1/tts/jobs", json={"text": "Script one", "voiceId": "af_heart"})
    job1_id = res1.json()["jobId"]
    job1_token = res1.json()["accessToken"]

    # Job 2
    res2 = client.post("/api/v1/tts/jobs", json={"text": "Script two", "voiceId": "af_heart"})
    job2_id = res2.json()["jobId"]

    # Try to access Job 2 status using Job 1 token
    res = client.get(
        f"/api/v1/tts/jobs/{job2_id}",
        headers={"Authorization": f"Bearer {job1_token}"}
    )
    # Returns 401 Unauthorized
    assert res.status_code == 401

def test_path_traversal_protection(client):
    # Setup mock job in database with traversal file path
    job_service = JobService()
    from datetime import datetime, timedelta, timezone
    job = job_service.create_job("text", "af_heart", "american", 1.0, "mp3")
    job.status = "completed"
    job.expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=1)
    job.file_path = "../../etc/passwd" # Traversal attempt simulation

    # Try download
    response = client.get(
        f"/api/v1/tts/jobs/{job.job_id}/audio",
        headers={"Authorization": f"Bearer {job.raw_access_token}"}
    )
    assert response.status_code == 400 # Blocked by resolve_secure_path
    assert response.json()["code"] == "INVALID_REQUEST"

def test_rate_limit_exceeded(client):
    # Submitting 6 jobs (limit is 5 requests per 10s in test env)
    for i in range(5):
        client.post("/api/v1/tts/jobs", json={"text": f"Request {i}", "voiceId": "af_heart"})

    # 6th request should fail with 429
    response = client.post("/api/v1/tts/jobs", json={"text": "Exceeding request", "voiceId": "af_heart"})
    assert response.status_code == 429
    assert response.json()["code"] == "RATE_LIMITED"

def test_queue_full_protection(client):
    # Mock try_enqueue_job to return False (simulating queue full)
    with patch("app.core.queue.TtsQueueManager.try_enqueue_job", return_value=False):
        response = client.post("/api/v1/tts/jobs", json={"text": "Queue full test", "voiceId": "af_heart"})
        assert response.status_code == 503
        assert response.json()["code"] == "QUEUE_FULL"

def test_ffmpeg_encoder_unavailability_error(client):
    # Mock FFmpeg availability check to return False
    with patch("app.services.audio_service.AudioService.is_ffmpeg_available", return_value=False):
        # We manually process a job through the worker queue using mock
        # When audio_service is mocked, if FFmpeg is not found, MP3 request falls back to WAV
        job_service = JobService()
        job = job_service.create_job("Convert text", "af_heart", "american", 1.0, "mp3")

        # Test download endpoint throws 400 when file doesn't exist
        response = client.get(
            f"/api/v1/tts/jobs/{job.job_id}/audio",
            headers={"Authorization": f"Bearer {job.raw_access_token}"}
        )
        assert response.status_code == 400
