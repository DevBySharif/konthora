import sys
from pathlib import Path
from loguru import logger

from app.core.config import settings


def setup_logging():
    # Remove default handler
    logger.remove()

    # Console / journald sink (systemd captures stderr via StandardOutput/Error)
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.LOG_LEVEL,
        backtrace=False,
        diagnose=False,
    )

    # Optional rotating file sink (production). Sensitive payloads are never logged
    # by the application, so file logs only contain operational metadata.
    log_dir = settings.LOG_DIR.strip()
    if log_dir:
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)
        logger.add(
            log_path / "konthora.log",
            rotation="50 MB",
            retention="7 days",
            compression="zip",
            enqueue=True,
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
            level=settings.LOG_LEVEL,
            backtrace=False,
            diagnose=False,
        )


setup_logging()
