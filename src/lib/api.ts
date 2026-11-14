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

/**
 * True only when the caller aborted the request.
 *
 * A `TimeoutError` is deliberately excluded. The request wrapper raises it when
 * its own deadline fires, and treating that as a caller abort meant the
 * transcription UI stopped polling on the first slow response and sat on
 * "Processing…" forever. Timeouts are retryable, so callers should fall through
 * to their error handling instead of returning silently.
 */
export function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }
  return error instanceof Error && error.name === 'AbortError';
}

/** True when the failure came from the request deadline rather than the caller. */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'TimeoutError';
  }
  return error instanceof Error && error.name === 'TimeoutError';
}

/** Reads a `Retry-After` header (delta-seconds or HTTP-date) into seconds. */
function parseRetryAfter(response: Response): number | undefined {
  return parseRetryAfterValue(response.headers.get('Retry-After'));
}

/** Same parsing as parseRetryAfter, for a raw header value (e.g. from XHR). */
function parseRetryAfterValue(raw: string | null): number | undefined {
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
    // Production API is the Hugging Face Space.
    ? 'https://devsharif-konthora-api.hf.space'
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
    engine?: string;
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

export interface ApiDialogueSegment {
  text: string;
  voiceId: string;
}

/**
 * Multi-voice dialogue job: 2–8 segments, each with its own voice. The
 * backend synthesizes every segment and concatenates them into ONE audio
 * file; the whole dialogue counts once against the 30/hr TTS quota and the
 * combined text shares the normal 2000-character cap. The response shape is
 * identical to createTtsJob, so the same polling and download helpers serve
 * dialogue jobs unchanged.
 */
export async function createDialogueJob(
  segments: ApiDialogueSegment[],
  speed: number,
  outputFormat: 'mp3' | 'wav',
  options?: {
    sentencePauseMs: number;
    paragraphPauseMs: number;
    normalizeText: boolean;
  },
  signal?: AbortSignal,
): Promise<ApiJobResponse> {
  const response = await fetch(`${API_BASE_URL}/tts/dialogue-jobs`, {
    method: 'POST',
    headers: withDevBypassHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }),
    body: JSON.stringify({
      segments,
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

export interface TranscriptionUploadProgress {
  loaded: number;
  total: number;
}

/**
 * Same endpoint as createTranscriptionJob, but over XMLHttpRequest so the
 * caller gets real upload progress: `fetch()` cannot report how much of a
 * request body has been sent. Error mapping mirrors handleResponse —
 * ApiError with the server's message/code/status and parsed Retry-After —
 * and the deadline fires as a `TimeoutError` (see isTimeoutError), exactly
 * like the fetch path's REQUEST_TIMEOUT_MS.long deadline.
 */
export async function createTranscriptionJobWithProgress(
  file: File,
  language: string,
  timestampMode: string,
  exportFormat: string,
  options?: {
    signal?: AbortSignal;
    onProgress?: (progress: TranscriptionUploadProgress) => void;
    timeoutMs?: number;
  },
): Promise<ApiTranscriptionJobResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  formData.append('timestampMode', timestampMode);
  formData.append('exportFormat', exportFormat);

  const headers = new Headers(withDevBypassHeaders({ 'Accept': 'application/json' }));

  return new Promise<ApiTranscriptionJobResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const timeoutMs = options?.timeoutMs ?? REQUEST_TIMEOUT_MS.long;
    let settled = false;

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const succeed = (value: ApiTranscriptionJobResponse) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const { signal } = options ?? {};
    if (signal?.aborted) {
      fail(new DOMException('The request was aborted.', 'AbortError'));
      return;
    }
    const onAbort = () => {
      xhr.abort();
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    xhr.open('POST', `${API_BASE_URL}/transcription/jobs`, true);
    xhr.responseType = 'json';
    xhr.timeout = timeoutMs;
    headers.forEach((value, name) => {
      xhr.setRequestHeader(name, value);
    });

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        options?.onProgress?.({ loaded: event.loaded, total: event.total });
      }
    };

    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      const status = xhr.status;
      if (status >= 200 && status < 300) {
        const body = xhr.response as ApiTranscriptionJobResponse | null;
        if (body && typeof body === 'object' && typeof body.jobId === 'string') {
          succeed(body);
        } else {
          fail(
            new ApiError(
              'The server returned an unexpected response. Please try again.',
              'INVALID_RESPONSE',
              status,
            ),
          );
        }
        return;
      }
      // Same error shape as handleResponse: JSON { message, code } + Retry-After.
      const errorData = (
        xhr.response && typeof xhr.response === 'object' ? xhr.response : {}
      ) as { message?: string; code?: string };
      fail(
        new ApiError(
          errorData.message || `API error (status ${status})`,
          errorData.code || 'API_ERROR',
          status,
          parseRetryAfterValue(xhr.getResponseHeader('Retry-After')),
        ),
      );
    };

    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      fail(
        new ApiError(
          'Could not reach the transcription service. Please check your connection and try again.',
          'NETWORK_ERROR',
          0,
        ),
      );
    };

    xhr.ontimeout = () => {
      signal?.removeEventListener('abort', onAbort);
      fail(new DOMException('The request timed out.', 'TimeoutError'));
    };

    xhr.onabort = () => {
      signal?.removeEventListener('abort', onAbort);
      fail(new DOMException('The request was aborted.', 'AbortError'));
    };

    xhr.send(formData);
  });
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
