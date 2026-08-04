import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import List, Tuple
import numpy as np
import soundfile as sf
from loguru import logger

from app.core.config import settings
from app.core.exceptions import EncoderUnavailableException, GenerationFailedException

class AudioService:
    def __init__(self):
        self.sample_rate = 24000  # Kokoro-82M native sample rate
        self.ffmpeg_path = self._discover_ffmpeg()

    def _discover_ffmpeg(self) -> Tuple[bool, str]:
        """Checks if ffmpeg is available on the system path."""
        which_ffmpeg = shutil.which("ffmpeg")
        if which_ffmpeg:
            logger.info("FFmpeg detected successfully on system PATH.")
            return True, which_ffmpeg

        # Check standard installation locations if on Windows
        if os.name == 'nt':
            standard_paths = [
                r"C:\ffmpeg\bin\ffmpeg.exe",
                r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            ]
            for path in standard_paths:
                if Path(path).exists():
                    logger.info("FFmpeg detected at a standard installation location.")
                    return True, path

        logger.warning("FFmpeg was not found. MP3 encoding will not be available.")
        return False, ""

    def is_ffmpeg_available(self) -> bool:
        return self.ffmpeg_path[0]

    def assemble_audio(self, chunk_waveforms: List[Tuple[np.ndarray, str]]) -> Tuple[np.ndarray, float]:
        """
        Assembles multiple chunk waveforms into a unified Float32 mono waveform,
        inserting boundary silence pauses, applying edge fades, removing DC offsets,
        and executing peak normalization.
        """
        if not chunk_waveforms:
            return np.array([], dtype=np.float32), 0.0

        assembled_parts = []

        sentence_pause_samples = int(self.sample_rate * (settings.TTS_SENTENCE_PAUSE_MS / 1000.0))
        paragraph_pause_samples = int(self.sample_rate * (settings.TTS_PARAGRAPH_PAUSE_MS / 1000.0))
        clause_pause_samples = int(self.sample_rate * (100 / 1000.0))  # 100ms clause pause

        for i, (waveform, boundary) in enumerate(chunk_waveforms):
            if waveform is None or len(waveform) == 0:
                continue

            # 1. Convert to mono float32 (Ensure it's 1D)
            if waveform.ndim > 1:
                waveform = np.mean(waveform, axis=1)

            # 2. Apply short edge fades (5ms) to prevent boundary click pops
            processed_wave = self.apply_edge_fades(waveform, fade_ms=5.0)
            assembled_parts.append(processed_wave)

            # 3. Add pause silence based on boundary metadata (unless it is the final chunk)
            if i < len(chunk_waveforms) - 1:
                pause_samples = 0
                if boundary == "paragraph":
                    pause_samples = paragraph_pause_samples
                elif boundary == "sentence":
                    pause_samples = sentence_pause_samples
                elif boundary == "clause":
                    pause_samples = clause_pause_samples

                if pause_samples > 0:
                    assembled_parts.append(np.zeros(pause_samples, dtype=np.float32))

        if not assembled_parts:
            return np.array([], dtype=np.float32), 0.0

        # 4. Concatenate segments into one master waveform
        master_waveform = np.concatenate(assembled_parts)

        # 5. Remove unsafe DC offset (if detected)
        dc_offset = np.mean(master_waveform)
        if np.abs(dc_offset) > 1e-4:
            logger.info(f"Removing DC offset of: {dc_offset:.6f}")
            master_waveform = master_waveform - dc_offset

        # 6. Apply final peak safety adjustment and peak normalization
        max_val = np.max(np.abs(master_waveform))
        if max_val > 0:
            # Scale so that the peak absolute amplitude is exactly 0.95 (conservative peak normalization)
            # This protects against clipping and sets a unified loudness level
            master_waveform = (master_waveform / max_val) * 0.95

        # Calculate duration
        duration_seconds = len(master_waveform) / self.sample_rate
        return master_waveform, duration_seconds

    def apply_edge_fades(self, waveform: np.ndarray, fade_ms: float = 5.0) -> np.ndarray:
        """Applies a 5ms linear fade-in and fade-out to prevent abrupt edge clicks."""
        fade_samples = int(self.sample_rate * (fade_ms / 1000.0))
        if len(waveform) < 2 * fade_samples or fade_samples <= 0:
            return waveform

        fade_in = np.linspace(0.0, 1.0, fade_samples, dtype=np.float32)
        fade_out = np.linspace(1.0, 0.0, fade_samples, dtype=np.float32)

        out_wave = waveform.copy()
        out_wave[:fade_samples] *= fade_in
        out_wave[-fade_samples:] *= fade_out
        return out_wave

    def export_wav(self, waveform: np.ndarray, target_path: Path):
        """Saves Float32 waveform as a 16-bit PCM WAV file."""
        # Convert to 16-bit PCM integer range
        clamped = np.clip(waveform, -1.0, 1.0)
        int16_waveform = (clamped * 32767.0).astype(np.int16)

        # Save WAV
        sf.write(str(target_path), int16_waveform, self.sample_rate, subtype='PCM_16')

        # Verify write
        if not target_path.exists() or target_path.stat().st_size == 0:
            raise GenerationFailedException("Failed to generate WAV file container.")

    def convert_wav_to_mp3(self, wav_path: Path, mp3_path: Path):
        """Uses FFmpeg to convert a WAV file to a high-quality VBR MP3 file."""
        is_avail, ffmpeg_bin = self.ffmpeg_path
        if not is_avail:
            raise EncoderUnavailableException("FFmpeg MP3 encoder is not installed or available on PATH.")

        # Fixed, shell-safe arguments list
        args = [
            ffmpeg_bin,
            "-y",                     # Overwrite output files
            "-i", str(wav_path),      # Input file
            "-codec:a", "libmp3lame", # MP3 encoder
            "-qscale:a", "2",         # VBR quality level 2 (high quality speech, ~170-210 kbps)
            str(mp3_path)             # Output file
        ]

        try:
            logger.info(f"Running FFmpeg MP3 conversion for: {mp3_path.name}")
            result = subprocess.run(
                args,
                capture_output=True,
                check=True,
                shell=False
            )

            # Verify output
            if not mp3_path.exists() or mp3_path.stat().st_size == 0:
                raise GenerationFailedException("FFmpeg ran successfully but MP3 output size is zero.")

            logger.info(f"Successfully generated MP3 file: {mp3_path.name}")
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg MP3 conversion process failed with code {e.returncode}.")
            raise GenerationFailedException(f"FFmpeg MP3 conversion process failed.")
        except Exception as e:
            logger.error(f"Failed to execute FFmpeg sub-process: {e}")
            raise GenerationFailedException(f"Could not execute MP3 conversion process.")
