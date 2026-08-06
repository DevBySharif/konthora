import numpy as np
import pytest
from app.services.audio_service import AudioService
from app.core.config import settings

def test_assemble_audio_terminal_silence_appended():
    """Verify that terminal silence is appended exactly once after full assembly."""
    audio_service = AudioService()
    settings.TTS_TERMINAL_SILENCE_MS = 200
    settings.TTS_SENTENCE_PAUSE_MS = 220
    settings.TTS_PARAGRAPH_PAUSE_MS = 500
    
    # Create a dummy 1-second float32 waveform
    dummy_samples = int(audio_service.sample_rate * 1.0)
    waveform = np.ones(dummy_samples, dtype=np.float32) * 0.5
    
    chunk_waveforms = [(waveform, "sentence")]
    
    assembled, duration = audio_service.assemble_audio(chunk_waveforms)
    
    expected_terminal_samples = int(audio_service.sample_rate * (200 / 1000.0))
    expected_total_samples = dummy_samples + expected_terminal_samples
    
    assert len(assembled) == expected_total_samples
    assert duration == expected_total_samples / audio_service.sample_rate

def test_assemble_audio_terminal_samples_are_zero():
    """Verify that the appended tail contains only zero-valued samples."""
    audio_service = AudioService()
    settings.TTS_TERMINAL_SILENCE_MS = 200
    
    dummy_samples = int(audio_service.sample_rate * 0.5)
    # Using a high DC offset to ensure DC removal doesn't affect the appended zeroes
    waveform = np.ones(dummy_samples, dtype=np.float32)
    
    chunk_waveforms = [(waveform, "sentence")]
    
    assembled, _ = audio_service.assemble_audio(chunk_waveforms)
    
    expected_terminal_samples = int(audio_service.sample_rate * (200 / 1000.0))
    terminal_tail = assembled[-expected_terminal_samples:]
    
    # All terminal samples must be precisely 0.0 (DC offset should have been applied before appending)
    assert np.all(terminal_tail == 0.0)

def test_assemble_audio_inter_chunk_pause():
    """Verify grammatical pause is inserted between chunks and terminal silence only once."""
    audio_service = AudioService()
    settings.TTS_TERMINAL_SILENCE_MS = 200
    settings.TTS_SENTENCE_PAUSE_MS = 220
    
    dummy_samples = int(audio_service.sample_rate * 0.5)
    waveform_1 = np.ones(dummy_samples, dtype=np.float32) * 0.5
    waveform_2 = np.ones(dummy_samples, dtype=np.float32) * -0.5
    
    # Two chunks with a sentence boundary between them
    chunk_waveforms = [
        (waveform_1, "sentence"),
        (waveform_2, "paragraph") # final chunk boundary is ignored for inter-chunk pauses
    ]
    
    assembled, _ = audio_service.assemble_audio(chunk_waveforms)
    
    expected_sentence_pause_samples = int(audio_service.sample_rate * (220 / 1000.0))
    expected_terminal_samples = int(audio_service.sample_rate * (200 / 1000.0))
    
    expected_total_samples = (dummy_samples * 2) + expected_sentence_pause_samples + expected_terminal_samples
    
    assert len(assembled) == expected_total_samples

def test_assemble_audio_empty_input():
    """Preserve existing contract of assemble_audio for empty input."""
    audio_service = AudioService()
    settings.TTS_TERMINAL_SILENCE_MS = 200
    
    assembled, duration = audio_service.assemble_audio([])
    
    assert len(assembled) == 0
    assert duration == 0.0
    assert assembled.dtype == np.float32

def test_assemble_audio_properties():
    """Verify float32 dtype, peak target, and finite values."""
    audio_service = AudioService()
    settings.TTS_TERMINAL_SILENCE_MS = 100
    
    dummy_samples = int(audio_service.sample_rate * 0.1)
    # A wave with large variation
    waveform = np.linspace(-5.0, 5.0, dummy_samples, dtype=np.float32)
    
    assembled, _ = audio_service.assemble_audio([(waveform, "none")])
    
    assert assembled.dtype == np.float32
    assert np.all(np.isfinite(assembled))
    
    # Peak must not exceed 0.95
    assert np.max(np.abs(assembled)) == pytest.approx(0.95, rel=1e-3)
