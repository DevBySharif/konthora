from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ValidationInfo
from app.services.kokoro_service import VOICES_CATALOGUE

VALID_ACCENTS = {v["accent"].lower() for v in VOICES_CATALOGUE}

class TtsJobCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="The script text to synthesize.")
    voiceId: str = Field(..., description="The unique identifier of the selected voice model.")
    # Synthesis engine: "kokoro" (default, self-hosted) or "edge" (Microsoft
    # neural voices). Declared before `accent` so the accent validator below
    # can read it. The endpoint resolves the engine from the voice catalogue
    # anyway; this field must match the voice's engine when both are given.
    engine: str = Field("kokoro", description="Synthesis engine ('kokoro' or 'edge').")
    accent: str = Field("American English", description="The voice accent.")
    speed: float = Field(1.0, ge=0.75, le=1.25, description="Playback speech rate factor.")
    outputFormat: str = Field("mp3", description="Audio output file format ('mp3' or 'wav').")
    sentencePauseMs: Optional[int] = Field(
        None,
        ge=0,
        le=1000,
        description="Optional silence inserted at sentence chunk boundaries in milliseconds.",
    )
    paragraphPauseMs: Optional[int] = Field(
        None,
        ge=0,
        le=2000,
        description="Optional silence inserted at paragraph chunk boundaries in milliseconds.",
    )
    normalizeText: bool = Field(
        True,
        description="Apply the existing conservative text normalization pass before synthesis.",
    )

    @field_validator("engine")
    @classmethod
    def validate_engine(cls, value: str) -> str:
        eng = value.lower()
        if eng not in ("kokoro", "edge"):
            raise ValueError("Supported engines are 'kokoro' and 'edge'.")
        return eng

    @field_validator("outputFormat")
    @classmethod
    def validate_format(cls, value: str) -> str:
        fmt = value.lower()
        if fmt not in ["mp3", "wav"]:
            raise ValueError("Supported output formats are 'mp3' and 'wav' only.")
        return fmt

    @field_validator("accent")
    @classmethod
    def validate_accent(cls, value: str, info: ValidationInfo) -> str:
        acc = value.lower()
        # Edge voices carry Microsoft locale names ("Bengali (Bangladesh)")
        # that are not in the Kokoro allowlist. The endpoint resolves the
        # voice from the served catalogue and uses the voice's own accent,
        # so for Edge any non-empty accent is accepted here.
        if info.data.get("engine") == "edge":
            if not value.strip():
                raise ValueError("Accent must not be empty.")
            return value
        if acc not in VALID_ACCENTS:
            raise ValueError(f"Supported accents are: {', '.join(sorted(VALID_ACCENTS))}")
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
    engine: str = "kokoro"
    # Empty for Edge voices: Microsoft has no hosted preview clips, and the
    # UI hides the Listen button for voices without a preview URL.
    previewUrl: str = ""

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
    # True only while Edge TTS is reachable (cached availability probe).
    edgeTtsAvailable: Optional[bool] = None
