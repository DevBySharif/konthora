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
  probability?: number | null;
}

export interface ApiTranscriptSegment {
  id: number;
  text: string;
  start: number;
  end: number;
  startFormatted?: string;
  endFormatted?: string;
  noSpeechProbability?: number | null;
  words?: ApiTranscriptWord[];
}

export interface ApiStructuredTranscript {
  schemaVersion: string;
  jobId: string;
  detectedLanguage: string | null;
  languageProbability: number | null;
  durationSeconds: number;
  fullText: string;
  segments: ApiTranscriptSegment[];
  words?: ApiTranscriptWord[];
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

export const API_HOST_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.konthora.dev.bd'
    : 'http://localhost:8000')
).replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

export const API_BASE_URL = `${API_HOST_URL}/api/v1`;

export function withDevBypassHeaders(headers?: HeadersInit): HeadersInit {
  const bypassKey = process.env.NEXT_PUBLIC_DEV_BYPASS_KEY;
  if (!bypassKey) return headers || {};

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    const cloned = new Headers(headers);
    cloned.set('X-Dev-Bypass-Key', bypassKey);
    return cloned;
  }

  if (Array.isArray(headers)) {
    return [...headers, ['X-Dev-Bypass-Key', bypassKey]];
  }

  return {
    ...(headers || {}),
    'X-Dev-Bypass-Key': bypassKey,
  };
}

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
    headers: withDevBypassHeaders({
      'Accept': 'application/json',
    }),
  });
  return handleResponse<ApiVoice[]>(response);
}

export async function createTtsJob(
  text: string,
  voiceId: string,
  accent: string,
  speed: number,
  outputFormat: 'mp3' | 'wav',
  options?: {
    sentencePauseMs: number;
    paragraphPauseMs: number;
    normalizeText: boolean;
  }
): Promise<ApiJobResponse> {
  const response = await fetch(`${API_BASE_URL}/tts/jobs`, {
    method: 'POST',
    headers: withDevBypassHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }),
    body: JSON.stringify({
      text,
      voiceId,
      accent,
      speed,
      outputFormat,
      ...(options ?? {}),
    }),
  });
  return handleResponse<ApiJobResponse>(response);
}

export async function getTtsJobStatus(jobId: string, token: string, signal?: AbortSignal): Promise<ApiJobStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/tts/jobs/${jobId}`, {
    method: 'GET',
    headers: withDevBypassHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }),
    signal,
  });
  return handleResponse<ApiJobStatusResponse>(response);
}

export async function fetchAudioBlob(jobId: string, token: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/tts/jobs/${jobId}/audio`, {
    method: 'GET',
    headers: withDevBypassHeaders({
      'Authorization': `Bearer ${token}`,
    }),
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
    headers: withDevBypassHeaders({ 'Accept': 'application/json' }),
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
    headers: withDevBypassHeaders({ 'Accept': 'application/json' }),
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
    headers: withDevBypassHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }),
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
    headers: withDevBypassHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }),
  });
  return handleResponse<ApiStructuredTranscript>(response);
}

export async function fetchTranscriptBlob(
  jobId: string,
  token: string,
  exportFormat: 'txt' | 'srt' | 'vtt' | 'json'
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/transcription/jobs/${jobId}/result?format=${exportFormat}`, {
    method: 'GET',
    headers: withDevBypassHeaders({ 'Authorization': `Bearer ${token}` }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || 'Failed to download the transcript file.';
    throw new Error(message);
  }

  return response.blob();
}
