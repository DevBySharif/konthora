import os
import pytest
from pathlib import Path
import numpy as np

from app.services.kokoro_service import KokoroService
from app.services.audio_service import AudioService

# Skip this test unless RUN_TTS_INTEGRATION_TESTS=1 is specified
pytestmark = pytest.mark.skipif(
    os.environ.get("RUN_TTS_INTEGRATION_TESTS") != "1",
    reason="Skipping Kokoro heavy model integration tests by default."
)

def test_kokoro_integration():
    """
    Loads the real Kokoro model, runs inference on a short sentence,
    verifies sample traits, and exports a test file.
    """
    kokoro_service = KokoroService()
    audio_service = AudioService()

    # 1. Initialize/load model
    pipeline = kokoro_service.load_pipeline(lang_code="a")
    assert pipeline is not None

    ready, status, err = kokoro_service.get_status()
    assert ready is True
    assert status == "ready"
    assert err is None

    # 2. Synthesize a short segment
    text = "Hello."
    voice = "af_heart"

    # This runs the actual inference
    waveform = kokoro_service.synthesize_chunk(text, voice_id=voice, speed=1.0)

    # Assertions on raw audio array
    assert isinstance(waveform, np.ndarray)
    assert len(waveform) > 0
    assert np.all(np.isfinite(waveform))
    assert waveform.dtype == np.float32

    # 3. Assemble and apply audio fades / peaks normalization
    assembled, duration = audio_service.assemble_audio([(waveform, "paragraph")])

    assert len(assembled) > 0
    assert duration > 0.0
    # Peak amplitude must be normalized to exactly 0.95
    assert np.max(np.abs(assembled)) == pytest.approx(0.95, rel=1e-3)

    # 4. Export to a temporary WAV file container
    temp_dir = Path("./test_storage")
    temp_dir.mkdir(parents=True, exist_ok=True)
    temp_wav = temp_dir / "integration-test-output.wav"

    try:
        audio_service.export_wav(assembled, temp_wav)
        assert temp_wav.exists()
        assert temp_wav.stat().st_size > 0
    finally:
        # Cleanup
        if temp_wav.exists():
            temp_wav.unlink()
