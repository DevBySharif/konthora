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
  retryAfterSeconds?: number;

  constructor(message: string, code: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Every request gets a hard deadline. Without this a hung TCP connection leaves
 * the UI stuck in a loading state forever, because `fetch` never rejects on its
 * own. Callers may pass their own `signal`; the timeout is composed with it via
 * `AbortSignal.any` so cancelling the caller still cancels the timeout.
 */
export const REQUEST_TIMEOUT_MS = {
  /** Cheap metadata reads. */
  short: 15_000,
  /** Job submission and status reads. */
  medium: 30_000,
  /** Audio/transcript downloads, which can be large. */
  long: 120_000,
} as const;

function withTimeout(timeoutMs: number, signal?: AbortSignal): { signal: AbortSignal } {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!signal) return { signal: timeoutSignal };
  // AbortSignal.any is widely supported; fall back to the timeout alone.
  if (typeof AbortSignal.any === 'function') {
    return { signal: AbortSignal.any([signal, timeoutSignal]) };
  }
  return { signal: timeoutSignal };
}

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  ) || (error instanceof Error && error.name === 'AbortError');
}

/** Reads a `Retry-After` header (delta-seconds or HTTP-date) into seconds. */
function parseRetryAfter(response: Response): number | undefined {
  const raw = response.headers.get('Retry-After');
  if (!raw) return undefined;

  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;

  const date = Date.parse(raw);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, Math.round((date - Date.now()) / 1000));
}

export const API_HOST_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.konthora.dev.bd'
    : 'http://localhost:8000')
).replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

export const API_BASE_URL = `${API_HOST_URL}/api/v1`;

export function withDevBypassHeaders(headers?: HeadersInit): HeadersInit {
  // `NEXT_PUBLIC_*` values are inlined into the client bundle at build time, so
  // this must never reach production or the rate-limit bypass key ships to the
  // browser in _next/static/**. Force the header off outside development.
  const bypassKey =
    process.env.NODE_ENV === 'production'
      ? undefined
      : process.env.NEXT_PUBLIC_DEV_BYPASS_KEY;

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

    throw new ApiError(message, code, response.status, parseRetryAfter(response));
  }

  // A 200 whose body is not JSON (proxy error page, HTML interstitial) would
  // otherwise surface as a bare SyntaxError with no useful context. Parsing is
  // the real signal — sniffing Content-Type is too strict, since a correct
  // server can legitimately omit the header.
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(
      'The server returned an unexpected response. Please try again.',
      'INVALID_RESPONSE',
      response.status,
    );
  }
}

async function fetchBlobOrThrow(response: Response, fallback: string): Promise<Blob> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || fallback;
    throw new ApiError(message, errorData.code || 'DOWNLOAD_FAILED', response.status, parseRetryAfter(response));
  }
  return response.blob();
}

// ── TTS API ───────────────────────────────────────────────────────────────────

export async function fetchVoices(signal?: AbortSignal): Promise<ApiVoice[]> {
  const response = await fetch(`${API_BASE_URL}/tts/voices`, {
    method: 'GET',
    headers: withDevBypassHeaders({
      'Accept': 'application/json',
    }),
    ...withTimeout(REQUEST_TIMEOUT_MS.short, signal),
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
  },
  signal?: AbortSignal,
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
    ...withTimeout(REQUEST_TIMEOUT_MS.medium, signal),
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
    ...withTimeout(REQUEST_TIMEOUT_MS.short, signal),
  });
  return handleResponse<ApiJobStatusResponse>(response);
}

export async function fetchAudioBlob(jobId: string, token: string, signal?: AbortSignal): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/tts/jobs/${jobId}/audio`, {
    method: 'GET',
    headers: withDevBypassHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }),
    ...withTimeout(REQUEST_TIMEOUT_MS.long, signal),
  });

  return fetchBlobOrThrow(response, 'Failed to download the generated audio file.');
}

// ── Transcription API ─────────────────────────────────────────────────────────

export async function fetchTranscriptionCapabilities(signal?: AbortSignal): Promise<ApiTranscriptionCapabilities> {
  const response = await fetch(`${API_BASE_URL}/transcription/capabilities`, {
    method: 'GET',
    headers: withDevBypassHeaders({ 'Accept': 'application/json' }),
    ...withTimeout(REQUEST_TIMEOUT_MS.short, signal),
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
    ...withTimeout(REQUEST_TIMEOUT_MS.long, signal),
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
    ...withTimeout(REQUEST_TIMEOUT_MS.short, signal),
  });
  return handleResponse<ApiTranscriptionStatusResponse>(response);
}

export async function fetchStructuredTranscript(
  jobId: string,
  token: string,
  signal?: AbortSignal
): Promise<ApiStructuredTranscript> {
  const response = await fetch(`${API_BASE_URL}/transcription/jobs/${jobId}/transcript`, {
    method: 'GET',
    headers: withDevBypassHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }),
    ...withTimeout(REQUEST_TIMEOUT_MS.long, signal),
  });
  return handleResponse<ApiStructuredTranscript>(response);
}
