import uuid
from typing import Dict, Optional, List
from datetime import datetime, timezone
from loguru import logger

from app.models.job import TtsJob
from app.core.config import settings
from app.core.exceptions import JobNotFoundException, JobExpiredException, UnauthorizedJobAccessException
from app.utils.storage import delete_job_files

class JobService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(JobService, cls).__new__(cls)
            cls._instance._jobs = {}
        return cls._instance

    def create_job(
        self,
        text: str,
        voice_id: str,
        accent: str,
        speed: float,
        output_format: str
    ) -> TtsJob:
        """Creates a new job in-memory, allocates a UUID, and configures default state."""
        job_id = str(uuid.uuid4())
        job = TtsJob(
            job_id=job_id,
            text=text,
            voice_id=voice_id,
            accent=accent,
            speed=speed,
            output_format=output_format,
            retention_minutes=settings.TTS_JOB_RETENTION_MINUTES
        )
        self._jobs[job_id] = job
        logger.info(f"Created Job: {job_id} | Character count: {len(text)} | Voice: {voice_id}")
        return job

    def get_job(self, job_id: str) -> TtsJob:
        """Retrieves a job by its ID, validating its existence."""
        if job_id not in self._jobs:
            logger.warning(f"Job ID not found in memory: {job_id}")
            raise JobNotFoundException()

        job = self._jobs[job_id]

        # Check if job has expired based on current datetime
        if job.status != "expired" and datetime.now(timezone.utc).replace(tzinfo=None) > job.expires_at and job.status in ["completed", "failed"]:
            self.expire_job(job_id)

        if job.status == "expired":
            raise JobExpiredException()

        return job

    def verify_job_access(self, job_id: str, token: str) -> TtsJob:
        """Helper to get a job and verify its bearer token in constant-time."""
        job = self.get_job(job_id)
        if not token or not job.verify_token(token):
            logger.warning(f"Unauthorized access attempt for Job ID: {job_id}")
            raise UnauthorizedJobAccessException()
        return job

    def expire_job(self, job_id: str):
        """Transitions a job status to expired and deletes its temporary generated audio files."""
        if job_id not in self._jobs:
            return

        job = self._jobs[job_id]
        if job.status != "expired":
            logger.info(f"Expiring Job: {job_id}")
            job.status = "expired"
            job.progress_stage = "expired"

            # Wipe files from storage
            delete_job_files(job_id)

            # Clean paths and data
            job.file_path = None
            job.clear_text()

    def remove_job_completely(self, job_id: str):
        """Wipes metadata record from in-memory registry entirely."""
        if job_id in self._jobs:
            self._jobs.pop(job_id)

    def list_all_jobs(self) -> List[TtsJob]:
        return list(self._jobs.values())
