from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://konthora.dev.bd"
    TRUST_PROXY_HEADERS: bool = False

    TTS_MAX_CHARACTERS: int = 2000
    TTS_MAX_QUEUE_SIZE: int = 10
    TTS_WORKER_COUNT: int = 1
    TTS_JOB_RETENTION_MINUTES: int = 60
    TTS_STORAGE_ROOT: str = "./storage"
    TTS_DEFAULT_VOICE: str = "af_heart"
    TTS_MIN_SPEED: float = 0.75
    TTS_MAX_SPEED: float = 1.25
    TTS_SENTENCE_PAUSE_MS: int = 220
    TTS_PARAGRAPH_PAUSE_MS: int = 500
    TTS_ENABLE_MP3: bool = True

    TTS_RATE_LIMIT_REQUESTS: int = 10
    TTS_RATE_LIMIT_WINDOW_SECONDS: int = 3600

    ESPEAK_PATH: str = ""

    # Transcription Settings
    TRANSCRIPTION_MODEL: str = "small.en"
    TRANSCRIPTION_DEVICE: str = "cpu"
    TRANSCRIPTION_COMPUTE_TYPE: str = "int8"
    TRANSCRIPTION_MAX_FILE_SIZE_MB: int = 100
    TRANSCRIPTION_MAX_DURATION_SECONDS: int = 600
    TRANSCRIPTION_MAX_QUEUE_SIZE: int = 5
    TRANSCRIPTION_WORKER_COUNT: int = 1
    TRANSCRIPTION_JOB_RETENTION_MINUTES: int = 60
    TRANSCRIPTION_BEAM_SIZE: int = 5
    TRANSCRIPTION_VAD_ENABLED: bool = True
    TRANSCRIPTION_VAD_MIN_SILENCE_MS: int = 500
    TRANSCRIPTION_VAD_SPEECH_PAD_MS: int = 400
    TRANSCRIPTION_WORD_TIMESTAMPS: bool = True
    TRANSCRIPTION_SENTENCE_MAX_CHARACTERS: int = 280
    TRANSCRIPTION_PARAGRAPH_MAX_CHARACTERS: int = 900
    TRANSCRIPTION_PARAGRAPH_MAX_DURATION_SECONDS: int = 45
    TRANSCRIPTION_PARAGRAPH_GAP_SECONDS: float = 1.5
    TRANSCRIPTION_SUBTITLE_MAX_CHARACTERS: int = 84
    TRANSCRIPTION_SUBTITLE_MAX_LINES: int = 2

    TRANSCRIPTION_RATE_LIMIT_REQUESTS: int = 5
    TRANSCRIPTION_RATE_LIMIT_WINDOW_SECONDS: int = 3600
    TRANSCRIPTION_ACTIVE_JOBS_PER_CLIENT: int = 1
    TRANSCRIPTION_FFPROBE_TIMEOUT_SECONDS: int = 15
    TRANSCRIPTION_FFMPEG_TIMEOUT_SECONDS: int = 120

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
