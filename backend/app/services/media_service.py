import os
import sys
import shutil
import subprocess
import json
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
from loguru import logger

from app.core.config import settings
from app.core.exceptions import (
    MediaInspectionFailedException,
    AudioStreamMissingException,
    MediaTooLongException,
    AudioExtractionFailedException,
)

class MediaService:
    def __init__(self):
        self.ffmpeg_path = self._discover_binary("ffmpeg")
        self.ffprobe_path = self._discover_binary("ffprobe")

        # Verify readiness
        if not self.ffmpeg_path:
            logger.warning("FFmpeg executable was not detected on this system.")
        if not self.ffprobe_path:
            logger.warning("FFprobe executable was not detected on this system.")

    def _discover_binary(self, name: str) -> Optional[str]:
        """Resolves the absolute path to a system binary (ffmpeg/ffprobe)."""
        # 1. Check system PATH
        binary_path = shutil.which(name)
        if binary_path:
            return binary_path

        # 2. Check Windows Winget location specifically (common on Gyan.FFmpeg installation)
        if sys.platform == "win32":
            user_profile = os.environ.get("USERPROFILE")
            if user_profile:
                winget_dir = Path(user_profile) / "AppData" / "Local" / "Microsoft" / "WinGet" / "Packages"
                if winget_dir.exists():
                    # Look for directories containing FFmpeg
                    for item in winget_dir.glob("Gyan.FFmpeg*"):
                        bin_folder = item / "ffmpeg-*" / "bin"
                        if not bin_folder.exists():
                            # check if it is direct under the directory
                            bin_folder = item / "bin"

                        # Search recursively if needed
                        for root, _, files in os.walk(str(item)):
                            if f"{name}.exe" in [f.lower() for f in files]:
                                return os.path.join(root, f"{name}.exe")

            # 3. Check Windows Program Files locations
            pf_locations = [
                Path(os.environ.get("ProgramFiles", "C:\\Program Files")),
                Path(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")),
            ]
            for pf in pf_locations:
                binary = pf / "FFmpeg" / "bin" / f"{name}.exe"
                if binary.exists():
                    return str(binary)
                binary_ng = pf / "FFmpeg" / f"{name}.exe"
                if binary_ng.exists():
                    return str(binary_ng)

        # 4. Standard Linux locations
        linux_paths = [
            f"/usr/bin/{name}",
            f"/usr/local/bin/{name}",
            f"/bin/{name}"
        ]
        for path in linux_paths:
            if os.path.exists(path):
                return path

        return None

    def is_available(self) -> bool:
        """Returns True if both FFmpeg and FFprobe binaries are found."""
        return self.ffmpeg_path is not None and self.ffprobe_path is not None

    def inspect_media(self, source_path: Path) -> Dict[str, Any]:
        """
        Executes FFprobe on the source file to inspect duration and stream details.
        Raises specific business logic errors if inspection fails or format is invalid.
        """
        if not self.ffprobe_path:
            logger.error("FFprobe binary not found. Media inspection blocked.")
            raise MediaInspectionFailedException("FFprobe utility is not available on the server.")

        args = [
            self.ffprobe_path,
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            str(source_path)
        ]

        timeout = settings.TRANSCRIPTION_FFPROBE_TIMEOUT_SECONDS

        try:
            logger.info(f"Running FFprobe inspection on: {source_path.name} (timeout={timeout}s)")
            result = subprocess.run(
                args,
                capture_output=True,
                check=True,
                shell=False,
                timeout=timeout
            )

            output_str = result.stdout.decode("utf-8", errors="ignore")
            metadata = json.loads(output_str)

        except subprocess.TimeoutExpired:
            logger.error(f"FFprobe inspection timed out after {timeout} seconds for: {source_path.name}")
            raise MediaInspectionFailedException("Media file analysis timed out. File structure may be invalid.")
        except Exception as e:
            logger.error(f"FFprobe execution failed for {source_path.name}: {e}")
            raise MediaInspectionFailedException("Could not inspect the media file container format.")

        # Validate that an audio stream is present
        streams = metadata.get("streams", [])
        audio_stream = None
        for stream in streams:
            if stream.get("codec_type") == "audio":
                audio_stream = stream
                break

        if not audio_stream:
            logger.warning(f"File contains no audio stream: {source_path.name}")
            raise AudioStreamMissingException()

        # Parse duration (format duration preferred, stream duration fallback)
        duration_str = metadata.get("format", {}).get("duration")
        if not duration_str:
            duration_str = audio_stream.get("duration")

        if not duration_str:
            logger.error(f"No duration metadata found in format or audio stream for: {source_path.name}")
            raise MediaInspectionFailedException("Duration metadata is missing from the media file.")

        try:
            duration = float(duration_str)
            if duration <= 0:
                raise ValueError("Duration must be positive")
        except ValueError:
            logger.error(f"Invalid duration value detected: {duration_str}")
            raise MediaInspectionFailedException("Media duration value is invalid.")

        # Check maximum duration ceiling
        max_duration = settings.TRANSCRIPTION_MAX_DURATION_SECONDS
        if duration > max_duration:
            logger.warning(f"Media duration ({duration:.2f}s) exceeds max limit ({max_duration}s)")
            raise MediaTooLongException()

        return {
            "duration": duration,
            "format": metadata.get("format", {}).get("format_name", "unknown"),
            "codec": audio_stream.get("codec_name", "unknown"),
            "channels": int(audio_stream.get("channels", 1)),
            "sample_rate": int(audio_stream.get("sample_rate", 16000))
        }

    def extract_audio(self, source_path: Path, output_path: Path) -> None:
        """
        Converts the source media into a standardized 16kHz mono PCM 16-bit WAV file.
        Preserves duration and timeline parameters identically.
        """
        if not self.ffmpeg_path:
            logger.error("FFmpeg binary not found. Audio extraction blocked.")
            raise AudioExtractionFailedException("FFmpeg utility is not available on the server.")

        # Force WAV format, PCM 16-bit signed, 16000Hz mono
        args = [
            self.ffmpeg_path,
            "-y",                     # Overwrite output
            "-i", str(source_path),   # Input file
            "-vn",                    # Disable video streams
            "-acodec", "pcm_s16le",   # PCM 16-bit signed little-endian
            "-ar", "16000",           # 16000Hz sampling rate
            "-ac", "1",               # Mono channel
            str(output_path)          # Output WAV file
        ]

        timeout = settings.TRANSCRIPTION_FFMPEG_TIMEOUT_SECONDS

        try:
            logger.info(f"Extracting audio using FFmpeg to {output_path.name} (timeout={timeout}s)")
            result = subprocess.run(
                args,
                capture_output=True,
                check=True,
                shell=False,
                timeout=timeout
            )

            # Verify output exists and is non-empty
            if not output_path.exists() or output_path.stat().st_size == 0:
                raise AudioExtractionFailedException("Audio extraction completed but generated empty WAV output.")

            logger.info(f"Successfully extracted WAV audio: {output_path.name} | Size: {output_path.stat().st_size} bytes")

        except subprocess.TimeoutExpired:
            logger.error(f"FFmpeg audio extraction timed out after {timeout} seconds for: {source_path.name}")
            if output_path.exists():
                try:
                    output_path.unlink()
                except Exception:
                    pass
            raise AudioExtractionFailedException("Media conversion timed out. The file may be corrupt or too complex.")
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg extraction failed with code {e.returncode}.")
            if output_path.exists():
                try:
                    output_path.unlink()
                except Exception:
                    pass
            raise AudioExtractionFailedException("FFmpeg failed to convert input media file to WAV format.")
