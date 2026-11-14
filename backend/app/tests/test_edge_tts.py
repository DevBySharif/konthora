"""Edge TTS engine tests: catalogue mapping, availability gating, job routing."""
import asyncio

from app.core.exceptions import TtsException
from app.core.queue import TtsQueueManager
from app.services.edge_tts_service import EdgeTTSService, _map_locale, _map_voice
from app.services.job_service import JobService

# Mapped VoiceInfo dicts as the API would serve them when Edge is available.
EDGE_VOICES = [
    {
        "id": "en-US-AndrewNeural",
        "displayName": "Andrew (Male)",
        "gender": "male",
        "accent": "English (United States)",
        "language": "en-US",
        "recommended": True,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25,
        "engine": "edge",
        "previewUrl": "",
    },
    {
        "id": "bn-BD-NabanitaNeural",
        "displayName": "Nabanita (Female)",
        "gender": "female",
        "accent": "Bengali (Bangladesh)",
        "language": "bn-BD",
        "recommended": True,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25,
        "engine": "edge",
        "previewUrl": "",
    },
]


def _make_edge_available(monkeypatch):
    """Re-patches the autouse Edge mock so Edge looks healthy for this test."""
    monkeypatch.setattr(
        EdgeTTSService, "is_available", lambda self: True
    )
    monkeypatch.setattr(
        EdgeTTSService, "get_voices", lambda self: list(EDGE_VOICES)
    )
    monkeypatch.setattr(
        EdgeTTSService, "get_voice",
        lambda self, voice_id: next(
            (v for v in EDGE_VOICES if v["id"] == voice_id), None
        ),
    )


def _run_worker(job_id: str):
    """
    Drives the worker for one job directly. The app lifespan deliberately
    does NOT start queue workers when APP_ENV == "testing", so a job would
    sit in the queue forever in tests — the background loop is not the thing
    under test here, the engine branch inside _process_job is.
    """
    asyncio.run(TtsQueueManager()._process_job(job_id))


# ── catalogue mapping (unit) ───────────────────────────────────────────────

def test_map_locale():
    assert _map_locale("en-US") == "en-US"
    assert _map_locale("hi-IN") == "hi-IN"
    assert _map_locale("pt-BR") == "pt-BR"
    assert _map_locale("es-ES") == "es"
    assert _map_locale("es-MX") == "es"
    assert _map_locale("fr-FR") == "fr-FR"
    assert _map_locale("it-IT") == "it"
    assert _map_locale("bn-BD") == "bn-BD"
    assert _map_locale("bn-IN") == "bn-BD"
    # Locales the workspace picker has no entry for are dropped.
    assert _map_locale("en-GB") is None
    assert _map_locale("de-DE") is None
    assert _map_locale("ja-JP") is None


def test_map_voice():
    raw = {
        "ShortName": "bn-BD-NabanitaNeural",
        "Gender": "Female",
        "Locale": "bn-BD",
        "LocaleName": "Bengali (Bangladesh)",
    }
    voice = _map_voice(raw)
    assert voice["id"] == "bn-BD-NabanitaNeural"
    assert voice["displayName"] == "Nabanita (Female)"
    assert voice["language"] == "bn-BD"
    assert voice["accent"] == "Bengali (Bangladesh)"
    assert voice["engine"] == "edge"
    assert voice["previewUrl"] == ""
    assert voice["recommended"] is True

    # Multilingual suffix is stripped from the display name.
    ava = _map_voice({
        "ShortName": "en-US-AvaMultilingualNeural",
        "Gender": "Female",
        "Locale": "en-US",
        "LocaleName": "English (United States)",
    })
    assert ava["displayName"] == "Ava (Female)"

    # Unsupported locales are dropped entirely.
    assert _map_voice({
        "ShortName": "en-GB-SoniaNeural",
        "Gender": "Female",
        "Locale": "en-GB",
        "LocaleName": "English (United Kingdom)",
    }) is None


# ── availability gating (API) ──────────────────────────────────────────────

def test_voices_exclude_edge_when_unavailable(client):
    response = client.get("/api/v1/tts/voices")
    assert response.status_code == 200
    voices = response.json()
    assert all(v["engine"] == "kokoro" for v in voices)
    assert voices[0]["id"] == "af_heart"


