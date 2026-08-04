import pytest
from pathlib import Path
from app.utils.file_validation import (
    validate_file_signature,
    validate_uploaded_file,
    SUPPORTED_EXTENSIONS
)
from app.core.exceptions import InvalidRequestException

def test_validate_file_signature_valid(tmp_path):
    # Test valid WAV (RIFF...WAVE)
    wav_file = tmp_path / "test.wav"
    wav_file.write_bytes(b"RIFF\x00\x00\x00\x00WAVEfmt ")
    is_valid, err = validate_file_signature(wav_file, ".wav")
    assert is_valid
    assert err == ""

    # Test valid MP3 (ID3)
    mp3_file = tmp_path / "test.mp3"
    mp3_file.write_bytes(b"ID3\x03\x00\x00\x00\x00\x00\x00")
    is_valid, err = validate_file_signature(mp3_file, ".mp3")
    assert is_valid

    # Test valid MP3 syncword
    mp3_sync = tmp_path / "test_sync.mp3"
    mp3_sync.write_bytes(b"\xFF\xFB\x90\x44")
    is_valid, err = validate_file_signature(mp3_sync, ".mp3")
    assert is_valid

    # Test valid MP4
    mp4_file = tmp_path / "test.mp4"
    mp4_file.write_bytes(b"\x00\x00\x00\x18ftypmp42")
    is_valid, err = validate_file_signature(mp4_file, ".mp4")
    assert is_valid

def test_validate_file_signature_invalid(tmp_path):
    # Test invalid WAV (missing WAVE)
    bad_wav = tmp_path / "bad.wav"
    bad_wav.write_bytes(b"RIFF\x00\x00\x00\x00xxxxfmt ")
    is_valid, err = validate_file_signature(bad_wav, ".wav")
    assert not is_valid
    assert "INVALID_WAV_HEADER" in err

    # Test empty file
    empty_file = tmp_path / "empty.mp3"
    empty_file.touch()
    is_valid, err = validate_file_signature(empty_file, ".mp3")
    assert not is_valid
    assert err == "EMPTY_FILE"

def test_validate_uploaded_file_mime_checks(tmp_path):
    f = tmp_path / "test.wav"
    f.write_bytes(b"RIFF\x00\x00\x00\x00WAVEfmt ")

    # Matching MIME
    validate_uploaded_file(f, "test.wav", "audio/wav")

    # Generic octet-stream MIME (should be allowed to proceed to FFprobe check)
    validate_uploaded_file(f, "test.wav", "application/octet-stream")

    # Empty MIME
    validate_uploaded_file(f, "test.wav", "")

    # Contradictory MIME (image)
    with pytest.raises(InvalidRequestException) as exc:
        validate_uploaded_file(f, "test.wav", "image/jpeg")
    assert exc.value.code == "FILE_TYPE_UNSUPPORTED"

def test_validate_uploaded_file_extensions(tmp_path):
    f = tmp_path / "test.txt"
    f.write_bytes(b"some plain text")

    # Unsupported extension
    with pytest.raises(InvalidRequestException) as exc:
        validate_uploaded_file(f, "test.txt", "text/plain")
    assert exc.value.code == "FILE_TYPE_UNSUPPORTED"
