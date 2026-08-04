import time
from typing import Dict, List, Set
from fastapi import Request
from loguru import logger

from app.core.config import settings
from app.core.exceptions import RateLimitExceededException

class RateLimitService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(RateLimitService, cls).__new__(cls)
            # Map client IP to list of request timestamps
            cls._instance._request_history = {}
            # Map client IP to set of active job IDs (queued or processing)
            cls._instance._active_jobs = {}

            # Transcription Namespace Tracking
            cls._instance._trans_request_history = {}
            cls._instance._trans_active_jobs = {}
        return cls._instance

    def get_client_ip(self, request: Request) -> str:
        """
        Extracts the client IP address safely based on proxy trust configuration.
        """
        if settings.TRUST_PROXY_HEADERS:
            # Parse X-Forwarded-For header
            x_forwarded_for = request.headers.get("X-Forwarded-For")
            if x_forwarded_for:
                # Get the first IP in the chain (real client)
                ip = x_forwarded_for.split(",")[0].strip()
                if ip:
                    return ip

        # Fallback to direct client host
        if request.client:
            return request.client.host

        return "127.0.0.1"

    def check_rate_limit(self, client_ip: str):
        """
        Enforces requests per window limits for TTS.
        Raises RateLimitExceededException if client exceeds limits.
        """
        now = time.time()
        window = settings.TTS_RATE_LIMIT_WINDOW_SECONDS
        max_requests = settings.TTS_RATE_LIMIT_REQUESTS

        # Initialize history
        if client_ip not in self._request_history:
            self._request_history[client_ip] = []

        # Filter out timestamps older than the sliding window
        history = [ts for ts in self._request_history[client_ip] if now - ts < window]
        self._request_history[client_ip] = history

        # Check limit
        if len(history) >= max_requests:
            # Calculate time remaining until the oldest request falls out of the window
            oldest_ts = history[0]
            retry_after = int(window - (now - oldest_ts))
            retry_after = max(1, retry_after)

            logger.warning(f"Rate limit hit for IP: {client_ip}. Requests: {len(history)}. Retry-after: {retry_after}s")
            raise RateLimitExceededException(
                message=f"Rate limit exceeded. Please wait {retry_after} seconds before submitting more scripts."
            )

        # Record this request
        self._request_history[client_ip].append(now)

    def check_active_jobs_limit(self, client_ip: str, max_active: int = 3):
        """
        Prevents a single client from monopolizing the worker queue for TTS.
        """
        active = self._active_jobs.get(client_ip, set())
        if len(active) >= max_active:
            logger.warning(f"Active jobs limit hit for IP: {client_ip}. Active count: {len(active)}")
            raise RateLimitExceededException(
                message="You have too many active speech generation jobs. Please wait for them to finish."
            )

    def register_active_job(self, client_ip: str, job_id: str):
        if client_ip not in self._active_jobs:
            self._active_jobs[client_ip] = set()
        self._active_jobs[client_ip].add(job_id)

    def deregister_active_job(self, client_ip: str, job_id: str):
        if client_ip in self._active_jobs:
            self._active_jobs[client_ip].discard(job_id)
            if not self._active_jobs[client_ip]:
                self._active_jobs.pop(client_ip)

    # ==========================================
    # Transcription Namespace Rate Limiting
    # ==========================================
    def check_transcription_rate_limit(self, client_ip: str):
        """Enforces sliding-window request limits for Audio Transcription."""
        now = time.time()
        window = settings.TRANSCRIPTION_RATE_LIMIT_WINDOW_SECONDS
        max_requests = settings.TRANSCRIPTION_RATE_LIMIT_REQUESTS

        if client_ip not in self._trans_request_history:
            self._trans_request_history[client_ip] = []

        history = [ts for ts in self._trans_request_history[client_ip] if now - ts < window]
        self._trans_request_history[client_ip] = history

        if len(history) >= max_requests:
            oldest_ts = history[0]
            retry_after = int(window - (now - oldest_ts))
            retry_after = max(1, retry_after)

            logger.warning(f"Transcription rate limit hit for IP: {client_ip}. Requests: {len(history)}. Retry-after: {retry_after}s")
            raise RateLimitExceededException(
                message=f"Rate limit exceeded. Please wait {retry_after} seconds before submitting more media files."
            )

        self._trans_request_history[client_ip].append(now)

    def check_transcription_active_jobs_limit(self, client_ip: str, max_active: int = 1):
        """Enforces concurrent active jobs limits for Audio Transcription."""
        active = self._trans_active_jobs.get(client_ip, set())
        if len(active) >= max_active:
            logger.warning(f"Transcription active jobs limit hit for IP: {client_ip}. Active count: {len(active)}")
            raise RateLimitExceededException(
                message="You already have an active transcription job running. Please wait for it to complete."
            )

    def register_transcription_active_job(self, client_ip: str, job_id: str):
        if client_ip not in self._trans_active_jobs:
            self._trans_active_jobs[client_ip] = set()
        self._trans_active_jobs[client_ip].add(job_id)

    def deregister_transcription_active_job(self, client_ip: str, job_id: str):
        if client_ip in self._trans_active_jobs:
            self._trans_active_jobs[client_ip].discard(job_id)
            if not self._trans_active_jobs[client_ip]:
                self._trans_active_jobs.pop(client_ip)
