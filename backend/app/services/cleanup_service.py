import asyncio
from typing import Optional
from datetime import datetime, timezone
from loguru import logger

from app.core.config import settings
from app.services.job_service import JobService
from app.utils.storage import get_resolved_storage_root, ensure_storage_exists

class CleanupService:
    def __init__(self, job_service: Optional[JobService] = None):
        # We handle dynamic importing or default initialization to avoid circular dependencies
        self._job_service_override = job_service
        self._running = False
        self._task = None

    @property
    def job_service(self) -> JobService:
        if self._job_service_override:
            return self._job_service_override
        return JobService()

    async def run_startup_cleanup(self):
        """Cleans up all files inside the storage folder on startup."""
        logger.info("Executing startup storage file cleanup...")
        try:
            ensure_storage_exists()
            root = get_resolved_storage_root()

            # 1. Clean TTS files (files directly in root, skipping directories and .gitkeep)
            for item in root.iterdir():
                if item.is_symlink():
                    continue
                if item.is_file() and item.name != ".gitkeep":
                    item.unlink()
                    logger.info(f"Deleted stale TTS file on startup: {item.name}")

            # 2. Clean transcription folders (under root / transcription /)
            trans_dir = root / "transcription"
            if trans_dir.exists() and trans_dir.is_dir():
                import shutil
                for item in trans_dir.iterdir():
                    if item.is_symlink():
                        continue
                    if item.is_dir():
                        shutil.rmtree(item)
                        logger.info(f"Deleted stale transcription folder on startup: {item.name}")
                    elif item.is_file() and item.name != ".gitkeep":
                        item.unlink()
                        logger.info(f"Deleted stale transcription file on startup: {item.name}")
        except Exception as e:
            logger.error(f"Error during startup cleanup: {e}")

    def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._cleanup_loop())
        logger.info("Periodic cleanup service started.")

    def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            logger.info("Periodic cleanup service stopped.")

    async def _cleanup_loop(self):
        # Run in a background loop
        while self._running:
            try:
                await asyncio.sleep(settings.CLEANUP_INTERVAL_SECONDS)
                await self.cleanup_expired_jobs()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in background cleanup loop: {e}")

    async def cleanup_expired_jobs(self):
        """Identifies and purges expired jobs from memory and storage."""
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # 1. Clean TTS jobs
        tts_jobs = self.job_service.list_all_jobs()
        tts_expired_count = 0
        tts_deleted_metadata_count = 0

        for job in tts_jobs:
            if job.status != "expired" and now > job.expires_at and job.status in ["completed", "failed"]:
                self.job_service.expire_job(job.job_id)
                tts_expired_count += 1
            if job.status == "expired":
                time_since_expiry = (now - job.expires_at).total_seconds()
                if time_since_expiry > settings.CLEANUP_PURGE_AFTER_EXPIRY_SECONDS:
                    self.job_service.remove_job_completely(job.job_id)
                    tts_deleted_metadata_count += 1

        # 2. Clean transcription jobs
        from app.services.transcription_job_service import TranscriptionJobService
        trans_job_service = TranscriptionJobService()
        trans_jobs = trans_job_service.list_all_jobs()

        trans_expired_count = 0
        trans_deleted_metadata_count = 0

        for job in trans_jobs:
            if job.status != "expired" and now > job.expires_at and job.status in ["completed", "failed"]:
                trans_job_service.expire_job(job.job_id)
                trans_expired_count += 1
            if job.status == "expired":
                time_since_expiry = (now - job.expires_at).total_seconds()
                if time_since_expiry > settings.CLEANUP_PURGE_AFTER_EXPIRY_SECONDS:
                    trans_job_service.remove_job_completely(job.job_id)
                    trans_deleted_metadata_count += 1

        if tts_expired_count > 0 or tts_deleted_metadata_count > 0:
            logger.info(f"Background cleanup: Expired {tts_expired_count} TTS jobs, Wiped {tts_deleted_metadata_count} metadata records.")
        if trans_expired_count > 0 or trans_deleted_metadata_count > 0:
            logger.info(f"Background cleanup: Expired {trans_expired_count} transcription jobs, Wiped {trans_deleted_metadata_count} metadata records.")
