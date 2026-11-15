"""Multi-voice dialogue jobs: POST /api/v1/tts/dialogue-jobs.

Covers validation (segment count, unknown voice, empty segment, 2000-char
combined cap), the once-per-dialogue rate-limit check, and the mocked
synthesis + real FFmpeg concat path producing ONE combined file that the
existing polling/download endpoints serve unchanged.
"""
import asyncio
import shutil
import subprocess
from datetime import timedelta
from pathlib import Path

import numpy as np
import pytest
import soundfile as sf

from app.core.exceptions import GenerationFailedException, TtsException
from app.core.queue import TtsQueueManager
from app.services.audio_service import AudioService
from app.services.edge_tts_service import EdgeTTSService
from app.services.job_service import JobService
from app.services.rate_limit_service import RateLimitService

# The autouse fixture patches EdgeTTSService.synthesize; tests that exercise
# the real synthesize()/validation path restore this reference.
_REAL_SYNTHESIZE = EdgeTTSService.synthesize

DIALOGUE_URL = "/api/v1/tts/dialogue-jobs"

# Same fake Edge catalogue shape as test_edge_tts.py.
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
    monkeypatch.setattr(EdgeTTSService, "is_available", lambda self: True)
    monkeypatch.setattr(EdgeTTSService, "get_voices", lambda self: list(EDGE_VOICES))
    monkeypatch.setattr(
        EdgeTTSService, "get_voice",
        lambda self, voice_id: next(
            (v for v in EDGE_VOICES if v["id"] == voice_id), None
        ),
    )


def _run_worker(job_id: str):
    """Drives the worker for one job directly (workers don't start in tests)."""
    asyncio.run(TtsQueueManager()._process_job(job_id))


def _use_real_ffmpeg():
    """
    The autouse mock fixture points AudioService at a fake 'mock-ffmpeg'
    binary. Dialogue concat runs real FFmpeg, so point the queue manager's
    audio service at the real binary for these tests.
    """
    ffmpeg = shutil.which("ffmpeg")
    assert ffmpeg, "ffmpeg is required for dialogue concat tests"
    TtsQueueManager().audio_service.ffmpeg_path = (True, ffmpeg)
    return ffmpeg


def _make_tone_wav(path: Path, duration_seconds: float = 1.0, freq: float = 440.0):
    """Writes a real 24kHz mono WAV tone (a stand-in segment file)."""
    sr = 24000
    t = np.linspace(0, duration_seconds, int(sr * duration_seconds), endpoint=False)
    wave = (0.5 * np.sin(2 * np.pi * freq * t)).astype(np.float32)
    sf.write(str(path), wave, sr, subtype="PCM_16")


def _make_tone_mp3(path: Path, duration_seconds: float = 1.0):
    """Writes a real MP3 tone via the system ffmpeg (an Edge segment file)."""
    subprocess.run(
        [
            shutil.which("ffmpeg"), "-y",
            "-f", "lavfi", "-i", f"sine=frequency=660:duration={duration_seconds}",
            "-codec:a", "libmp3lame", "-q:a", "2",
            str(path),
        ],
        capture_output=True, check=True,
    )


def _two_segment_payload(**overrides):
    payload = {
        "segments": [
            {"text": "Hello, welcome to the show.", "voiceId": "af_heart"},
            {"text": "Thanks, great to be here.", "voiceId": "am_adam"},
        ],
        "speed": 1.0,
        "outputFormat": "mp3",
    }
    payload.update(overrides)
    return payload


