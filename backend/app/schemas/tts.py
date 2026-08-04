from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

class TtsJobCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="The script text to synthesize.")
    voiceId: str = Field(..., description="The unique identifier of the selected voice model.")
    accent: str = Field("american", description="The English voice accent ('american' or 'british').")
    speed: float = Field(1.0, ge=0.75, le=1.25, description="Playback speech rate factor.")
    outputFormat: str = Field("mp3", description="Audio output file format ('mp3' or 'wav').")

    @field_validator("outputFormat")
    @classmethod
    def validate_format(cls, value: str) -> str:
        fmt = value.lower()
        if fmt not in ["mp3", "wav"]:
            raise ValueError("Supported output formats are 'mp3' and 'wav' only.")
        return fmt

    @field_validator("accent")
    @classmethod
    def validate_accent(cls, value: str) -> str:
        acc = value.lower()
        if acc not in ["american", "british"]:
            raise ValueError("Supported accents are 'american' and 'british' only.")
        return acc

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        # Check non-whitespace
        if not value.strip():
            raise ValueError("Text script must contain at least one non-whitespace character.")

        # Check for invalid control characters (keep tabs and newlines)
        for char in value:
            code = ord(char)
            # Unicode control chars, except 9 (tab), 10 (newline), 13 (carriage return)
            if code < 32 and code not in [9, 10, 13]:
                raise ValueError("Text contains unsupported control characters.")

        return value

class TtsJobResponse(BaseModel):
    jobId: str = Field(..., description="Unique job identifier.")
    accessToken: str = Field(..., description="Cryptographically secure access token for retrieving status and files.")
    status: str = Field("queued", description="Initial queue state.")

class TtsJobStatusResponse(BaseModel):
    jobId: str
    status: str
    progressStage: str
    createdAt: str
    expiresAt: str
    durationSeconds: Optional[float] = None
    characterCount: int
    outputFormat: str
    errorCode: Optional[str] = None
    errorMessage: Optional[str] = None
    downloadUrl: Optional[str] = None

class VoiceInfo(BaseModel):
    id: str
    displayName: str
    gender: str
    accent: str
    language: str
    recommended: bool
    defaultSpeed: float = 1.0
    minimumSpeed: float = 0.75
    maximumSpeed: float = 1.25

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    modelReady: bool
    modelStatus: str
    ffmpegAvailable: bool
    queueDepth: int
    queueCapacity: int
    transcriptionModelReady: Optional[bool] = None
    transcriptionModelStatus: Optional[str] = None
    transcriptionQueueDepth: Optional[int] = None
    transcriptionQueueCapacity: Optional[int] = None
