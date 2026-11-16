"""Edge TTS engine tests: catalogue mapping, availability gating, job routing."""
import asyncio
import shutil
import subprocess

import pytest
import websockets.asyncio.client
from websockets.exceptions import ConnectionClosed

from app.core.exceptions import TtsException
from app.core.queue import TtsQueueManager
from app.services.edge_tts_service import EdgeTTSService, _map_locale, _map_voice
from app.services.job_service import JobService

# The autouse fixture patches EdgeTTSService.synthesize; tests that exercise
# the real synthesize()/validation path restore this reference.
_REAL_SYNTHESIZE = EdgeTTSService.synthesize

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

    # Multilingual twins keep a ' Multilingual' marker so their display
    # name stays distinct from the plain Neural twin's ("Ava (Female)").
    ava = _map_voice({
        "ShortName": "en-US-AvaMultilingualNeural",
        "Gender": "Female",
        "Locale": "en-US",
        "LocaleName": "English (United States)",
    })
    assert ava["displayName"] == "Ava Multilingual (Female)"

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


# ── incomplete-stream handling (regression: partial audio as success) ─────

def _audio_ws_message(payload: bytes) -> bytes:
    """Builds a binary websocket message exactly as the Edge service sends
    it: 2-byte header length + header text (ending in CRLF) + payload.
    Verified against a real capture: the header's last line is Path:audio,
    so get_headers_and_data parses Path == b'audio' and returns the payload.
    """
    header = b"X-RequestId:test\r\nContent-Type:audio/mpeg\r\nPath:audio\r\n"
    return len(header).to_bytes(2, "big") + header + payload


_TURN_END = "X-RequestId:test\r\nPath:turn.end\r\n\r\n{}"


class _FakeEdgeWebSocket:
    """Minimal stand-in for the websockets client connection."""

    def __init__(self, messages):
        self._messages = list(messages)
        self.sent = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def send(self, data):
        self.sent.append(data)

    def __aiter__(self):
        return self._iterate()

    async def _iterate(self):
        for msg in self._messages:
            if isinstance(msg, Exception):
                raise msg
            yield msg


class _FakeConnect:
    def __init__(self, ws):
        self._ws = ws

    async def __aenter__(self):
        return self._ws

    async def __aexit__(self, *exc):
        return False


def _patch_websocket(monkeypatch, messages):
    """Replaces websockets.asyncio.client.connect with a scripted fake."""
    ws = _FakeEdgeWebSocket(messages)
    monkeypatch.setattr(
        websockets.asyncio.client, "connect", lambda *a, **k: _FakeConnect(ws)
    )
    return ws


def _require_ffprobe():
    ffprobe = shutil.which("ffprobe")
    assert ffprobe, "ffprobe is required for Edge audio validation tests"
    return ffprobe


def _make_tone_mp3(path, duration_seconds: float = 1.0, write_xing: bool = True):
    args = [
        shutil.which("ffmpeg"), "-y",
        "-f", "lavfi", "-i", f"sine=frequency=660:duration={duration_seconds}",
        "-codec:a", "libmp3lame", "-q:a", "2",
    ]
    if not write_xing:
        args += ["-write_xing", "0"]
    args.append(str(path))
    subprocess.run(args, capture_output=True, check=True)


def test_synthesize_returns_audio_on_complete_stream(monkeypatch):
    """Happy path unchanged: audio chunks + turn.end returns the bytes."""
    chunk = b"\xff\xf3" + b"\x00" * 100
    _patch_websocket(monkeypatch, [
        _audio_ws_message(chunk),
        _audio_ws_message(chunk),
        _TURN_END,
    ])
    result = asyncio.run(
        EdgeTTSService()._synthesize_async("Hello.", "en-US-AndrewNeural", 1.0)
    )
    assert result == chunk + chunk


def test_synthesize_raises_on_midstream_drop_with_partial_audio(monkeypatch):
    """The Nov 16 live bug: the websocket dropped mid-stream after two audio
    chunks (no turn.end). Partial bytes must NOT be returned as success."""
    chunk = b"\xff\xf3" + b"\x00" * 100
    _patch_websocket(monkeypatch, [
        _audio_ws_message(chunk),
        _audio_ws_message(chunk),
        ConnectionClosed(None, None),
    ])
    with pytest.raises(ConnectionClosed):
        asyncio.run(
            EdgeTTSService()._synthesize_async("Hello.", "en-US-AndrewNeural", 1.0)
        )


