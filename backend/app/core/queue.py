import asyncio
import os
import concurrent.futures
from datetime import datetime, timedelta
from typing import List, Tuple
import numpy as np
from pathlib import Path
from loguru import logger

from app.core.config import settings
from app.core.exceptions import QueueFullException, TtsException
from app.utils.text_normalizer import normalize_text
from app.utils.text_chunker import chunk_text
from app.services.job_service import JobService
from app.services.kokoro_service import KokoroService
from app.services.audio_service import AudioService
from app.services.rate_limit_service import RateLimitService

class TtsQueueManager:
    _instance = None
    _lock = asyncio.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(TtsQueueManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._queue = asyncio.Queue(maxsize=settings.TTS_MAX_QUEUE_SIZE)

        # Heavy sync operations executor (worker count matches configured TTS worker count)
        self._executor = concurrent.futures.ThreadPoolExecutor(
            max_workers=settings.TTS_WORKER_COUNT,
            thread_name_prefix="tts-worker"
        )

        self._running = False
        self._worker_tasks: List[asyncio.Task] = []

        self.job_service = JobService()
        self.kokoro_service = KokoroService()
        self.audio_service = AudioService()
        self.rate_limit_service = RateLimitService()

    def start(self):
        """Starts background worker loops."""
        if self._running:
            return
        self._running = True
        self._worker_tasks = [
            asyncio.create_task(self._worker_loop(i))
            for i in range(settings.TTS_WORKER_COUNT)
        ]
        logger.info(f"TTS Queue Manager started with {settings.TTS_WORKER_COUNT} worker task(s).")

    async def stop(self):
        """Gracefully shuts down workers and executor."""
        self._running = False
        logger.info("Stopping TTS Queue Manager workers...")

        # Cancel active queue worker tasks
        for task in self._worker_tasks:
            task.cancel()

        if self._worker_tasks:
            # Wait for cancellations to settle
            await asyncio.gather(*self._worker_tasks, return_exceptions=True)

        # Shutdown thread pool executor
        self._executor.shutdown(wait=True, cancel_futures=True)
        logger.info("TTS Queue Manager stopped.")

    def try_enqueue_job(self, job_id: str) -> bool:
        """
        Atomically tries to enqueue a job ID.
        Returns True if successful, False if the queue is full.
        """
        if self._queue.full():
            logger.warning(f"Enqueuing failed: Queue is full (size={self._queue.qsize()})")
            return False

        self._queue.put_nowait(job_id)
        logger.info(f"Enqueued Job: {job_id} (Queue depth: {self._queue.qsize()})")
        return True

    def get_queue_depth(self) -> int:
        return self._queue.qsize()

    async def _worker_loop(self, worker_id: int):
        logger.info(f"Queue Worker-{worker_id} ready.")
        while self._running:
            job_id = None
            try:
                # Retrieve next job from the queue (yields loop execution when empty)
                job_id = await self._queue.get()
                logger.info(f"Worker-{worker_id} picked up Job: {job_id}")

                await self._process_job(job_id)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.exception(f"Unexpected error in Worker-{worker_id} loop: {e}")
            finally:
                if job_id is not None:
                    self._queue.task_done()

    async def _process_job(self, job_id: str):
        job = None
        client_ip = "127.0.0.1" # Fallback

        try:
            # Load job from service
            try:
                job = self.job_service.get_job(job_id)
            except Exception:
                logger.error(f"Worker failed to load Job: {job_id}. Aborting.")
                return

            # Read client IP from rate-limit logs if tracked
            # We locate the rate limiter mapping
            for ip, active in self.rate_limit_service._active_jobs.items():
                if job_id in active:
                    client_ip = ip
                    break

            job.status = "processing"
            job.progress_stage = "preparing_text"

            # Read script text
            original_text = job.text
            if not original_text:
                raise TtsException("TEXT_EMPTY", "Job text is empty.")

            # Determine language for text normalizer
            language = "en-US"
            for v in self.kokoro_service.get_voices():
                if v["id"] == job.voice_id:
                    language = v.get("language", "en-US")
                    break

            # 1. Normalize text (synchronous, fast)
            normalized_text = normalize_text(original_text, language=language)

            # 2. Chunk text (synchronous, fast)
            chunks = chunk_text(normalized_text)
            if not chunks:
                raise TtsException("TEXT_EMPTY", "No speakable content remaining after normalization.")

            loop = asyncio.get_running_loop()
            waveforms_and_boundaries: List[Tuple[np.ndarray, str]] = []

            # 3. Synthesize chunks sequentially using ThreadPoolExecutor to prevent blocking the event loop
            for chunk in chunks:
                job.progress_stage = "generating_speech"

                # Heavy inference: run in executor
                waveform = await loop.run_in_executor(
                    self._executor,
                    self.kokoro_service.synthesize_chunk,
                    chunk.text,
                    job.voice_id,
                    job.speed
                )
                waveforms_and_boundaries.append((waveform, chunk.end_boundary))

            # 4. Assemble audio (heavy float math: run in executor)
            job.progress_stage = "processing_audio"
            master_waveform, duration = await loop.run_in_executor(
                self._executor,
                self.audio_service.assemble_audio,
                waveforms_and_boundaries
            )

            # 5. Finalize output file structure
            job.progress_stage = "finalizing_file"

            storage_root = Path(settings.TTS_STORAGE_ROOT).resolve()
            storage_root.mkdir(parents=True, exist_ok=True)

            wav_path = storage_root / f"konthora-speech-{job.job_id}.wav"
            mp3_path = storage_root / f"konthora-speech-{job.job_id}.mp3"

            # Save temporary WAV master first (run in executor)
            await loop.run_in_executor(
                self._executor,
                self.audio_service.export_wav,
                master_waveform,
                wav_path
            )

            final_file_path = wav_path

            # If user requested MP3 and encoder is ready, convert using FFmpeg
            if job.output_format == "mp3":
                if self.audio_service.is_ffmpeg_available():
                    await loop.run_in_executor(
                        self._executor,
                        self.audio_service.convert_wav_to_mp3,
                        wav_path,
                        mp3_path
                    )
                    final_file_path = mp3_path
                    # Cleanup intermediate WAV file (run in executor)
                    await loop.run_in_executor(self._executor, os.unlink, wav_path)
                else:
                    logger.warning("MP3 requested but FFmpeg is not available. Falling back to WAV.")
                    final_file_path = wav_path
                    job.output_format = "wav"  # Force overwrite format metadata

            # Finalize Success
            # Calculate retention expiration timestamp
            job.expiry_delta = timedelta(minutes=settings.TTS_JOB_RETENTION_MINUTES)
            job.finalize_success(
                file_path=str(final_file_path),
                duration_seconds=duration
            )
            logger.info(f"Successfully finished processing Job: {job_id}. Duration: {duration:.2f}s")

        except Exception as e:
            logger.error(f"Error processing Job: {job_id}: {e}")

            # Retrieve error codes or fallback
            code = "GENERATION_FAILED"
            msg = "Speech synthesis failed due to an internal worker error."

            if isinstance(e, TtsException):
                code = e.code
                msg = e.message

            if job:
                # Cleanup any partially generated files
                job.finalize_failure(error_code=code, error_message=msg)

            # Safe delete files
            if job_id:
                try:
                    wav_temp = Path(settings.TTS_STORAGE_ROOT).resolve() / f"konthora-speech-{job_id}.wav"
                    mp3_temp = Path(settings.TTS_STORAGE_ROOT).resolve() / f"konthora-speech-{job_id}.mp3"
                    if wav_temp.exists():
                        wav_temp.unlink()
                    if mp3_temp.exists():
                        mp3_temp.unlink()
                except OSError:
                    pass
        finally:
            # Always deregister IP rate limits
            if job_id:
                self.rate_limit_service.deregister_active_job(client_ip, job_id)
