import asyncio
import concurrent.futures
import json
from pathlib import Path
from typing import Dict, Any, Optional, Set
from loguru import logger

from app.core.config import settings
from app.services.transcription_job_service import TranscriptionJobService
from app.services.transcription_service import TranscriptionService
from app.services.media_service import MediaService
from app.services.transcript_formatter import TranscriptFormatter
from app.utils.storage import resolve_secure_path

class TranscriptionQueueManager:
    _instance = None
    _lock = asyncio.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(TranscriptionQueueManager, cls).__new__(cls)
            cls._instance._queue = asyncio.Queue(maxsize=settings.TRANSCRIPTION_MAX_QUEUE_SIZE)
            cls._instance._executor = concurrent.futures.ThreadPoolExecutor(
                max_workers=settings.TRANSCRIPTION_WORKER_COUNT,
                thread_name_prefix="TranscriptionWorker"
            )
            cls._instance._worker_tasks = []
            cls._instance._running = False

            # Keep track of active slots reserved to prevent race conditions during upload
            cls._instance._active_slots = 0
            cls._instance._slots_lock = asyncio.Lock()
        return cls._instance

    def get_queue_depth(self) -> int:
        """Returns the current number of pending items in the queue."""
        return self._queue.qsize()

    def start(self):
        """Starts the background worker queue tasks in the FastAPI event loop."""
        if self._running:
            return
        self._running = True
        self._worker_tasks = [
            asyncio.create_task(self._worker_loop(i))
            for i in range(settings.TRANSCRIPTION_WORKER_COUNT)
        ]
        logger.info(f"Transcription Queue Manager started with {settings.TRANSCRIPTION_WORKER_COUNT} worker task(s).")

    async def stop(self):
        """Gracefully shuts down workers and thread executor."""
        self._running = False
        logger.info("Stopping Transcription Queue Manager workers...")

        for task in self._worker_tasks:
            task.cancel()

        if self._worker_tasks:
            await asyncio.gather(*self._worker_tasks, return_exceptions=True)
            self._worker_tasks = []

        self._executor.shutdown(wait=True, cancel_futures=True)
        logger.info("Transcription Queue Manager stopped.")

    async def reserve_admission_slot(self) -> bool:
        """
        Atomically attempts to reserve a slot before streaming a large upload.
        Returns True if reservation succeeds, False if queue + slots are full.
        """
        async with self._slots_lock:
            total_active = self._queue.qsize() + self._active_slots
            if total_active >= settings.TRANSCRIPTION_MAX_QUEUE_SIZE:
                logger.warning(f"Admission slot request rejected. Active slots: {total_active} / Max: {settings.TRANSCRIPTION_MAX_QUEUE_SIZE}")
                return False
            self._active_slots += 1
            logger.info(f"Reserved transcription admission slot. Active reserved slots: {self._active_slots}")
            return True

    async def release_admission_slot(self) -> None:
        """Releases a reserved slot (e.g. if validation or upload fails)."""
        async with self._slots_lock:
            if self._active_slots > 0:
                self._active_slots -= 1
                logger.info(f"Released transcription admission slot. Active reserved slots: {self._active_slots}")

    async def enqueue_job(self, job_id: str) -> None:
        """
        Places a successfully uploaded job in the processing queue.
        Releases one reserved upload slot.
        """
        # Place in queue (we already checked capacity via reservation)
        await self._queue.put(job_id)
        async with self._slots_lock:
            if self._active_slots > 0:
                self._active_slots -= 1
        logger.info(f"Enqueued Transcription Job: {job_id} (Queue size: {self._queue.qsize()})")

    async def _worker_loop(self, worker_id: int):
        logger.info(f"Transcription Queue Worker-{worker_id} ready.")
        while self._running:
            try:
                # Wait for next job
                job_id = await self._queue.get()
                logger.info(f"Transcription Worker-{worker_id} picked up Job: {job_id}")

                # Execute heavy conversion and inference in executor thread
                loop = asyncio.get_running_loop()
                await loop.run_in_executor(
                    self._executor,
                    self._process_job_sync,
                    job_id
                )

                self._queue.task_done()

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Uncaught exception in Transcription Worker-{worker_id} loop: {e}")
                await asyncio.sleep(1.0) # avoid rapid spinning

    def _process_job_sync(self, job_id: str) -> None:
        """
        Synchronous job processing steps. Runs inside the ThreadPoolExecutor.
        """
        job_service = TranscriptionJobService()
        trans_service = TranscriptionService()
        media_service = MediaService()
        formatter = TranscriptFormatter()

        try:
            job = job_service.get_job(job_id)
        except Exception:
            logger.error(f"Worker could not find Job ID: {job_id}")
            return

        logger.info(f"Processing Job {job_id} | Stage: inspecting_media")
        job.progress_stage = "inspecting_media"

        job_dir = resolve_secure_path(f"transcription/{job_id}")
        source_path = job_dir / f"source{Path(job.original_filename).suffix}"
        wav_path = job_dir / "audio.wav"

        try:
            # 1. Inspect Media container and stream presence
            info = media_service.inspect_media(source_path)
            job.media_duration_seconds = info["duration"]

            # 2. Extract standardized WAV file
            logger.info(f"Processing Job {job_id} | Stage: extracting_audio")
            job.progress_stage = "extracting_audio"
            media_service.extract_audio(source_path, wav_path)

            # 3. Transcribe WAV audio (includes lazy-loading model if not ready)
            logger.info(f"Processing Job {job_id} | Stage: transcribing")
            job.progress_stage = "transcribing"

            # Transcription language parameters
            lang = job.detected_language or "auto"
            trans_result = trans_service.transcribe_audio(wav_path, language=lang)

            # Save raw outputs temporarily
            job.temp_full_text = " ".join([s["text"] for s in trans_result["segments"]]).strip()
            job.temp_segments = trans_result["segments"]

            # 4. Formulate output groupings and files
            logger.info(f"Processing Job {job_id} | Stage: formatting_transcript")
            job.progress_stage = "formatting_transcript"

            # Sanitize raw outputs
            valid_segments = formatter.sanitize_and_validate_segments(
                trans_result["segments"],
                info["duration"]
            )

            # Silence-only checks
            if not valid_segments or not job.temp_full_text:
                # Silence-only input policy: Complete job with an empty text file and clear status msg
                logger.info(f"No speech detected in media for Job {job_id}")

                # Write empty files atomically
                json_path = job_dir / "transcript.json"
                export_path = job_dir / f"result.{job.export_format}"

                empty_doc = {
                    "schemaVersion": "1.0",
                    "jobId": job_id,
                    "source": {
                        "displayName": job.original_filename,
                        "extension": Path(job.original_filename).suffix,
                        "sizeBytes": job.file_size_bytes,
                        "durationSeconds": info["duration"]
                    },
                    "language": {
                        "requested": lang,
                        "detected": trans_result["detected_language"],
                        "probability": trans_result["language_probability"]
                    },
                    "timestampMode": job.timestamp_mode,
                    "fullText": "",
                    "segments": [],
                    "words": []
                }

                formatter.write_atomic_result(json_path, json.dumps(empty_doc, indent=2))

                empty_export = "No speech was detected."
                if job.export_format == "srt":
                    empty_export = ""
                elif job.export_format == "vtt":
                    empty_export = "WEBVTT\n\n"
                elif job.export_format == "json":
                    empty_export = json.dumps(empty_doc, indent=2)

                formatter.write_atomic_result(export_path, empty_export)

                job.finalize_success(
                    structured_json_path=str(json_path),
                    export_result_path=str(export_path),
                    duration=info["duration"],
                    detected_language=trans_result["detected_language"],
                    language_probability=trans_result["language_probability"],
                    word_count=0,
                    segment_count=0,
                    char_count=0
                )

                # Cleanup audio files early
                self._cleanup_audio_files(source_path, wav_path)
                return

            # Group transcript segments according to mode
            words_list = []
            if job.timestamp_mode == "word":
                formatted_units = formatter.format_to_lines(valid_segments)
                # Populate words_list
                for s in valid_segments:
                    words_list.extend(s.get("words", []))
            elif job.timestamp_mode == "paragraph":
                sentences = formatter.group_sentences(valid_segments)
                formatted_units = formatter.group_paragraphs(sentences)
            else: # sentence mode
                formatted_units = formatter.group_sentences(valid_segments)

            # Build export text
            if job.export_format == "srt":
                export_text = formatter.export_srt(formatted_units)
            elif job.export_format == "vtt":
                export_text = formatter.export_vtt(formatted_units)
            elif job.export_format == "json":
                # Build json document
                json_doc = {
                    "schemaVersion": "1.0",
                    "jobId": job_id,
                    "source": {
                        "displayName": job.original_filename,
                        "extension": Path(job.original_filename).suffix,
                        "sizeBytes": job.file_size_bytes,
                        "durationSeconds": info["duration"]
                    },
                    "language": {
                        "requested": lang,
                        "detected": trans_result["detected_language"],
                        "probability": trans_result["language_probability"]
                    },
                    "timestampMode": job.timestamp_mode,
                    "fullText": job.temp_full_text,
                    "segments": formatted_units,
                    "words": words_list
                }
                export_text = json.dumps(json_doc, indent=2)
            else: # txt
                export_text = formatter.export_txt(formatted_units)

            # Write export result atomically
            export_path = job_dir / f"result.{job.export_format}"
            formatter.write_atomic_result(export_path, export_text)

            # Write structured JSON atomically for frontend previews
            preview_doc = {
                "schemaVersion": "1.0",
                "jobId": job_id,
                "fullText": job.temp_full_text,
                "durationSeconds": info["duration"],
                "detectedLanguage": trans_result["detected_language"],
                "languageProbability": trans_result["language_probability"],
                "segments": formatted_units,
                "words": words_list
            }
            json_path = job_dir / "transcript.json"
            formatter.write_atomic_result(json_path, json.dumps(preview_doc, indent=2))

            # Compute stats
            word_count = sum(len(s.get("words", [])) for s in valid_segments)
            if word_count == 0:
                # count from text splits
                word_count = len(job.temp_full_text.split())

            char_count = len(job.temp_full_text)

            logger.info(f"Processing Job {job_id} | Stage: finalizing_result")
            job.progress_stage = "finalizing_result"

            # 5. Finalize Success
            job.finalize_success(
                structured_json_path=str(json_path),
                export_result_path=str(export_path),
                duration=info["duration"],
                detected_language=trans_result["detected_language"],
                language_probability=trans_result["language_probability"],
                word_count=word_count,
                segment_count=len(formatted_units),
                char_count=char_count
            )
            logger.info(f"Successfully processed Transcription Job {job_id}")

            # Cleanup source/intermediate media files to preserve disk space
            self._cleanup_audio_files(source_path, wav_path)

        except Exception as e:
            logger.error(f"Error while processing Transcription Job {job_id}: {e}")
            job.finalize_failure("TRANSCRIPTION_FAILED", f"Job execution failed: {e}")

            # Clean up all media and result paths on failure
            self._cleanup_audio_files(source_path, wav_path)

            # Clean any partial results
            for ext in ["transcript.json", f"result.{job.export_format}"]:
                p = job_dir / ext
                if p.exists():
                    try:
                        p.unlink()
                    except Exception:
                        pass

    def _cleanup_audio_files(self, source_path: Path, wav_path: Path):
        """Idempotent clean of source upload and extracted WAV files."""
        for path in [source_path, wav_path]:
            if path.exists():
                try:
                    path.unlink()
                    logger.info(f"Cleaned up intermediate media file: {path.name}")
                except Exception as e:
                    logger.warning(f"Could not clean up intermediate media file {path.name}: {e}")