def test_voices_include_edge_when_available(client, monkeypatch):
    _make_edge_available(monkeypatch)
    response = client.get("/api/v1/tts/voices")
    assert response.status_code == 200
    voices = response.json()
    edge = [v for v in voices if v["engine"] == "edge"]
    assert len(edge) == 2
    assert edge[0]["id"] == "en-US-AndrewNeural"
    assert edge[1]["id"] == "bn-BD-NabanitaNeural"
    # Kokoro voices still come first, unchanged.
    assert voices[0]["id"] == "af_heart"


def test_health_reports_edge_unavailable(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["edgeTtsAvailable"] is False


def test_health_reports_edge_available(client, monkeypatch):
    _make_edge_available(monkeypatch)
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["edgeTtsAvailable"] is True


# ── job routing (API + worker) ─────────────────────────────────────────────

def test_create_edge_job_completes(client, monkeypatch):
    _make_edge_available(monkeypatch)
    response = client.post("/api/v1/tts/jobs", json={
        "text": "আমি বাংলায় কথা বলতে পারি।",
        "voiceId": "bn-BD-NabanitaNeural",
        "engine": "edge",
        "accent": "Bengali (Bangladesh)",
        "speed": 1.0,
        "outputFormat": "mp3",
    })
    assert response.status_code == 200, response.json()
    job_id = response.json()["jobId"]
    token = response.json()["accessToken"]

    job = JobService().get_job(job_id)
    assert job.engine == "edge"
    assert job.accent == "Bengali (Bangladesh)"

    _run_worker(job_id)

    status = client.get(
        f"/api/v1/tts/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    assert status["status"] == "completed"
    assert status["downloadUrl"] is not None

    audio = client.get(
        f"/api/v1/tts/jobs/{job_id}/audio",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert audio.status_code == 200
    assert audio.content == b"FAKE_EDGE_MP3"


def test_create_edge_job_when_unavailable(client):
    # Default mock: Edge down, so its voices are not in the served catalogue.
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Hello.",
        "voiceId": "bn-BD-NabanitaNeural",
        "engine": "edge",
        "accent": "Bengali (Bangladesh)",
        "speed": 1.0,
        "outputFormat": "mp3",
    })
    assert response.status_code == 400
    assert response.json()["code"] == "VOICE_UNSUPPORTED"


def test_create_job_engine_mismatch(client, monkeypatch):
    _make_edge_available(monkeypatch)
    # A Kokoro voice submitted as an Edge job must be rejected.
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Hello.",
        "voiceId": "af_heart",
        "engine": "edge",
        "accent": "American English",
        "speed": 1.0,
        "outputFormat": "mp3",
    })
    assert response.status_code == 400
    assert response.json()["code"] == "VOICE_UNSUPPORTED"


def test_kokoro_job_unaffected_by_engine_default(client):
    # Omitting `engine` still routes a Kokoro voice through Kokoro.
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Hello.",
        "voiceId": "af_heart",
        "accent": "American English",
        "speed": 1.0,
        "outputFormat": "mp3",
    })
    assert response.status_code == 200
    job = JobService().get_job(response.json()["jobId"])
    assert job.engine == "kokoro"


def _failing_synthesize(self, *args, **kwargs):
    raise TtsException("EDGE_TTS_FAILED", "Edge is down")


def test_edge_job_fails_cleanly_when_synthesis_fails(client, monkeypatch):
    _make_edge_available(monkeypatch)
    monkeypatch.setattr(EdgeTTSService, "synthesize", _failing_synthesize)
    response = client.post("/api/v1/tts/jobs", json={
        "text": "Hello.",
        "voiceId": "en-US-AndrewNeural",
        "engine": "edge",
        "accent": "English (United States)",
        "speed": 1.0,
        "outputFormat": "mp3",
    })
    assert response.status_code == 200
    job_id = response.json()["jobId"]
    token = response.json()["accessToken"]

    _run_worker(job_id)

    status = client.get(
        f"/api/v1/tts/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    assert status["status"] == "failed"
    assert status["errorCode"] == "EDGE_TTS_FAILED"
