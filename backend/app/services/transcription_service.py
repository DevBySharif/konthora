import threading
import time
import os
from pathlib import Path
from typing import Tuple, Dict, Any, Optional, List
from loguru import logger

from app.core.config import settings
from app.core.exceptions import (
    TranscriptionModelUnavailableException,
    GenerationFailedException,
    InvalidRequestException,
)

class TranscriptionService:
    _instance = None
    _init_lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._init_lock:
                if not cls._instance:
                    cls._instance = super(TranscriptionService, cls).__new__(cls)
                    cls._instance._model = None
                    cls._instance._model_status = "not_loaded"
                    cls._instance._model_lock = threading.Lock()
                    cls._instance._load_lock = threading.Lock()
                    cls._instance._error_message = None
        return cls._instance

    def get_status(self) -> Tuple[bool, str, Optional[str]]:
        """Returns (is_ready, status_string, error_message)."""
        return (self._model_status == "ready", self._model_status, self._error_message)

    def load_model(self) -> None:
        """
        Synchronously loads the Whisper model inside the calling thread.
        Should be called outside the FastAPI main async event loop.
        """
        if self._model_status == "ready":
            return

        with self._load_lock:
            # Recheck after acquiring lock
            if self._model_status in ["ready", "loading"]:
                return

            self._model_status = "loading"
            self._error_message = None

            model_name = settings.TRANSCRIPTION_MODEL
            device = settings.TRANSCRIPTION_DEVICE
            compute_type = settings.TRANSCRIPTION_COMPUTE_TYPE

            logger.info(f"Initializing faster-whisper Model: {model_name} | Device: {device} | Compute Type: {compute_type}")

            try:
                from faster_whisper import WhisperModel

                # Check for model download cache path environment override
                # By default Hugging Face cache downloads to ~/.cache/huggingface/hub
                # We initialize WhisperModel inside this lock
                model = WhisperModel(
                    model_size_or_path=model_name,
                    device=device,
                    compute_type=compute_type,
                    download_root=os.environ.get("HF_HOME")
                )

                with self._model_lock:
                    self._model = model
                    self._model_status = "ready"
                logger.info(f"Successfully initialized WhisperModel: {model_name}")

            except Exception as e:
                self._model_status = "failed"
                self._error_message = str(e)
                logger.error(f"Failed to load WhisperModel '{model_name}': {e}")
                # We do not raise here, to allow the service state to remain "failed" safely.

    def transcribe_audio(
        self,
        wav_path: Path,
        language: str = "auto"
    ) -> Dict[str, Any]:
        """
        Executes transcription on the standardized 16kHz WAV file.
        This must be called inside the worker thread to prevent blocking.
        """
        # Ensure the model is loaded. If failed, raise.
        if self._model_status != "ready":
            self.load_model()

        if self._model_status != "ready":
            raise TranscriptionModelUnavailableException(
                f"Model is not ready. Status: {self._model_status}. Reason: {self._error_message}"
            )

        # Validate language input
        lang_param = None if language == "auto" else language

        try:
            logger.info(f"Starting faster-whisper transcription for: {wav_path.name}")

            # Setup configuration arguments centrally
            beam_size = settings.TRANSCRIPTION_BEAM_SIZE
            word_timestamps = settings.TRANSCRIPTION_WORD_TIMESTAMPS
            vad_enabled = settings.TRANSCRIPTION_VAD_ENABLED

            # centralize VAD options
            vad_options = None
            if vad_enabled:
                vad_options = {
                    "min_silence_duration_ms": settings.TRANSCRIPTION_VAD_MIN_SILENCE_MS,
                    "speech_pad_ms": settings.TRANSCRIPTION_VAD_SPEECH_PAD_MS
                }

            with self._model_lock:
                # Transcribe returns (segments_generator, info_object)
                segments_gen, info = self._model.transcribe(
                    str(wav_path),
                    language=lang_param,
                    task="transcribe",
                    beam_size=beam_size,
                    word_timestamps=word_timestamps,
                    vad_filter=vad_enabled,
                    vad_parameters=vad_options,
                    temperature=0.0 # Deterministic decoding temperatures
                )

            # Consuming the generator fully inside the worker thread, catching any generation exceptions
            segments_list = []
            for s in segments_gen:
                segment_words = []
                if s.words:
                    for w in s.words:
                        segment_words.append({
                            "word": w.word,
                            "start": w.start,
                            "end": w.end,
                            "probability": w.probability
                        })

                segments_list.append({
                    "id": s.id,
                    "text": s.text,
                    "start": s.start,
                    "end": s.end,
                    "no_speech_probability": getattr(s, "no_speech_prob", None),
                    "words": segment_words
                })

            result = {
                "detected_language": info.language,
                "language_probability": getattr(info, "language_probability", None),
                "duration": info.duration,
                "segments": segments_list
            }

            logger.info(f"Completed transcription for: {wav_path.name} | Detected language: {info.language} | Segments: {len(segments_list)}")
            return result

        except Exception as e:
            logger.error(f"faster-whisper inference failed for {wav_path.name}: {e}")
            raise GenerationFailedException(f"Whisper inference error: {e}")
