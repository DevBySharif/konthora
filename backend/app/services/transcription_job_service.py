import uuid
import threading
from typing import Dict, Optional, List
from datetime import datetime, timezone
from loguru import logger

from app.models.transcription_job import TranscriptionJob
from app.core.config import settings
from app.core.exceptions import (
    JobNotFoundException,
    JobExpiredException,
    UnauthorizedJobAccessException
)
from app.utils.storage import resolve_secure_path

class TranscriptionJobService:
    _instance = None
    _init_lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._init_lock:
                if not cls._instance:
                    cls._instance = super(TranscriptionJobService, cls).__new__(cls)
                    cls._instance._jobs = {}
                    cls._instance._lock = threading.Lock()
        return cls._instance

    def create_job(
        self,
        original_filename: str,
        file_size_bytes: int,
        timestamp_mode: str,
        export_format: str
    ) -> TranscriptionJob:
        """Creates a new job in-memory, allocates a UUID, and configures default state."""
        job_id = str(uuid.uuid4())
        job = TranscriptionJob(
            job_id=job_id,
            original_filename=original_filename,
            file_size_bytes=file_size_bytes,
            timestamp_mode=timestamp_mode,
            export_format=export_format,
            retention_minutes=settings.TRANSCRIPTION_JOB_RETENTION_MINUTES
        )
        with self._lock:
            self._jobs[job_id] = job
        logger.info(f"Created Transcription Job: {job_id} | File: {job.original_filename} | Size: {file_size_bytes} bytes")
        return job

    def get_job(self, job_id: str) -> TranscriptionJob:
        """Retrieves a transcription job by its ID, checking for expiration."""
        with self._lock:
            if job_id not in self._jobs:
                logger.warning(f"Transcription Job ID not found: {job_id}")
                raise JobNotFoundException()
            job = self._jobs[job_id]

        # Check if job has expired based on current datetime
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if job.status != "expired" and now > job.expires_at and job.status in ["completed", "failed"]:
            self.expire_job(job_id)

        if job.status == "expired":
            raise JobExpiredException()

        return job

    def verify_job_access(self, job_id: str, token: str) -> TranscriptionJob:
        """Verifies if the client has constant-time access authorization for a job."""
        job = self.get_job(job_id)
        if not job.verify_token(token):
            logger.warning(f"Unauthorized access attempt for Transcription Job: {job_id}")
            raise UnauthorizedJobAccessException()
        return job

    def expire_job(self, job_id: str):
        """Transition job to expired state and delete result files from disk."""
        with self._lock:
            if job_id in self._jobs:
                job = self._jobs[job_id]
                if job.status == "expired":
                    return
                job.status = "expired"
                job.progress_stage = "expired"

        logger.info(f"Expiring Transcription Job: {job_id}")
        self._delete_job_files(job)

    def _delete_job_files(self, job: TranscriptionJob):
        """Wipes the job folder and files on disk."""
        # Clean folder transcription/<job_id>
        job_dir = resolve_secure_path(f"transcription/{job.job_id}")
        if job_dir.exists() and job_dir.is_dir():
            try:
                import shutil
                shutil.rmtree(job_dir)
                logger.info(f"Wiped transcription storage directory: {job_dir.name}")
            except Exception as e:
                logger.warning(f"Could not wipe transcription directory {job_dir}: {e}")

    def remove_job_completely(self, job_id: str):
        """Removes the job from the registry completely to avoid memory leaks."""
        with self._lock:
            if job_id in self._jobs:
                job = self._jobs[job_id]
                self._delete_job_files(job)
                self._jobs.pop(job_id)

    def list_all_jobs(self) -> List[TranscriptionJob]:
        """Returns all jobs (used for cleanup routines)."""
        with self._lock:
            return list(self._jobs.values())
