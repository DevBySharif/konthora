import os
import sys
import threading
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from loguru import logger

from app.core.config import settings
from app.core.exceptions import (
    ModelUnavailableException,
    InvalidRequestException,
    TtsException,
    GenerationFailedException,
)

# Verified voice catalogue matching Kokoro installed resources
VOICES_CATALOGUE = [
    {
        "id": "af_heart",
        "displayName": "Heart (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": True,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_bella",
        "displayName": "Bella (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_nicole",
        "displayName": "Nicole (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_nova",
        "displayName": "Nova (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_adam",
        "displayName": "Adam (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": True,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_michael",
        "displayName": "Michael (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bf_emma",
        "displayName": "Emma (Female)",
        "gender": "female",
        "accent": "British English",
        "language": "en-GB",
        "recommended": True,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bf_isabella",
        "displayName": "Isabella (Female)",
        "gender": "female",
        "accent": "British English",
        "language": "en-GB",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bm_george",
        "displayName": "George (Male)",
        "gender": "male",
        "accent": "British English",
        "language": "en-GB",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bm_lewis",
        "displayName": "Lewis (Male)",
        "gender": "male",
        "accent": "British English",
        "language": "en-GB",
        "recommended": True,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    }
]

class KokoroService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if not cls._instance:
                cls._instance = super(KokoroService, cls).__new__(cls)
                cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        self._initialized = True
        self._model_ready = False
        self._model_status = "uninitialized"  # uninitialized | loading | ready | failed
        self._pipelines = {}
        self._load_lock = threading.Lock()
        self._error_message = None

    def get_status(self) -> Tuple[bool, str, Optional[str]]:
        """Returns (model_ready, model_status, error_message)"""
        return self._model_ready, self._model_status, self._error_message

    def get_voices(self) -> List[Dict[str, Any]]:
        return VOICES_CATALOGUE

    def get_lang_code_for_voice(self, voice_id: str) -> str:
        # American English voice mappings
        if voice_id.startswith(("af_", "am_")):
            return "a"
        # British English voice mappings
        elif voice_id.startswith(("bf_", "bm_")):
            return "b"
        else:
            logger.error(f"Voice prefix mapping failed for: {voice_id}")
            raise InvalidRequestException("VOICE_UNSUPPORTED", f"Unsupported voice prefix for voice: {voice_id}")

    def load_pipeline(self, lang_code: str):
        """Loads and caches KPipeline for the given lang_code safely inside a thread lock."""
        # Setup espeak path environment variables before loading KPipeline if eSpeak path is configured
        self._setup_espeak_env()

        with self._load_lock:
            if lang_code in self._pipelines:
                return self._pipelines[lang_code]

            self._model_status = "loading"
            logger.info(f"Initializing Kokoro KPipeline for language code: {lang_code}")
            try:
                from kokoro import KPipeline
                # Initialize pipeline (this fetches model weights from Hugging Face if not local)
                pipeline = KPipeline(lang_code=lang_code)
                self._pipelines[lang_code] = pipeline
                self._model_ready = True
                self._model_status = "ready"
                logger.info(f"Successfully initialized KPipeline for language code: {lang_code}")
                return pipeline
            except Exception as e:
                self._model_ready = False
                self._model_status = "failed"
                self._error_message = str(e)
                logger.exception(f"Failed to load KPipeline for lang_code {lang_code}: {e}")
                raise ModelUnavailableException(f"Failed to initialize speech engine: {e}")

    def synthesize_chunk(self, chunk_text: str, voice_id: str, speed: float) -> np.ndarray:
        """
        Synthesizes a single chunk of text into a float32 NumPy waveform.
        Designed to run inside the ThreadPoolExecutor worker.
        """
        if not chunk_text.strip():
            return np.array([], dtype=np.float32)

        # Validate voice exists
        if not any(v["id"] == voice_id for v in VOICES_CATALOGUE):
            raise InvalidRequestException("VOICE_UNSUPPORTED", f"Voice ID '{voice_id}' is not supported.")

        lang_code = self.get_lang_code_for_voice(voice_id)
        pipeline = self.load_pipeline(lang_code)

        try:
            # Generate speech
            generator = pipeline(chunk_text, voice=voice_id, speed=speed)
            waveforms = []

            for gs, ps, audio in generator:
                if audio is not None and len(audio) > 0:
                    # Convert PyTorch tensor to pure NumPy array if needed
                    if not isinstance(audio, np.ndarray):
                        if hasattr(audio, "detach"):
                            audio = audio.detach().cpu().numpy()
                        else:
                            audio = np.asarray(audio)

                    # Validate waveform values
                    if not np.all(np.isfinite(audio)):
                        logger.warning(f"NaN or Infinite values detected in generated audio segment. Cleared.")
                        audio = np.nan_to_num(audio)
                    waveforms.append(audio.astype(np.float32))

            if not waveforms:
                logger.error(f"Synthesis returned empty waveforms for text: {chunk_text}")
                raise GenerationFailedException("Inference produced empty audio output.")

            return np.concatenate(waveforms)
        except Exception as e:
            logger.error(f"Inference synthesis error: {e}")
            if isinstance(e, TtsException):
                raise e
            raise GenerationFailedException(f"Kokoro synthesis failed: {e}")

    def _setup_espeak_env(self):
        """Resolves and configures local eSpeak library paths for the phonemizer wrapper."""
        # 1. Explicit ESPEAK_PATH from settings/environment
        espeak_path = settings.ESPEAK_PATH
        if espeak_path:
            p = Path(espeak_path)
            if p.exists():
                os.environ["PHONEMIZER_ESPEAK_PATH"] = str(p)
                os.environ["PATH"] = str(p) + os.pathsep + os.environ["PATH"]
                return

        # 2. Check if espeak-ng is already on path
        import shutil
        which_espeak = shutil.which("espeak-ng") or shutil.which("espeak")
        if which_espeak:
            os.environ["PHONEMIZER_ESPEAK_PATH"] = str(Path(which_espeak).parent)
            return

        # 3. Check Windows Program Files locations
        if sys.platform == "win32":
            pf_locations = [
                Path(os.environ.get("ProgramFiles", "C:\\Program Files")) / "eSpeak NG",
                Path(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")) / "eSpeak NG",
                Path("C:\\Program Files\\eSpeak NG"),
                Path("C:\\Program Files (x86)\\eSpeak NG"),
            ]
            for loc in pf_locations:
                if loc.exists() and ((loc / "espeak-ng.exe").exists() or (loc / "libespeak-ng.dll").exists()):
                    os.environ["PHONEMIZER_ESPEAK_PATH"] = str(loc)
                    os.environ["PATH"] = str(loc) + os.pathsep + os.environ["PATH"]
                    return

            # 4. Check Windows Registry
            try:
                import winreg
                for sub_key in [r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\eSpeak NG",
                                r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\eSpeak NG"]:
                    try:
                        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, sub_key) as key:
                            install_location, _ = winreg.QueryValueEx(key, "InstallLocation")
                            if install_location:
                                loc = Path(install_location)
                                if loc.exists() and ((loc / "espeak-ng.exe").exists() or (loc / "libespeak-ng.dll").exists()):
                                    os.environ["PHONEMIZER_ESPEAK_PATH"] = str(loc)
                                    os.environ["PATH"] = str(loc) + os.pathsep + os.environ["PATH"]
                                    return
                    except OSError:
                        continue
            except (ImportError, OSError):
                pass
