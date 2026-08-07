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
    },
    {
        "id": "af_alloy",
        "displayName": "Alloy (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_aoede",
        "displayName": "Aoede (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_jessica",
        "displayName": "Jessica (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_kore",
        "displayName": "Kore (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_river",
        "displayName": "River (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_sarah",
        "displayName": "Sarah (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "af_sky",
        "displayName": "Sky (Female)",
        "gender": "female",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_echo",
        "displayName": "Echo (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_eric",
        "displayName": "Eric (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_fenrir",
        "displayName": "Fenrir (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_liam",
        "displayName": "Liam (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_onyx",
        "displayName": "Onyx (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_puck",
        "displayName": "Puck (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "am_santa",
        "displayName": "Santa (Male)",
        "gender": "male",
        "accent": "American English",
        "language": "en-US",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bf_alice",
        "displayName": "Alice (Female)",
        "gender": "female",
        "accent": "British English",
        "language": "en-GB",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bf_lily",
        "displayName": "Lily (Female)",
        "gender": "female",
        "accent": "British English",
        "language": "en-GB",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bm_daniel",
        "displayName": "Daniel (Male)",
        "gender": "male",
        "accent": "British English",
        "language": "en-GB",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "bm_fable",
        "displayName": "Fable (Male)",
        "gender": "male",
        "accent": "British English",
        "language": "en-GB",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "hf_alpha",
        "displayName": "Alpha (Female)",
        "gender": "female",
        "accent": "Hindi",
        "language": "hi-IN",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "hf_beta",
        "displayName": "Beta (Female)",
        "gender": "female",
        "accent": "Hindi",
        "language": "hi-IN",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "hm_omega",
        "displayName": "Omega (Male)",
        "gender": "male",
        "accent": "Hindi",
        "language": "hi-IN",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "hm_psi",
        "displayName": "Psi (Male)",
        "gender": "male",
        "accent": "Hindi",
        "language": "hi-IN",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    }
,
    {
        "id": "ef_dora",
        "displayName": "Dora (Female)",
        "gender": "female",
        "accent": "Spanish",
        "language": "es",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "em_alex",
        "displayName": "Alex (Male)",
        "gender": "male",
        "accent": "Spanish",
        "language": "es",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "em_santa",
        "displayName": "Santa (Male)",
        "gender": "male",
        "accent": "Spanish",
        "language": "es",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "ff_siwis",
        "displayName": "Siwis (Female)",
        "gender": "female",
        "accent": "French",
        "language": "fr-FR",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "if_sara",
        "displayName": "Sara (Female)",
        "gender": "female",
        "accent": "Italian",
        "language": "it",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "im_nicola",
        "displayName": "Nicola (Male)",
        "gender": "male",
        "accent": "Italian",
        "language": "it",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "pf_dora",
        "displayName": "Dora (Female)",
        "gender": "female",
        "accent": "Portuguese",
        "language": "pt-BR",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "pm_alex",
        "displayName": "Alex (Male)",
        "gender": "male",
        "accent": "Portuguese",
        "language": "pt-BR",
        "recommended": False,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25
    },
    {
        "id": "pm_santa",
        "displayName": "Santa (Male)",
        "gender": "male",
        "accent": "Portuguese",
        "language": "pt-BR",
        "recommended": False,
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
        voices = []
        for voice in VOICES_CATALOGUE:
            item = dict(voice)
            item["engine"] = "kokoro"
            item["previewUrl"] = f"/audio/voice-previews/{item['id']}.mp3"
            voices.append(item)
        return voices

    def get_lang_code_for_voice(self, voice_id: str) -> str:
        for voice in VOICES_CATALOGUE:
            if voice["id"] == voice_id:
                lang = voice.get("language")
                if lang == "en-US":
                    return "a"
                elif lang == "en-GB":
                    return "b"
                elif lang == "hi-IN":
                    return "h"
                elif lang == "es":
                    return "e"
                elif lang == "fr-FR":
                    return "f"
                elif lang == "it":
                    return "i"
                elif lang == "pt-BR":
                    return "p"
                
        logger.error(f"Voice language mapping failed for: {voice_id}")
        raise InvalidRequestException("VOICE_UNSUPPORTED", f"Unsupported or unknown voice ID: {voice_id}")

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

                # --- NARROW COMPATIBILITY WRAPPER ---
                # Kokoro's KPipeline assumes `pipeline.g2p(text)` returns a string for non-English languages.
                # However, newer versions of misaki's EspeakG2P return a tuple: (phoneme_string, metadata).
                # This causes KPipeline to tokenize the tuple representation, truncating all audio.
                # Rather than globally monkey-patching misaki, we wrap the specific pipeline instance's G2P callable.
                if lang_code not in ('a', 'b'):
                    original_g2p = pipeline.g2p
                    
                    class MisakiTupleAdapter:
                        def __init__(self, orig):
                            self.orig = orig
                        def __call__(self, *args, **kwargs):
                            res = self.orig(*args, **kwargs)
                            # KPipeline expects a string. If we receive a tuple, return the first element.
                            if isinstance(res, tuple) and len(res) > 0 and isinstance(res[0], str):
                                return res[0]
                            # If it's already a string, or misaki reverts to string returns in the future, pass it through.
                            if isinstance(res, str):
                                return res
                            # Fail clearly on unexpected types instead of silently truncating audio.
                            raise TypeError(f"Unexpected return type from G2P: {type(res)}")
                            
                    pipeline.g2p = MisakiTupleAdapter(original_g2p)
                # -------------------------------

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
                logger.error("Synthesis returned empty waveforms for the processed chunk.")
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
