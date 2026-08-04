import os
import time
import pytest
from pathlib import Path
import numpy as np
from unittest.mock import MagicMock

from app.services.kokoro_service import KokoroService
from app.services.audio_service import AudioService
from app.services.media_service import MediaService
from app.services.transcription_service import TranscriptionService

# Skip this test unless RUN_TRANSCRIPTION_INTEGRATION_TESTS=1 is specified
pytestmark = pytest.mark.skipif(
    os.environ.get("RUN_TRANSCRIPTION_INTEGRATION_TESTS") != "1",
    reason="Skipping faster-whisper heavy integration tests by default."
)

def test_transcription_integration(tmp_path):
    """
    Integration test using the real Kokoro model to generate a local WAV file with silence,
    and transcribing it using the real faster-whisper model.
    """
    # 1. Generate local audio fixture using Kokoro
    kokoro = KokoroService()
    audio_svc = AudioService()

    # Initialize Kokoro KPipeline
    pipeline = kokoro.load_pipeline(lang_code="a")
    assert pipeline is not None

    # Synthesize a clear sentence
    wf1 = kokoro.synthesize_chunk("Welcome to Konthora. Natural speech, precise transcripts.", voice_id="af_heart", speed=1.0)

    # Setup leading/middle/trailing silences at 24000Hz (Kokoro output rate)
    sr = 24000
    silence_2s = np.zeros(sr * 2, dtype=np.float32)
    silence_1s = np.zeros(sr * 1, dtype=np.float32)

    # Concatenate: 2s leading silence + Welcome + 2s trailing silence
    combined_wf = np.concatenate([silence_2s, wf1, silence_2s])

    # Normalize assembled audio (peak to 0.95)
    max_val = np.max(np.abs(combined_wf))
    if max_val > 0:
        combined_wf = combined_wf * (0.95 / max_val)

    # Write to local WAV fixture under pytest tmp_path
    fixture_wav = tmp_path / "fixture.wav"
    audio_svc.export_wav(combined_wf, fixture_wav)
    assert fixture_wav.exists()
    assert fixture_wav.stat().st_size > 0

    # 2. Transcribe using faster-whisper
    trans_service = TranscriptionService()
    # Explicitly load model
    trans_service.load_model()

    # Convert WAV container to standard 16kHz mono using MediaService
    media_service = MediaService()
    standard_wav = tmp_path / "standard.wav"
    media_service.extract_audio(fixture_wav, standard_wav)
    assert standard_wav.exists()

    # Run Whisper inference
    result = trans_service.transcribe_audio(standard_wav, language="en")

    # Verify outputs
    assert "detected_language" in result
    assert "segments" in result

    segments = result["segments"]
    assert len(segments) > 0

    # Check that leading silence of 2 seconds was preserved (first segment starts after ~1.5s)
    first_segment = segments[0]
    assert first_segment["start"] >= 1.5

    # Check word timings if enabled
    if first_segment.get("words"):
        first_word = first_segment["words"][0]
        assert first_word["start"] >= 1.5

    print(f"Integration result: {result}")