def test_synthesize_raises_when_stream_ends_without_turn_end(monkeypatch):
    """A clean close with audio but no turn.end is still an incomplete
    stream — the audio may be cut off, so it must not be served."""
    chunk = b"\xff\xf3" + b"\x00" * 100
    _patch_websocket(monkeypatch, [
        _audio_ws_message(chunk),
        _audio_ws_message(chunk),
    ])
    with pytest.raises(RuntimeError, match="turn.end"):
        asyncio.run(
            EdgeTTSService()._synthesize_async("Hello.", "en-US-AndrewNeural", 1.0)
        )


def test_synthesize_wraps_midstream_drop_as_edge_tts_failed(monkeypatch):
    """Through the public synthesize(): a mid-stream drop surfaces as
    EDGE_TTS_FAILED so the worker's retry engages."""
    chunk = b"\xff\xf3" + b"\x00" * 100
    _patch_websocket(monkeypatch, [
        _audio_ws_message(chunk),
        ConnectionClosed(None, None),
    ])
    monkeypatch.setattr(EdgeTTSService, "synthesize", _REAL_SYNTHESIZE)
    with pytest.raises(TtsException) as excinfo:
        EdgeTTSService().synthesize("Hello.", "en-US-AndrewNeural", 1.0)
    assert excinfo.value.code == "EDGE_TTS_FAILED"


def test_validate_mp3_bytes_accepts_real_mp3(monkeypatch, tmp_path):
    _require_ffprobe()
    mp3_path = tmp_path / "real.mp3"
    _make_tone_mp3(mp3_path, duration_seconds=1.0)
    # Must not raise for a valid MP3.
    EdgeTTSService()._validate_mp3_bytes(mp3_path.read_bytes(), "en-US-AndrewNeural")


def test_validate_mp3_bytes_accepts_headerless_mp3(monkeypatch, tmp_path):
    """Regression: Edge streams carry no Xing header, and ffprobe reports
    duration N/A for such MP3s from a non-seekable pipe — the first
    version of this validator rejected ALL real Edge audio that way and
    hid every Edge voice. Validation must probe via a seekable file, where
    ffprobe estimates duration from size/bitrate."""
    _require_ffprobe()
    mp3_path = tmp_path / "headerless.mp3"
    _make_tone_mp3(mp3_path, duration_seconds=1.0, write_xing=False)
    # Sanity: this fixture really is headerless (pipe probe says N/A).
    piped = subprocess.run(
        [
            shutil.which("ffprobe"),
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            "-",
        ],
        input=mp3_path.read_bytes(),
        capture_output=True,
    )
    assert piped.stdout.decode().strip() == "N/A"
    # ...yet validation must accept it.
    EdgeTTSService()._validate_mp3_bytes(mp3_path.read_bytes(), "en-US-AndrewNeural")


def test_validate_mp3_bytes_rejects_garbage_and_truncated_mp3(monkeypatch, tmp_path):
    _require_ffprobe()
    service = EdgeTTSService()
    with pytest.raises(TtsException) as excinfo:
        service._validate_mp3_bytes(b"\x00" * 100, "en-US-AndrewNeural")
    assert excinfo.value.code == "EDGE_TTS_FAILED"

    mp3_path = tmp_path / "real.mp3"
    _make_tone_mp3(mp3_path, duration_seconds=1.0)
    truncated = mp3_path.read_bytes()[:100]  # less than one MP3 frame
    with pytest.raises(TtsException) as excinfo:
        service._validate_mp3_bytes(truncated, "en-US-AndrewNeural")
    assert excinfo.value.code == "EDGE_TTS_FAILED"


def test_synthesize_rejects_corrupt_bytes(monkeypatch):
    """Corrupt bytes from the websocket layer never leave synthesize()
    as a fake success — they raise EDGE_TTS_FAILED instead."""
    _require_ffprobe()

    async def _corrupt_async(self, text, voice_id, speed):
        return b"\x00" * 100

    monkeypatch.setattr(EdgeTTSService, "_synthesize_async", _corrupt_async)
    monkeypatch.setattr(EdgeTTSService, "synthesize", _REAL_SYNTHESIZE)
    with pytest.raises(TtsException) as excinfo:
        EdgeTTSService().synthesize("Hello.", "en-US-AndrewNeural", 1.0)
    assert excinfo.value.code == "EDGE_TTS_FAILED"
