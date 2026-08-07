import pytest
import numpy as np
from app.services.kokoro_service import KokoroService

def test_integration_misaki_adapter_string_return():
    """Test that the adapter handles a string return safely."""
    service = KokoroService()
    pipeline = service.load_pipeline('h')
    
    # Mock the internal G2P wrapper's inner object
    original_g2p = pipeline.g2p.orig
    pipeline.g2p.orig = lambda text: "some phonemes"
    
    res = pipeline.g2p("hello")
    assert res == "some phonemes"
    
    # restore
    pipeline.g2p.orig = original_g2p

def test_integration_misaki_adapter_tuple_return():
    """Test that the adapter extracts string from tuple correctly."""
    service = KokoroService()
    pipeline = service.load_pipeline('h')
    
    original_g2p = pipeline.g2p.orig
    pipeline.g2p.orig = lambda text: ("some phonemes", None)
    
    res = pipeline.g2p("hello")
    assert res == "some phonemes"
    
    pipeline.g2p.orig = original_g2p

def test_integration_misaki_adapter_malformed_return():
    """Test that the adapter raises TypeError on invalid types."""
    service = KokoroService()
    pipeline = service.load_pipeline('h')
    
    original_g2p = pipeline.g2p.orig
    pipeline.g2p.orig = lambda text: 12345 # int
    
    with pytest.raises(TypeError):
        pipeline.g2p("hello")
        
    pipeline.g2p.orig = original_g2p

def test_integration_english_regression_untouched():
    """Test that English pipelines do not get wrapped with the adapter."""
    service = KokoroService()
    pipeline = service.load_pipeline('a') # en-US
    
    # Should not have `.orig` because it wasn't wrapped
    assert not hasattr(pipeline.g2p, "orig")
    
    # Should still work
    res = pipeline.g2p("hello")
    assert isinstance(res, tuple)

def test_integration_repeated_initialization_idempotent():
    """Test that repeated load_pipeline calls do not nest the adapter."""
    service = KokoroService()
    pipeline1 = service.load_pipeline('h')
    pipeline2 = service.load_pipeline('h')
    
    assert pipeline1 is pipeline2
    # Ensure it's wrapped exactly once, not nested (orig should not be an adapter)
    assert not hasattr(pipeline1.g2p.orig, "orig")

def test_integration_non_english_generation_regression():
    """Test actual non-English synthesis chunk generation."""
    service = KokoroService()
    # Provide a simple valid chunk
    res = service.synthesize_chunk("नमस्ते", "hf_alpha", 1.0)
    
    assert isinstance(res, np.ndarray)
    assert len(res) > 16000 # should be valid duration, not truncated
