import secrets
import hashlib
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from pathlib import Path

class TranscriptionJob:
    def __init__(
        self,
        job_id: str,
        original_filename: str,
        file_size_bytes: int,
        timestamp_mode: str,
        export_format: str,
        retention_minutes: int
    ):
        self.job_id = job_id
        self.original_filename = self._sanitize_filename(original_filename)
        self.file_size_bytes = file_size_bytes
        self.timestamp_mode = timestamp_mode
        self.export_format = export_format

        self.status = "queued"
        self.progress_stage = "queued"
        self.created_at = datetime.now(timezone.utc).replace(tzinfo=None)
        self.expires_at = datetime.now(timezone.utc).replace(tzinfo=None) # Updated after finalization

        self.media_duration_seconds: Optional[float] = None
        self.detected_language: Optional[str] = None
        self.language_probability: Optional[float] = None
        self.word_count: Optional[int] = None
        self.segment_count: Optional[int] = None
        self.transcript_character_count: Optional[int] = None

        self.error_code: Optional[str] = None
        self.error_message: Optional[str] = None

        # Access token creation
        self.raw_access_token = secrets.token_urlsafe(32)
        self.access_token_hash = self._hash_token(self.raw_access_token)

        self.retention_minutes = retention_minutes
        self.expiry_delta = timedelta(minutes=retention_minutes)

        # Paths for result storage (written atomically and saved here)
        self.structured_json_path: Optional[str] = None
        self.export_result_path: Optional[str] = None

        # Temporary in-memory transcript fields during transcription processing
        self.temp_full_text: Optional[str] = None
        self.temp_segments: Optional[List[Dict[str, Any]]] = None

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    def verify_token(self, token: str) -> bool:
        """Constant-time token verification."""
        input_hash = self._hash_token(token)
        return secrets.compare_digest(self.access_token_hash, input_hash)

    def _sanitize_filename(self, filename: str) -> str:
        """Strips path details, filters control characters, limits length, and provides a safe fallback."""
        if not filename:
            return "uploaded_media"

        # Get basename
        base = Path(filename).name

        # Remove control characters and non-ascii control codes
        clean = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', base)

        # Strip leading/trailing dots/spaces
        clean = clean.strip(". ")

        if not clean:
            return "uploaded_media"

        # Limit length to 100 characters max
        if len(clean) > 100:
            suffix = Path(clean).suffix
            clean = clean[:90] + suffix

        return clean

    def finalize_success(
        self,
        structured_json_path: str,
        export_result_path: str,
        duration: float,
        detected_language: str,
        language_probability: Optional[float],
        word_count: int,
        segment_count: int,
        char_count: int
    ):
        """Finalizes the job on disk and purges raw transcripts from memory."""
        self.status = "completed"
        self.progress_stage = "completed"

        self.structured_json_path = structured_json_path
        self.export_result_path = export_result_path
        self.media_duration_seconds = duration
        self.detected_language = detected_language
        self.language_probability = language_probability
        self.word_count = word_count
        self.segment_count = segment_count
        self.transcript_character_count = char_count

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        self.expires_at = now + self.expiry_delta

        # Privacy: wipe temporary text buffers from memory
        self.temp_full_text = None
        self.temp_segments = None

    def finalize_failure(self, error_code: str, error_message: str):
        """Finalizes the job as failed and clears any trace of the transcript data."""
        self.status = "failed"
        self.progress_stage = "failed"
        self.error_code = error_code
        self.error_message = error_message

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        self.expires_at = now + self.expiry_delta

        # Privacy: clear temporary text buffers from memory
        self.temp_full_text = None
        self.temp_segments = None
