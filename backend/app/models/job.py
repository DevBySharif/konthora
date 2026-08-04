from datetime import datetime, timezone
from typing import Optional
import secrets
import hashlib

class TtsJob:
    def __init__(
        self,
        job_id: str,
        text: str,
        voice_id: str,
        accent: str,
        speed: float,
        output_format: str,
        retention_minutes: int
    ):
        self.job_id = job_id
        # Original text stored in memory for processing
        self.text: Optional[str] = text
        self.voice_id = voice_id
        self.accent = accent
        self.speed = speed
        self.output_format = output_format
        self.character_count = len(text)

        self.status = "queued"
        self.progress_stage = "queued"
        self.created_at = datetime.now(timezone.utc).replace(tzinfo=None)
        self.expires_at = datetime.now(timezone.utc).replace(tzinfo=None) # Updated after processing finishes

        self.duration_seconds: Optional[float] = None
        self.error_code: Optional[str] = None
        self.error_message: Optional[str] = None
        self.file_path: Optional[str] = None

        # Access token creation
        self.raw_access_token = secrets.token_urlsafe(32)
        self.access_token_hash = self._hash_token(self.raw_access_token)

        self.retention_minutes = retention_minutes

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    def verify_token(self, token: str) -> bool:
        """Constant-time token verification."""
        input_hash = self._hash_token(token)
        return secrets.compare_digest(self.access_token_hash, input_hash)

    def finalize_success(self, file_path: str, duration_seconds: float):
        self.status = "completed"
        self.progress_stage = "completed"
        self.file_path = file_path
        self.duration_seconds = duration_seconds
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        self.expires_at = now + getattr(self, "expiry_delta", None) or now
        self.clear_text()

    def finalize_failure(self, error_code: str, error_message: str):
        self.status = "failed"
        self.progress_stage = "failed"
        self.error_code = error_code
        self.error_message = error_message
        self.clear_text()

    def clear_text(self):
        """Privacy constraint: wipe original text from memory after job concludes."""
        self.text = None
