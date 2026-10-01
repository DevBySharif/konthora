import os
import shutil
from pathlib import Path
from loguru import logger
from app.core.config import settings
from app.core.exceptions import (
    InsufficientDiskSpaceException,
    InvalidRequestException,
)

def get_resolved_storage_root() -> Path:
    return Path(settings.TTS_STORAGE_ROOT).resolve()

def get_free_space_bytes(path: Path) -> int:
    """Free bytes on the filesystem holding ``path``, or -1 when unknown."""
    probe = path
    while not probe.exists() and probe.parent != probe:
        probe = probe.parent
    try:
        return shutil.disk_usage(probe).free
    except (OSError, ValueError):
        return -1

def ensure_storage_exists():
    root = get_resolved_storage_root()
    root.mkdir(parents=True, exist_ok=True)

def ensure_sufficient_disk_space(required_bytes: int) -> None:
    """
    Refuse new uploads before they start when free space is already low.

    The Hugging Face free Space has 50GB of non-persistent disk holding the
    model cache, the storage root and every in-flight upload. Without this
    guard an upload can fill the disk mid-write, and the resulting ENOSPC
    surfaces as an opaque 500 partway through a job the user already paid for
    in time. Failing fast with a retryable 503 is far cheaper.
    """
    ensure_storage_exists()
    root = get_resolved_storage_root()

    free = get_free_space_bytes(root)
    if free < 0:
        # Could not measure. Do not block real uploads on an unknown value.
        return

    # Never admit work that cannot fit even on its own, and keep a reserve so
    # cleanup and result writing still have room to run.
    threshold = max(required_bytes, settings.TRANSCRIPTION_MIN_FREE_DISK_MB * 1024 * 1024)
    if free < threshold:
        logger.error(
            f"Rejecting request: {free // (1024 * 1024)}MB free, "
            f"{threshold // (1024 * 1024)}MB required"
        )
        raise InsufficientDiskSpaceException()

def resolve_secure_path(filename: str) -> Path:
    """
    Safely resolves a file path and checks that it is inside the storage root.
    Rejects directory traversal, symlinks, and unsafe paths.
    """
    root = get_resolved_storage_root()

    # Resolve candidate path relative to root
    candidate = (root / filename).resolve()

    # Check that candidate path is strictly under root path
    if not str(candidate).startswith(str(root)):
        logger.error(f"Path traversal attempt blocked: {filename}")
        raise InvalidRequestException("INVALID_REQUEST", "Invalid file access path.")

    # Check symlinks recursively up to root
    curr = candidate
    while curr != root and curr != curr.parent:
        if curr.exists() and curr.is_symlink():
            logger.error(f"Symlink detected and blocked: {curr.name}")
            raise InvalidRequestException("INVALID_REQUEST", "Symlinks are not allowed.")
        curr = curr.parent

    return candidate

def delete_job_files(job_id: str):
    """Deletes all files associated with a specific Job ID inside the resolved storage root."""
    try:
        ensure_storage_exists()
        root = get_resolved_storage_root()
        for item in root.iterdir():
            if item.is_symlink():
                continue
            if job_id in item.name:
                resolved = resolve_secure_path(item.name)
                if resolved.exists():
                    resolved.unlink()
                    logger.info(f"Deleted expired/failed job file: {resolved.name}")
    except Exception as e:
        logger.error(f"Error deleting job files for {job_id}: {e}")