def _status(client, job_id, token):
    return client.get(
        f"/api/v1/tts/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    )


# ── validation ─────────────────────────────────────────────────────────────

def test_dialogue_rejects_single_segment(client):
    response = client.post(DIALOGUE_URL, json={
        "segments": [{"text": "Just one turn.", "voiceId": "af_heart"}],
    })
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"


def test_dialogue_rejects_empty_segments(client):
    response = client.post(DIALOGUE_URL, json={"segments": []})
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"


def test_dialogue_rejects_more_than_eight_segments(client):
    response = client.post(DIALOGUE_URL, json={
        "segments": [
            {"text": f"Turn {i}.", "voiceId": "af_heart"} for i in range(9)
        ],
    })
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"


def test_dialogue_rejects_unknown_voice(client):
    response = client.post(DIALOGUE_URL, json=_two_segment_payload(
        segments=[
            {"text": "Hello.", "voiceId": "af_heart"},
            {"text": "Hi.", "voiceId": "no-such-voice"},
        ],
    ))
    assert response.status_code == 400
    assert response.json()["code"] == "VOICE_UNSUPPORTED"
    assert "no-such-voice" in response.json()["message"]


def test_dialogue_rejects_empty_segment_text(client):
    response = client.post(DIALOGUE_URL, json=_two_segment_payload(
        segments=[
            {"text": "Hello.", "voiceId": "af_heart"},
            {"text": "   ", "voiceId": "am_adam"},
        ],
    ))
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"


def test_dialogue_rejects_combined_text_over_2000_chars(client):
    response = client.post(DIALOGUE_URL, json=_two_segment_payload(
        segments=[
            {"text": "a" * 1500, "voiceId": "af_heart"},
            {"text": "b" * 501, "voiceId": "am_adam"},
        ],
    ))
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"


def test_dialogue_accepts_combined_text_at_exactly_2000_chars(client):
    response = client.post(DIALOGUE_URL, json=_two_segment_payload(
        segments=[
            {"text": "a" * 1000, "voiceId": "af_heart"},
            {"text": "b" * 1000, "voiceId": "am_adam"},
        ],
    ))
    assert response.status_code == 200, response.json()


def test_dialogue_rejects_bad_format_and_speed(client):
    response = client.post(DIALOGUE_URL, json=_two_segment_payload(outputFormat="ogg"))
    assert response.status_code == 400
    response = client.post(DIALOGUE_URL, json=_two_segment_payload(speed=3.0))
    assert response.status_code == 400


# ── rate limit: once per dialogue, not per segment ─────────────────────────

def test_dialogue_counts_once_against_tts_rate_limit(client, monkeypatch):
    calls = []
    original = RateLimitService.check_tts_rate_limit

    def spy(self, *args, **kwargs):
        calls.append(1)
        return original(self, *args, **kwargs)

    monkeypatch.setattr(RateLimitService, "check_tts_rate_limit", spy)

    response = client.post(DIALOGUE_URL, json={
        "segments": [
            {"text": "First turn.", "voiceId": "af_heart"},
            {"text": "Second turn.", "voiceId": "am_adam"},
            {"text": "Third turn.", "voiceId": "bf_emma"},
        ],
    })
    assert response.status_code == 200, response.json()
    assert len(calls) == 1, f"expected 1 rate-limit check for a 3-segment dialogue, got {len(calls)}"

    job = JobService().get_job(response.json()["jobId"])
    assert len(job.segments) == 3
    assert job.engine == "dialogue"
    assert job.character_count == len("First turn. Second turn. Third turn.")


# ── FFmpeg concat unit ─────────────────────────────────────────────────────

def test_concatenate_audio_files_joins_with_gap(tmp_path):
    service = AudioService()
    service.ffmpeg_path = (True, _use_real_ffmpeg())

    seg_a = tmp_path / "a.wav"
    seg_b = tmp_path / "b.wav"
    _make_tone_wav(seg_a, duration_seconds=1.0, freq=440.0)
    _make_tone_wav(seg_b, duration_seconds=1.0, freq=660.0)

    out = tmp_path / "out.mp3"
    duration = service.concatenate_audio_files([seg_a, seg_b], out, "mp3")
    assert out.exists() and out.stat().st_size > 0
    # 1.0s + 0.3s gap + 1.0s = 2.3s (ffprobe duration read).
    assert duration == pytest.approx(2.3, abs=0.15)

    out_wav = tmp_path / "out.wav"
    duration_wav = service.concatenate_audio_files([seg_a, seg_b], out_wav, "wav")
    assert duration_wav == pytest.approx(2.3, abs=0.05)
    info = sf.info(str(out_wav))
    assert info.samplerate == 24000
    assert info.channels == 1


def test_concatenate_rejects_invalid_segment(tmp_path):
    """Defence in depth: a truncated/corrupt segment file must fail the
    concat with a segment-specific error, not a generic ffmpeg failure."""
    service = AudioService()
    service.ffmpeg_path = (True, _use_real_ffmpeg())

    good = tmp_path / "good.wav"
    _make_tone_wav(good, duration_seconds=1.0)
    bad = tmp_path / "bad.mp3"
    bad.write_bytes(b"\x00" * 100)  # garbage: ffprobe cannot read a duration

    out = tmp_path / "out.mp3"
    with pytest.raises(GenerationFailedException, match="segment 2"):
        service.concatenate_audio_files([good, bad], out, "mp3")


def test_concatenate_mixed_wav_and_mp3(tmp_path):
    service = AudioService()
    service.ffmpeg_path = (True, _use_real_ffmpeg())

    seg_wav = tmp_path / "kokoro.wav"
    seg_mp3 = tmp_path / "edge.mp3"
    _make_tone_wav(seg_wav, duration_seconds=1.0)
    _make_tone_mp3(seg_mp3, duration_seconds=1.0)

    out = tmp_path / "mixed.mp3"
    duration = service.concatenate_audio_files([seg_wav, seg_mp3], out, "mp3")
    assert out.exists() and out.stat().st_size > 0
    assert duration == pytest.approx(2.3, abs=0.15)


# ── end-to-end (mocked synthesis, real concat) ─────────────────────────────

def test_dialogue_kokoro_only_completes_as_one_file(client):
    _use_real_ffmpeg()
    response = client.post(DIALOGUE_URL, json=_two_segment_payload())
    assert response.status_code == 200, response.json()
    data = response.json()
    assert set(data.keys()) == {"jobId", "accessToken", "status"}
    assert data["status"] == "queued"
    job_id, token = data["jobId"], data["accessToken"]

    job = JobService().get_job(job_id)
    assert job.segments[0]["engine"] == "kokoro"
    assert job.segments[1]["engine"] == "kokoro"
    # Same 60-minute retention as a normal job.
    assert job.expires_at - job.created_at == timedelta(minutes=60)

    _run_worker(job_id)

    status = _status(client, job_id, token).json()
    assert status["status"] == "completed"
    assert status["progressStage"] == "completed"
    assert status["downloadUrl"] == f"/api/v1/tts/jobs/{job_id}/audio"
    assert status["outputFormat"] == "mp3"
    # Mocked Kokoro returns a 1s waveform per segment + 200ms terminal
    # silence each, joined with a 300ms gap: ~2.7s total.
    assert status["durationSeconds"] == pytest.approx(2.7, abs=0.3)
    assert status["characterCount"] == len(
        "Hello, welcome to the show. Thanks, great to be here."
    )

    audio = client.get(
        f"/api/v1/tts/jobs/{job_id}/audio",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert audio.status_code == 200
    assert len(audio.content) > 0


def test_dialogue_wav_output(client):
    _use_real_ffmpeg()
    response = client.post(DIALOGUE_URL, json=_two_segment_payload(outputFormat="wav"))
    assert response.status_code == 200, response.json()
    job_id, token = response.json()["jobId"], response.json()["accessToken"]

    _run_worker(job_id)

    status = _status(client, job_id, token).json()
    assert status["status"] == "completed"
    assert status["outputFormat"] == "wav"

    audio = client.get(
        f"/api/v1/tts/jobs/{job_id}/audio",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert audio.status_code == 200
    assert audio.content[:4] == b"RIFF"  # real WAV container


def test_dialogue_mixed_kokoro_and_edge_completes(client, monkeypatch, tmp_path):
    _make_edge_available(monkeypatch)
    _use_real_ffmpeg()

    # The autouse mock returns fake MP3 bytes; give Edge a REAL 1s MP3 so
    # the real FFmpeg concat can decode the mixed-engine segments.
    real_mp3 = tmp_path / "edge-segment.mp3"
    _make_tone_mp3(real_mp3, duration_seconds=1.0)
    mp3_bytes = real_mp3.read_bytes()
    monkeypatch.setattr(
        EdgeTTSService, "synthesize",
        lambda self, text, voice_id, speed=1.0, timeout_seconds=None: mp3_bytes,
    )

    response = client.post(DIALOGUE_URL, json={
        "segments": [
            {"text": "Welcome to the podcast.", "voiceId": "af_heart"},
            {"text": "আমি বাংলায় উত্তর দিচ্ছি।", "voiceId": "bn-BD-NabanitaNeural"},
        ],
        "speed": 1.0,
        "outputFormat": "mp3",
    })
    assert response.status_code == 200, response.json()
    job_id, token = response.json()["jobId"], response.json()["accessToken"]

    job = JobService().get_job(job_id)
    assert job.segments[0]["engine"] == "kokoro"
    assert job.segments[1]["engine"] == "edge"

    _run_worker(job_id)

    status = _status(client, job_id, token).json()
    assert status["status"] == "completed", status
    assert status["downloadUrl"] is not None
    # Kokoro segment ~1.2s (1s waveform + terminal silence) + 0.3s gap
    # + Edge segment 1.0s = ~2.5s.
    assert status["durationSeconds"] == pytest.approx(2.5, abs=0.4)

    audio = client.get(
        f"/api/v1/tts/jobs/{job_id}/audio",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert audio.status_code == 200
    assert len(audio.content) > 0


def test_dialogue_segment_failure_fails_job_without_partial_file(client, monkeypatch):
    _make_edge_available(monkeypatch)
    _use_real_ffmpeg()

    def _failing_synthesize(self, *args, **kwargs):
        raise TtsException("EDGE_TTS_FAILED", "Edge is down")

    monkeypatch.setattr(EdgeTTSService, "synthesize", _failing_synthesize)

    response = client.post(DIALOGUE_URL, json={
        "segments": [
            {"text": "First turn is fine.", "voiceId": "af_heart"},
            {"text": "Second turn fails.", "voiceId": "en-US-AndrewNeural"},
        ],
    })
    assert response.status_code == 200, response.json()
    job_id, token = response.json()["jobId"], response.json()["accessToken"]

    _run_worker(job_id)

    status = _status(client, job_id, token).json()
    assert status["status"] == "failed"
    assert status["progressStage"] == "failed"
    assert status["errorCode"] == "EDGE_TTS_FAILED"
    assert status["errorMessage"]
    assert status["downloadUrl"] is None

    # No partial file is served as success.
    audio = client.get(
        f"/api/v1/tts/jobs/{job_id}/audio",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert audio.status_code == 400


def test_dialogue_edge_segment_retries_after_transient_drop(client, monkeypatch, tmp_path):
    """Edge's websocket sometimes drops with no close frame; retries seconds
    later succeed (same resilience as the normal Edge job path). One
    transient failure must NOT fail the dialogue."""
    _make_edge_available(monkeypatch)
    _use_real_ffmpeg()

    real_mp3 = tmp_path / "edge-segment.mp3"
    _make_tone_mp3(real_mp3, duration_seconds=1.0)
    mp3_bytes = real_mp3.read_bytes()

    calls = {"n": 0}

    def _flaky_synthesize(self, text, voice_id, speed=1.0, timeout_seconds=None):
        calls["n"] += 1
        if calls["n"] == 1:
            raise TtsException("EDGE_TTS_FAILED", "no close frame received or sent")
        return mp3_bytes

    monkeypatch.setattr(EdgeTTSService, "synthesize", _flaky_synthesize)

    response = client.post(DIALOGUE_URL, json={
        "segments": [
            {"text": "First turn.", "voiceId": "af_heart"},
            {"text": "Second turn.", "voiceId": "en-US-AndrewNeural"},
        ],
    })
    assert response.status_code == 200, response.json()
    job_id, token = response.json()["jobId"], response.json()["accessToken"]

    _run_worker(job_id)

    status = _status(client, job_id, token).json()
    assert status["status"] == "completed", status
    assert calls["n"] == 2  # first attempt dropped, the retry succeeded


def test_dialogue_edge_segment_retries_twice_after_repeated_drops(client, monkeypatch, tmp_path):
    """The transient drop is time-varying: a segment that drops twice must
    still complete on the second retry (initial attempt + 2 retries)."""
    _make_edge_available(monkeypatch)
    _use_real_ffmpeg()

    real_mp3 = tmp_path / "edge-segment.mp3"
    _make_tone_mp3(real_mp3, duration_seconds=1.0)
    mp3_bytes = real_mp3.read_bytes()

    calls = {"n": 0}

    def _flaky_synthesize(self, text, voice_id, speed=1.0, timeout_seconds=None):
        calls["n"] += 1
        if calls["n"] <= 2:
            raise TtsException("EDGE_TTS_FAILED", "no close frame received or sent")
        return mp3_bytes

    monkeypatch.setattr(EdgeTTSService, "synthesize", _flaky_synthesize)

    response = client.post(DIALOGUE_URL, json={
        "segments": [
            {"text": "First turn.", "voiceId": "af_heart"},
            {"text": "Second turn.", "voiceId": "en-US-AndrewNeural"},
        ],
    })
    assert response.status_code == 200, response.json()
    job_id, token = response.json()["jobId"], response.json()["accessToken"]

    _run_worker(job_id)

    status = _status(client, job_id, token).json()
    assert status["status"] == "completed", status
    assert calls["n"] == 3  # two drops, second retry succeeded


def test_dialogue_corrupt_edge_segment_fails_as_edge_tts_failed(client, monkeypatch):
    """Regression (Nov 16 live bug): an Edge segment returning truncated/
    corrupt MP3 bytes must fail the job as EDGE_TTS_FAILED — NOT as the
    generic GENERATION_FAILED from the concat — after all retries, and no
    partial file may be served. The real synthesize() (with its ffprobe
    validation) runs here; only the websocket layer is stubbed to return
    garbage bytes."""
    _make_edge_available(monkeypatch)
    _use_real_ffmpeg()

    monkeypatch.setattr(EdgeTTSService, "synthesize", _REAL_SYNTHESIZE)

    calls = {"n": 0}

    async def _corrupt_async(self, text, voice_id, speed):
        calls["n"] += 1
        return b"\x00" * 100

    monkeypatch.setattr(EdgeTTSService, "_synthesize_async", _corrupt_async)

    response = client.post(DIALOGUE_URL, json={
        "segments": [
            {"text": "First turn is fine.", "voiceId": "af_heart"},
            {"text": "Second turn is corrupt.", "voiceId": "en-US-AndrewNeural"},
        ],
    })
    assert response.status_code == 200, response.json()
    job_id, token = response.json()["jobId"], response.json()["accessToken"]

    _run_worker(job_id)

    status = _status(client, job_id, token).json()
    assert status["status"] == "failed"
    assert status["errorCode"] == "EDGE_TTS_FAILED"
    assert status["errorMessage"]
    assert status["downloadUrl"] is None
    assert calls["n"] == 3  # initial attempt + 2 retries, all rejected

    # No partial file is served as success.
    audio = client.get(
        f"/api/v1/tts/jobs/{job_id}/audio",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert audio.status_code == 400
