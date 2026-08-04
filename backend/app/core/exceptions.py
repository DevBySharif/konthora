class TtsException(Exception):
    """Base exception for all Konthora TTS errors."""
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class InvalidRequestException(TtsException):
    def __init__(self, code: str, message: str):
        super().__init__(code=code, message=message, status_code=400)

class UnauthorizedJobAccessException(TtsException):
    def __init__(self, message: str = "Access token is missing or invalid."):
        super().__init__(code="UNAUTHORIZED", message=message, status_code=401)

class JobNotFoundException(TtsException):
    def __init__(self, message: str = "The requested job was not found."):
        # 404 status code prevents exposing the existence of job IDs to unauthorized users
        super().__init__(code="JOB_NOT_FOUND", message=message, status_code=404)

class JobExpiredException(TtsException):
    def __init__(self, message: str = "The job output has expired."):
        super().__init__(code="JOB_EXPIRED", message=message, status_code=410)

class QueueFullException(TtsException):
    def __init__(self, message: str = "The task queue is currently full. Please try again later."):
        super().__init__(code="QUEUE_FULL", message=message, status_code=503)

class RateLimitExceededException(TtsException):
    def __init__(self, message: str = "Rate limit exceeded. Please wait before submitting more requests."):
        super().__init__(code="RATE_LIMITED", message=message, status_code=429)

class ModelUnavailableException(TtsException):
    def __init__(self, message: str = "The speech synthesis engine is currently unavailable."):
        super().__init__(code="MODEL_UNAVAILABLE", message=message, status_code=503)

class EncoderUnavailableException(TtsException):
    def __init__(self, message: str = "The requested audio format encoder is unavailable."):
        super().__init__(code="ENCODER_UNAVAILABLE", message=message, status_code=503)

class GenerationFailedException(TtsException):
    def __init__(self, message: str = "Audio generation failed due to an internal error."):
        super().__init__(code="GENERATION_FAILED", message=message, status_code=500)

class TranscriptionModelUnavailableException(TtsException):
    def __init__(self, message: str = "The transcription model engine is currently unavailable."):
        super().__init__(code="MODEL_UNAVAILABLE", message=message, status_code=503)

class MediaInspectionFailedException(TtsException):
    def __init__(self, message: str = "Media inspection failed due to file structure errors."):
        super().__init__(code="MEDIA_INSPECTION_FAILED", message=message, status_code=400)

class AudioStreamMissingException(TtsException):
    def __init__(self, message: str = "No audio track detected in the uploaded file."):
        super().__init__(code="AUDIO_STREAM_MISSING", message=message, status_code=400)

class MediaTooLongException(TtsException):
    def __init__(self, message: str = "Media file duration exceeds the maximum permitted limit."):
        super().__init__(code="MEDIA_TOO_LONG", message=message, status_code=400)

class AudioExtractionFailedException(TtsException):
    def __init__(self, message: str = "Failed to convert uploaded media audio track."):
        super().__init__(code="AUDIO_EXTRACTION_FAILED", message=message, status_code=500)
