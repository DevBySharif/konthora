import os
import uuid
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

def write_file_atomically(filename: str, content_bytes: bytes) -> Path:
    """
    Writes data atomically by creating a temporary file first,
    verifying it, and renaming it to the target name.
    """
    ensure_storage_exists()
    target_path = resolve_secure_path(filename)

    # Create a temporary file in the same directory to ensure atomic move
    temp_filename = f"{filename}.{uuid.uuid4().hex}.tmp"
    temp_path = resolve_secure_path(temp_filename)

    try:
        # Write to temp file
        with open(temp_path, "wb") as f:
            f.write(content_bytes)

        # Verify size matches
        if temp_path.stat().st_size != len(content_bytes):
            raise IOError("Temporary file write verification failed: size mismatch.")

        # Atomic rename
        os.replace(temp_path, target_path)
        return target_path
    except Exception as e:
        logger.error(f"Atomic file write failed for {filename}: {e}")
        if temp_path.exists():
            try:
                temp_path.unlink()
            except OSError:
                pass
        raise e

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
