export interface ApiVoice {
  id: string;
  displayName: string;
  gender: string;
  accent: string;
  language: string;
  recommended: boolean;
  defaultSpeed: number;
  minimumSpeed: number;
  maximumSpeed: number;
  engine?: string;
  previewUrl?: string;
}

export interface ApiJobResponse {
  jobId: string;
  accessToken: string;
  status: string;
}

export interface ApiJobStatusResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  progressStage: 'queued' | 'preparing_text' | 'generating_speech' | 'processing_audio' | 'finalizing_file' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  expiresAt: string;
  durationSeconds: number | null;
  characterCount: number;
  outputFormat: 'mp3' | 'wav';
  errorCode: string | null;
  errorMessage: string | null;
  downloadUrl: string | null;
}

// ── Transcription Types ───────────────────────────────────────────────────────

export interface ApiTranscriptionCapabilities {
  acceptedExtensions: string[];
  maximumFileSizeBytes: number;
  maximumDurationSeconds: number;
  supportedLanguages: { code: string; name: string }[];
  timestampModes: string[];
  exportFormats: string[];
  wordTimestampsAvailable: boolean;
}

export interface ApiTranscriptionJobResponse {
  jobId: string;
  accessToken: string;
  status: string;
}

export type TranscriptionProgressStage =
  | 'queued'
  | 'inspecting_media'
  | 'extracting_audio'
  | 'transcribing'
  | 'formatting_transcript'
  | 'completed'
  | 'failed'
  | 'expired';

export interface ApiTranscriptionStatusResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  progressStage: TranscriptionProgressStage;
  createdAt: string;
  expiresAt: string;
  originalFileName: string;
  fileSizeBytes: number;
  mediaDurationSeconds: number | null;
  detectedLanguage: string | null;
  languageProbability: number | null;
  transcriptCharacterCount: number | null;
  segmentCount: number | null;
  wordCount: number | null;
  timestampMode: string;
  exportFormat: string;
  resultUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface ApiTranscriptWord {
  word: string;
  start: number;
  end: number;
  probability: number;
}

export interface ApiTranscriptSegment {
  id: number;
  text: string;
  start: number;
  end: number;
  startFormatted: string;
  endFormatted: string;
  noSpeechProbability: number;
  words: ApiTranscriptWord[];
}

export interface ApiStructuredTranscript {
  jobId: string;
  detectedLanguage: string;
  languageProbability: number;
  durationSeconds: number;
  wordCount: number;
  segmentCount: number;
  exportFormat: string;
  timestampMode: string;
  fullText: string;
  segments: ApiTranscriptSegment[];
}

// ── Shared ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `API error (status ${response.status})`;
    const code = errorData.code || 'API_ERROR';

    throw new ApiError(message, code, response.status);
  }
  return response.json() as Promise<T>;
}

// ── TTS API ───────────────────────────────────────────────────────────────────

export async function fetchVoices(): Promise<ApiVoice[]> {
  const response = await fetch(`${API_BASE_URL}/tts/voices`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse<ApiVoice[]>(response);
}

export async function createTtsJob(
  text: string,
  voiceId: string,
  accent: string,
  speed: number,
  outputFormat: 'mp3' | 'wav'
): Promise<ApiJobResponse> {
  const response = await fetch(`${API_BASE_URL}/tts/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      text,
      voiceId,
      accent,
      speed,
      outputFormat,
    }),
  });
  return handleResponse<ApiJobResponse>(response);
}

export async function getTtsJobStatus(jobId: string, token: string, signal?: AbortSignal): Promise<ApiJobStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/tts/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });
  return handleResponse<ApiJobStatusResponse>(response);
}

export async function fetchAudioBlob(jobId: string, token: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/tts/jobs/${jobId}/audio`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || 'Failed to download the generated audio file.';
    throw new Error(message);
  }

  return response.blob();
}

// ── Transcription API ─────────────────────────────────────────────────────────

export async function fetchTranscriptionCapabilities(): Promise<ApiTranscriptionCapabilities> {
  const response = await fetch(`${API_BASE_URL}/transcription/capabilities`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse<ApiTranscriptionCapabilities>(response);
}

export async function createTranscriptionJob(
  file: File,
  language: string,
  timestampMode: string,
  exportFormat: string,
  signal?: AbortSignal
): Promise<ApiTranscriptionJobResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  formData.append('timestampMode', timestampMode);
  formData.append('exportFormat', exportFormat);

  const response = await fetch(`${API_BASE_URL}/transcription/jobs`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: formData,
    signal,
  });
  return handleResponse<ApiTranscriptionJobResponse>(response);
}

export async function getTranscriptionJobStatus(
  jobId: string,
  token: string,
  signal?: AbortSignal
): Promise<ApiTranscriptionStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/transcription/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });
  return handleResponse<ApiTranscriptionStatusResponse>(response);
}

export async function fetchStructuredTranscript(
  jobId: string,
  token: string
): Promise<ApiStructuredTranscript> {
  const response = await fetch(`${API_BASE_URL}/transcription/jobs/${jobId}/transcript`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse<ApiStructuredTranscript>(response);
}

export async function fetchTranscriptBlob(jobId: string, token: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/transcription/jobs/${jobId}/result`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || 'Failed to download the transcript file.';
    throw new Error(message);
  }

  return response.blob();
}
