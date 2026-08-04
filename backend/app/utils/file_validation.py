import re
from pathlib import Path
from typing import Tuple, Set
from app.core.exceptions import InvalidRequestException

# Supported Extensions Set
SUPPORTED_EXTENSIONS: Set[str] = {
    ".mp3", ".wav", ".m4a", ".aac", ".mp4", ".webm", ".mov"
}

# Mapping of file signature patterns (bytes search offset or simple startswith checks)
def validate_file_signature(file_path: Path, extension: str) -> Tuple[bool, str]:
    """
    Scans the beginning of a file to check for valid container signatures.
    Returns (is_valid, error_reason).
    """
    ext = extension.lower()

    try:
        size = file_path.stat().st_size
        if size == 0:
            return False, "EMPTY_FILE"

        # Read the first 64 bytes for signatures
        with open(file_path, "rb") as f:
            header = f.read(64)

        header_len = len(header)

        if ext == ".wav":
            # WAV files start with 'RIFF' and have 'WAVE' at index 8
            if header_len >= 12 and header[0:4] == b"RIFF" and header[8:12] == b"WAVE":
                return True, ""
            return False, "INVALID_WAV_HEADER"

        elif ext == ".mp3":
            # MP3 files start with ID3 tag ('ID3' / b'ID3') or MPEG syncword (b'\xff\xfb', b'\xff\xf3', b'\xff\xf2')
            if header_len >= 3 and header[0:3] == b"ID3":
                return True, ""
            # Syncwords (MPEG-1/MPEG-2 Audio Layer III)
            if header_len >= 2 and header[0] == 0xFF and (header[1] & 0xE0) == 0xE0:
                return True, ""
            return False, "INVALID_MP3_HEADER"

        elif ext in [".mp4", ".m4a", ".mov"]:
            # MP4/M4A/MOV use ISO base media file format. Look for 'ftyp' at index 4
            if header_len >= 8 and header[4:8] == b"ftyp":
                return True, ""
            # QuickTime MOV files might start with other boxes or atoms like 'moov' or 'mdat'
            if header_len >= 8 and header[4:8] in [b"moov", b"mdat", b"wide"]:
                return True, ""
            return False, "INVALID_MPEG4_HEADER"

        elif ext == ".webm":
            # WebM files are subset of Matroska, starting with EBML header b'\x1a\x45\xdf\xa3'
            if header_len >= 4 and header[0:4] == b"\x1A\x45\xDF\xA3":
                return True, ""
            return False, "INVALID_WEBM_HEADER"

        elif ext == ".aac":
            # AAC files start with ADTS syncword (0xFFF / b'\xff\xf1' or b'\xff\xf9')
            if header_len >= 2 and header[0] == 0xFF and (header[1] & 0xF6) == 0xF0:
                return True, ""
            # ADIF signature 'ADIF'
            if header_len >= 4 and header[0:4] == b"ADIF":
                return True, ""
            return False, "INVALID_AAC_HEADER"

        return True, ""

    except Exception as e:
        return False, f"SIGNATURE_READ_FAILED: {e}"

def validate_uploaded_file(
    temp_file_path: Path,
    original_filename: str,
    reported_mime: str
) -> None:
    """
    Validates an uploaded file sequentially:
    1. Extension allowlist
    2. MIME type sanity (authoritative checks deferred to FFprobe, but clear contradictions blocked)
    3. Binary header signatures check
    """
    # 1. Extension Check
    filename = original_filename.lower()
    suffix = Path(filename).suffix

    if suffix not in SUPPORTED_EXTENSIONS:
        raise InvalidRequestException("FILE_TYPE_UNSUPPORTED", f"File extension '{suffix}' is not supported.")

    # 2. MIME Sanity check
    # Inconsistent browsers might send application/octet-stream or empty MIME types
    # Reject only if the MIME type is clearly contradictory (e.g. image/jpeg, text/plain)
    mime = reported_mime.lower().strip()
    if mime and mime != "application/octet-stream":
        is_media_mime = (
            mime.startswith("audio/") or
            mime.startswith("video/") or
            mime in ["application/x-mpegurl", "application/vnd.apple.mpegurl", "application/ogg"]
        )
        if not is_media_mime:
            raise InvalidRequestException("FILE_TYPE_UNSUPPORTED", f"Contradictory MIME type '{reported_mime}' rejected.")

    # 3. Binary file signature check
    is_valid_sig, sig_error = validate_file_signature(temp_file_path, suffix)
    if not is_valid_sig:
        raise InvalidRequestException("FILE_CONTENT_MISMATCH", f"Content signature mismatch for '{suffix}' container: {sig_error}")
