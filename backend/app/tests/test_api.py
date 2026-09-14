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
    assert voices[0]["engine"] == "kokoro"
    assert voices[0]["previewUrl"] == "/audio/voice-previews/af_heart.mp3"
    for voice in voices:
        assert voice["previewUrl"].endswith(f"{voice['id']}.mp3")

def test_create_job_invalid_inputs(client):
    # Empty text
    response = client.post("/api/v1/tts/jobs", json={
        "text": "   ",
        "voiceId": "af_heart",
        "accent": "American English",
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

    # Pause controls stay inside their bounded API ranges
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Hello World",
        "voiceId": "af_heart",
        "sentencePauseMs": 1001,
        "paragraphPauseMs": 2001,
    })
    assert response.status_code == 400

def test_create_job_advanced_controls(client):
    exact_response = client.post("/api/v1/tts/jobs", json={
        "text": "Exact production pause values.",
        "voiceId": "af_heart",
        "sentencePauseMs": 220,
        "paragraphPauseMs": 500,
    })
    assert exact_response.status_code == 200
    exact_job = JobService().get_job(exact_response.json()["jobId"])
    assert exact_job.sentence_pause_ms == 220
    assert exact_job.paragraph_pause_ms == 500

    custom_response = client.post("/api/v1/tts/jobs", json={
        "text": "Dr. Smith has 25%.",
        "voiceId": "af_heart",
        "sentencePauseMs": 350,
        "paragraphPauseMs": 900,
        "normalizeText": False,
    })
    assert custom_response.status_code == 200
    custom_job = JobService().get_job(custom_response.json()["jobId"])
    assert custom_job.sentence_pause_ms == 350
    assert custom_job.paragraph_pause_ms == 900
    assert custom_job.normalize_text is False


def test_create_job_advanced_control_defaults_remain_backwards_compatible(client):
    default_response = client.post("/api/v1/tts/jobs", json={
        "text": "Existing clients omit advanced controls.",
        "voiceId": "af_heart",
    })
    assert default_response.status_code == 200
    default_job = JobService().get_job(default_response.json()["jobId"])

    from app.core.config import settings
    assert default_job.sentence_pause_ms == settings.TTS_SENTENCE_PAUSE_MS
    assert default_job.paragraph_pause_ms == settings.TTS_PARAGRAPH_PAUSE_MS
    assert default_job.normalize_text is True


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
    job = job_service.create_job("text", "af_heart", "American English", 1.0, "mp3")
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
        job = job_service.create_job("Convert text", "af_heart", "American English", 1.0, "mp3")

        # Test download endpoint throws 400 when file doesn't exist
        response = client.get(
            f"/api/v1/tts/jobs/{job.job_id}/audio",
            headers={"Authorization": f"Bearer {job.raw_access_token}"}
        )
        assert response.status_code == 400

def test_hf_space_rate_limit_and_worker_caps():
    from app.core.config import Settings
    # Verify class model field defaults directly
    fields = Settings.model_fields
    assert fields["TRANSCRIPTION_RATE_LIMIT_PER_HOUR"].default == 15
    assert fields["TRANSCRIPTION_MAX_CONCURRENT_PER_IP"].default == 1
    assert fields["TTS_RATE_LIMIT_PER_HOUR"].default == 30
    assert fields["TTS_MAX_CONCURRENT_PER_IP"].default == 2
    assert fields["TTS_WORKER_COUNT"].default == 1
    assert fields["TRANSCRIPTION_WORKER_COUNT"].default == 1

def test_dev_bypass_secret_config():
    from app.core.config import Settings
    fields = Settings.model_fields
    assert "DEV_BYPASS_SECRET" in fields
    assert fields["DEV_BYPASS_SECRET"].default == ""

def test_dev_bypass_rate_limiting(client):
    rate_limiter = RateLimitService()
    test_ip = "192.168.100.99"

    with patch("app.core.config.settings.DEV_BYPASS_SECRET", "super-secret-bypass-token"):
        # Without header, should hit rate limit
        rate_limiter._request_history[test_ip] = [time.time()] * 100
        with pytest.raises(Exception):
            rate_limiter.check_tts_rate_limit(test_ip)

        # With wrong bypass key, should still hit rate limit
        with pytest.raises(Exception):
            rate_limiter.check_tts_rate_limit(test_ip, bypass_key="wrong-key")

        # With matching bypass key, passes without error
        rate_limiter.check_tts_rate_limit(test_ip, bypass_key="super-secret-bypass-token")

        # Check active jobs bypass for TTS
        rate_limiter._active_jobs[test_ip] = {"job1", "job2", "job3", "job4"}
        with pytest.raises(Exception):
            rate_limiter.check_tts_active_jobs_limit(test_ip, max_active=2)
        rate_limiter.check_tts_active_jobs_limit(test_ip, max_active=2, bypass_key="super-secret-bypass-token")

        # Check transcription rate limit bypass
        rate_limiter._trans_request_history[test_ip] = [time.time()] * 100
        with pytest.raises(Exception):
            rate_limiter.check_transcription_rate_limit(test_ip)
        rate_limiter.check_transcription_rate_limit(test_ip, bypass_key="super-secret-bypass-token")

        # Check transcription active jobs bypass
        rate_limiter._trans_active_jobs[test_ip] = {"tjob1", "tjob2"}
        with pytest.raises(Exception):
            rate_limiter.check_transcription_active_jobs_limit(test_ip, max_active=1)
        rate_limiter.check_transcription_active_jobs_limit(test_ip, max_active=1, bypass_key="super-secret-bypass-token")

def test_dev_bypass_endpoint_header(client):
    rate_limiter = RateLimitService()
    # Artificially exhaust client limit for testclient IP
    for ip in ["testclient", "127.0.0.1"]:
        rate_limiter._request_history[ip] = [time.time()] * 100

    with patch("app.core.config.settings.DEV_BYPASS_SECRET", "developer-secret-xyz"):
        # Normal request fails with 429
        response = client.post("/api/v1/tts/jobs", json={"text": "Rate limited test", "voiceId": "af_heart"})
        assert response.status_code == 429

        # Request with X-Dev-Bypass-Key bypasses and succeeds (200)
        bypassed_resp = client.post(
            "/api/v1/tts/jobs",
            json={"text": "Bypassed test", "voiceId": "af_heart"},
            headers={"X-Dev-Bypass-Key": "developer-secret-xyz"}
        )
        assert bypassed_resp.status_code == 200
        assert "jobId" in bypassed_resp.json()
