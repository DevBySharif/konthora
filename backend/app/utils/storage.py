import os
from pathlib import Path
from loguru import logger
from app.core.config import settings
from app.core.exceptions import InvalidRequestException

def get_resolved_storage_root() -> Path:
    return Path(settings.TTS_STORAGE_ROOT).resolve()

def ensure_storage_exists():
    root = get_resolved_storage_root()
    root.mkdir(parents=True, exist_ok=True)

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
