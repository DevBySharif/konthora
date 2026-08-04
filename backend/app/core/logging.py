import sys
from loguru import logger

def setup_logging():
    # Remove default handler
    logger.remove()

    # Configure production-ready log format
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
        backtrace=False,
        diagnose=False,
    )

setup_logging()
