from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TranscriptionCapabilitiesResponse(BaseModel):
    acceptedExtensions: List[str]
    maximumFileSizeBytes: int
    maximumDurationSeconds: int
    supportedLanguages: List[Dict[str, str]]
    timestampModes: List[str]
    exportFormats: List[str]
    wordTimestampsAvailable: bool

class TranscriptionJobCreateResponse(BaseModel):
    jobId: str
    accessToken: str
    status: str

class TranscriptionJobStatusResponse(BaseModel):
    jobId: str
    status: str
    progressStage: str
    createdAt: str
    expiresAt: str
    originalFileName: str
    fileSizeBytes: int
    mediaDurationSeconds: Optional[float] = None
    detectedLanguage: Optional[str] = None
    languageProbability: Optional[float] = None
    transcriptCharacterCount: Optional[int] = None
    segmentCount: Optional[int] = None
    wordCount: Optional[int] = None
    timestampMode: str
    exportFormat: str
    resultUrl: Optional[str] = None
    errorCode: Optional[str] = None
    errorMessage: Optional[str] = None

# Structured JSON format schemas for browser preview rendering
class TranscriptWordInfo(BaseModel):
    word: str
    start: float
    end: float
    probability: Optional[float] = None

class TranscriptSegmentInfo(BaseModel):
    id: int
    text: str
    start: float
    end: float
    words: Optional[List[TranscriptWordInfo]] = None
    noSpeechProbability: Optional[float] = None

class StructuredTranscriptResponse(BaseModel):
    schemaVersion: str = "1.0"
    jobId: str
    fullText: str
    durationSeconds: float
    detectedLanguage: Optional[str] = None
    languageProbability: Optional[float] = None
    segments: List[TranscriptSegmentInfo]
    words: Optional[List[TranscriptWordInfo]] = None
