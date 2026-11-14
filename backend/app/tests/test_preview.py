"""Voice-preview endpoint tests: GET /api/v1/tts/preview/{voice_id}.

The endpoint synthesizes a one-sentence clip in the voice's own language
on first request, caches it at {TTS_STORAGE_ROOT}/previews/{voice_id}.mp3
and serves the cached file afterwards. Previews live in their own
rate-limit bucket (120/hr) and never touch the TTS job quota.
"""
import time
from pathlib import Path

from app.core.config import settings
from app.services.edge_tts_service import EdgeTTSService
from app.services.rate_limit_service import RateLimitService

# Edge voices as the API would serve them when Edge is available. The
# autouse Edge mock in conftest returns no voices by default, so tests
# that need Edge re-patch the class methods (same pattern as test_edge_tts).
PREVIEW_EDGE_VOICES = [
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
    {
        "id": "es-ES-ElviraNeural",
        "displayName": "Elvira (Female)",
        "gender": "female",
        "accent": "Spanish (Spain)",
        "language": "es",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25,
        "engine": "edge",
        "previewUrl": "",
    },
    {
        "id": "de-DE-KatjaNeural",
        "displayName": "Katja (Female)",
        "gender": "female",
        "accent": "German (Germany)",
        "language": "de-DE",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25,
        "engine": "edge",
        "previewUrl": "",
    },
]

KOKORO_VOICE = {
    "id": "af_heart",
    "displayName": "Heart (Female)",
    "gender": "female",
    "accent": "American English",
    "language": "en-US",
    "recommended": True,
    "defaultSpeed": 1.0,
    "minimumSpeed": 0.75,
    "maximumSpeed": 1.25,
    "engine": "kokoro",
    "previewUrl": "",
}


def _make_edge_available(monkeypatch):
    """Re-patches the autouse Edge mock so Edge looks healthy for this test."""
    monkeypatch.setattr(EdgeTTSService, "is_available", lambda self: True)
    monkeypatch.setattr(
        EdgeTTSService, "get_voices", lambda self: list(PREVIEW_EDGE_VOICES)
    )


def _preview_lines():
    from app.api.v1.tts import _PREVIEW_LINES

    return _PREVIEW_LINES


# ── validation ─────────────────────────────────────────────────────────────

def test_preview_unknown_voice_404(client, monkeypatch):
    _make_edge_available(monkeypatch)
    response = client.get("/api/v1/tts/preview/xx_nope")
    assert response.status_code == 404
    assert response.json()["code"] == "VOICE_UNSUPPORTED"


def test_preview_kokoro_voice_404(client, monkeypatch):
    _make_edge_available(monkeypatch)
    response = client.get("/api/v1/tts/preview/af_heart")
    assert response.status_code == 404
    assert response.json()["code"] == "VOICE_UNSUPPORTED"


def test_preview_edge_down_503(client, monkeypatch):
    # Edge is down (autouse mock: is_available is False), but the catalogue
    # is forced to still list the voice — the endpoint's own availability
    # check must answer 503 instead of serving a clip that cannot exist.
    monkeypatch.setattr(
        "app.api.v1.tts._served_voices",
        lambda: [KOKORO_VOICE] + list(PREVIEW_EDGE_VOICES),
    )
    response = client.get("/api/v1/tts/preview/bn-BD-NabanitaNeural")
    assert response.status_code == 503
    assert response.json()["code"] == "SERVICE_UNAVAILABLE"


# ── synthesis + disk cache ─────────────────────────────────────────────────

def test_preview_synthesizes_then_serves_from_cache(client, monkeypatch, mock_edge_tts_service):
    _make_edge_available(monkeypatch)
    _, _, mock_synth = mock_edge_tts_service

    first = client.get("/api/v1/tts/preview/bn-BD-NabanitaNeural")
    assert first.status_code == 200
    assert first.headers["content-type"] == "audio/mpeg"
    assert first.headers["cache-control"] == "public, max-age=86400"
    assert first.content == b"FAKE_EDGE_MP3"
    assert mock_synth.call_count == 1

    # The clip must be cached on disk under the storage root.
    cache_file = Path(settings.TTS_STORAGE_ROOT).resolve() / "previews" / "bn-BD-NabanitaNeural.mp3"
    assert cache_file.exists()
    assert cache_file.read_bytes() == b"FAKE_EDGE_MP3"
    mtime = cache_file.stat().st_mtime

    # Second request: served from the cache file, no second synthesis.
    second = client.get("/api/v1/tts/preview/bn-BD-NabanitaNeural")
    assert second.status_code == 200
    assert second.content == b"FAKE_EDGE_MP3"
    assert mock_synth.call_count == 1
    assert cache_file.stat().st_mtime == mtime


def test_preview_line_is_in_the_voice_language(client, monkeypatch, mock_edge_tts_service):
    _make_edge_available(monkeypatch)
    _, _, mock_synth = mock_edge_tts_service
    lines = _preview_lines()

    cases = [
        ("en-US-AndrewNeural", lines["en"]),
        ("bn-BD-NabanitaNeural", lines["bn"]),
        ("es-ES-ElviraNeural", lines["es"]),
        # Unknown language prefix falls back to the English line.
        ("de-DE-KatjaNeural", lines["en"]),
    ]
    for voice_id, expected_text in cases:
        response = client.get(f"/api/v1/tts/preview/{voice_id}")
        assert response.status_code == 200, voice_id
        assert response.content == b"FAKE_EDGE_MP3"

    # One synthesis per voice, each with its own language line.
    calls = [c.args for c in mock_synth.call_args_list]
    assert len(calls) == len(cases)
    for (voice_id, expected_text), args in zip(cases, calls):
        assert args[0] == expected_text, voice_id
        assert args[1] == voice_id
        assert args[2] == 1.0


# ── rate limiting (own bucket) ─────────────────────────────────────────────

def test_preview_rate_limit_429(client, monkeypatch):
    _make_edge_available(monkeypatch)
    # Prefill this IP's preview bucket to the 120/hr cap (same pattern as
    # the dev-bypass rate-limit tests in test_api.py).
    limiter = RateLimitService()
    limiter._preview_request_history["testclient"] = [time.time()] * 120

    response = client.get("/api/v1/tts/preview/bn-BD-NabanitaNeural")
    assert response.status_code == 429
    assert response.json()["code"] == "RATE_LIMITED"


def test_preview_quota_is_separate_from_tts_quota(client, monkeypatch):
    _make_edge_available(monkeypatch)
    limiter = RateLimitService()

    # A full TTS job bucket must NOT block previews.
    limiter._request_history["testclient"] = [time.time()] * 5
    preview = client.get("/api/v1/tts/preview/bn-BD-NabanitaNeural")
    assert preview.status_code == 200

    # ...and a full preview bucket must NOT block job creation. (Clear the
    # TTS bucket first so only the preview bucket is full.)
    limiter._request_history["testclient"] = []
    limiter._preview_request_history["testclient"] = [time.time()] * 120
    job = client.post("/api/v1/tts/jobs", json={
        "text": "Hello.",
        "voiceId": "af_heart",
        "accent": "American English",
        "speed": 1.0,
        "outputFormat": "mp3",
    })
    assert job.status_code == 200
    assert job.json()["status"] == "queued"
