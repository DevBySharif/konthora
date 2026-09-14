'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Upload, X, FileText, FileAudio, FileVideo,
  Loader2, Lock
} from 'lucide-react';
import {
  createTranscriptionJob,
  getTranscriptionJobStatus,
  fetchStructuredTranscript,
  fetchTranscriptionCapabilities,
  ApiStructuredTranscript,
  ApiTranscriptionStatusResponse,
  ApiTranscriptionCapabilities,
  ApiError,
} from '@/lib/api';
import { TranscriptionResultPanel } from './TranscriptionResultPanel';
import { requiresTranscriptDiscardConfirmation } from '@/lib/transcriptWorkspace';

// ── Helpers ────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

type WorkspacePhase =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

interface TranscriptionFormState {
  file: File | null;
  language: string;
  timestampMode: 'sentence' | 'paragraph' | 'word';
  exportFormat: 'txt' | 'srt' | 'vtt' | 'json';
}

interface JobState {
  jobId: string;
  token: string;
  statusResponse: ApiTranscriptionStatusResponse | null;
  transcript: ApiStructuredTranscript | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.mp4', '.webm', '.mov'];
const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const POLL_INTERVAL_MS = 2500;

const PROGRESS_STAGE_LABELS: Record<string, string> = {
  queued: 'Waiting in queue…',
  uploading: 'Uploading file…',
  validating_upload: 'Validating upload…',
  inspecting_media: 'Inspecting media container…',
  extracting_audio: 'Extracting audio track…',
  loading_model: 'Loading transcription model…',
  transcribing: 'Transcribing with Whisper…',
  formatting_transcript: 'Formatting transcript…',
  finalizing_result: 'Finalizing result…',
  completed: 'Transcription complete',
  failed: 'Transcription failed',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TranscriptionWorkspace() {
  const [capabilities, setCapabilities] = useState<ApiTranscriptionCapabilities | null>(null);
  const [capsError, setCapsError] = useState(false);
  const [capsLoading, setCapsLoading] = useState(true);

  const [form, setForm] = useState<TranscriptionFormState>({
    file: null,
    language: 'auto',
    timestampMode: 'sentence',
    exportFormat: 'txt',
  });

  const [phase, setPhase] = useState<WorkspacePhase>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [job, setJob] = useState<JobState | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [resultDirty, setResultDirty] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  // ── Load capabilities ──────────────────────────────────────────────────────
  const loadCapabilities = useCallback(async () => {
    setCapsLoading(true);
    setCapsError(false);
    try {
      const caps = await fetchTranscriptionCapabilities();
      setCapabilities(caps);
    } catch {
      setCapsError(true);
    } finally {
      setCapsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchCaps() {
      try {
        const caps = await fetchTranscriptionCapabilities();
        if (!cancelled) setCapabilities(caps);
      } catch {
        if (!cancelled) setCapsError(true);
      } finally {
        if (!cancelled) setCapsLoading(false);
      }
    }
    fetchCaps();
    return () => { cancelled = true; };
  }, []);

  // ── File Validation ─────────────────────────────────────────────────────────
  const validateFile = (file: File): boolean => {
    setErrorMsg(null);
    const name = file.name.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      setErrorMsg(`Unsupported file type. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ').toUpperCase()}`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return false;
    }
    return true;
  };

  const confirmDiscardEdits = () => {
    return !requiresTranscriptDiscardConfirmation(resultDirty) || window.confirm('Discard your transcript edits and start a new transcription?');
  };

  const selectFile = (file: File) => {
    if (!validateFile(file) || !confirmDiscardEdits()) return;
    setForm((prev) => ({ ...prev, file }));
    setErrorMsg(null);
    setPhase('idle');
    setJob(null);
    setResultDirty(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) selectFile(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) selectFile(e.dataTransfer.files[0]);
  };

  const handleRemoveFile = () => {
    if (!confirmDiscardEdits()) return;
    setForm((prev) => ({ ...prev, file: null }));
    setErrorMsg(null);
    setPhase('idle');
    setJob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    abortRef.current?.abort();
    setResultDirty(false);
  };

  const openFileBrowser = () => fileInputRef.current?.click();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      openFileBrowser();
    }
  };

  // ── Polling ─────────────────────────────────────────────────────────────────
  const pollRef = useRef<((jobId: string, token: string) => Promise<void>) | null>(null);

  const poll = useCallback(
    async (jobId: string, token: string) => {
      try {
        const ac = new AbortController();
        abortRef.current = ac;
        const status = await getTranscriptionJobStatus(jobId, token, ac.signal);

        setJob((prev) => prev ? { ...prev, statusResponse: status } : prev);

        if (status.status === 'completed') {
          setPhase('completed');
          const transcript = await fetchStructuredTranscript(jobId, token);
          setJob((prev) => prev ? { ...prev, transcript } : prev);
        } else if (status.status === 'failed' || status.status === 'expired') {
          setPhase('failed');
          setErrorMsg(status.errorMessage || 'Transcription failed. Please try again.');
        } else {
          setPhase(status.status === 'queued' ? 'queued' : 'processing');
          pollTimerRef.current = setTimeout(() => pollRef.current?.(jobId, token), POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setPhase('failed');
        setErrorMsg('Lost connection to the server. Please try again.');
      }
    },
    []
  );

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) {
      setErrorMsg('Please select or drop a media file to transcribe.');
      return;
    }

    setErrorMsg(null);
    setJob(null);
    setPhase('uploading');

    try {
      const ac = new AbortController();
      abortRef.current = ac;

      const result = await createTranscriptionJob(
        form.file,
        form.language,
        form.timestampMode,
        form.exportFormat,
        ac.signal
      );

      const jobState: JobState = {
        jobId: result.jobId,
        token: result.accessToken,
        statusResponse: null,
        transcript: null,
      };
      setJob(jobState);
      setPhase('queued');

      // Start polling
      pollTimerRef.current = setTimeout(() => poll(result.jobId, result.accessToken), POLL_INTERVAL_MS);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setPhase('failed');
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setErrorMsg('You have reached the transcription limit. Please wait before submitting again.');
        } else if (err.status === 503) {
          setErrorMsg('The transcription queue is currently full. Please try again shortly.');
        } else {
          setErrorMsg(err.message || 'Upload failed. Please try again.');
        }
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isVideo =
    form.file?.type.startsWith('video/') ||
    (form.file && ['.mp4', '.webm', '.mov'].some((ext) => form.file!.name.toLowerCase().endsWith(ext)));

  const isRunning = phase === 'uploading' || phase === 'queued' || phase === 'processing';
  const capsUnavailable = !capsLoading && (!capabilities || capsError);

  const progressLabel = job?.statusResponse?.progressStage
    ? PROGRESS_STAGE_LABELS[job.statusResponse.progressStage] ?? 'Processing…'
    : phase === 'uploading'
    ? 'Uploading file…'
    : 'Starting transcription…';

  const resetWorkspace = () => {
    handleRemoveFile();
  };

  const handleResultDirtyChange = useCallback((dirty: boolean) => {
    setResultDirty(dirty);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* ── Capabilities Error Banner ── */}
      {capsError && (
        <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 rounded-xl flex items-center justify-between gap-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Unable to connect to the transcription service. Please check that the backend is running.
          </p>
          <Button variant="outline" size="sm" onClick={loadCapabilities}>
            Retry
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* ── Upload Zone ── */}
        <div className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border/70 bg-secondary/10 px-5 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upload media</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Audio and video transcription</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Up to {MAX_FILE_SIZE_MB} MB</span>
          </div>
          <div className="p-5 sm:p-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={SUPPORTED_EXTENSIONS.join(',')}
              className="sr-only"
              id="transcription-file-picker"
              disabled={isRunning}
            />

            {!form.file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={openFileBrowser}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label="Upload audio or video file. Drag and drop or press Enter to browse."
                aria-describedby={errorMsg ? 'transcribe-validation-error' : undefined}
                className={`flex min-h-56 flex-col items-center justify-center p-7 sm:p-9 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 select-none ${
                  dragActive
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : 'border-border bg-secondary/10 hover:bg-secondary/20 hover:border-border/80'
                }`}
              >
                <div className={`p-4 rounded-full bg-background border border-border shadow-xs text-muted-foreground mb-4 transition-colors ${dragActive ? 'text-primary border-primary/20' : ''}`}>
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-base font-semibold text-foreground">
                  {dragActive ? 'Drop your file here' : 'Drag & drop your file here, or click to browse'}
                </span>
                <span className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">
                  Supported formats: {SUPPORTED_EXTENSIONS.join(', ').toUpperCase()}
                  <br />
                  Maximum file size: {MAX_FILE_SIZE_MB} MB · Maximum duration: 10 minutes
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border border-border/80 bg-secondary/20 rounded-xl">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 rounded-lg bg-background border border-border text-primary shrink-0">
                    {isVideo ? <FileVideo className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground block truncate">{form.file.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      {(form.file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                {!isRunning && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button type="button" onClick={openFileBrowser} className="rounded-lg px-3 py-2 text-xs font-semibold text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer">
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      aria-label={`Remove file ${form.file.name}`}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Validation Error ── */}
        {errorMsg && phase === 'idle' && (
          <StatusMessage id="transcribe-validation-error" type="error" message={errorMsg} />
        )}

        {/* ── Controls Grid ── */}
        <div className="grid gap-5 p-5 sm:p-6 border border-border bg-card rounded-2xl shadow-xs md:grid-cols-2">
          {/* Language Selector */}
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="language-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Audio Language
            </label>
            <select
              id="language-select"
              value={form.language}
              onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
              disabled={isRunning}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="auto">Auto Detect (English)</option>
              <option value="en">English</option>
            </select>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Currently supports English-language audio only.
            </p>
          </div>

          {/* Timestamp Mode */}
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="timestamp-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Timestamp Grouping
            </label>
            <select
              id="timestamp-select"
              value={form.timestampMode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  timestampMode: e.target.value as TranscriptionFormState['timestampMode'],
                }))
              }
              disabled={isRunning}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="sentence">Sentence blocks</option>
              <option value="paragraph">Paragraph blocks</option>
              <option value="word">Word-level</option>
            </select>
          </div>

          {/* Export Format */}
          <div className="flex min-w-0 flex-col gap-2 md:col-span-2 border-t border-border/70 pt-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-1.5 h-10">
              {(['txt', 'srt', 'vtt', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, exportFormat: fmt }))}
                  aria-pressed={form.exportFormat === fmt}
                  disabled={isRunning}
                  className={`rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    form.exportFormat === fmt
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Submit Button ── */}
        <div className="space-y-3">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 bg-secondary/15 border border-border/80 rounded-2xl">
            <div className="text-xs text-muted-foreground">
              <span className="block font-semibold uppercase tracking-wide">Ready to transcribe</span>
              <span className="mt-1 block">Choose a file, timestamp grouping, and export format.</span>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto sm:min-w-56"
              disabled={!form.file || isRunning || capsUnavailable}
            >
              {isRunning ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Transcribing…</>
              ) : (
                <><Upload className="w-5 h-5" /> Transcribe Audio</>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 px-1 text-xs text-muted-foreground text-center">
            <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              Your files are processed securely and automatically deleted after 60 minutes.{' '}
              <a href="/privacy-policy" className="underline hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Privacy</a>
            </span>
          </div>
        </div>
      </form>

      {/* ── Progress / Status ─────────────────────────────────────────────── */}
      {isRunning && (
        <div className="mt-6 p-5 border border-border/80 bg-card rounded-2xl flex items-center gap-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{progressLabel}</p>
            {job?.statusResponse?.segmentCount != null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {job.statusResponse.segmentCount} segment{job.statusResponse.segmentCount !== 1 ? 's' : ''} found so far
              </p>
            )}
          </div>
        </div>
      )}

      {phase === 'failed' && errorMsg && (
        <div className="mt-6">
          <StatusMessage
            id="transcribe-error"
            type="error"
            message={errorMsg}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={resetWorkspace}
              className="text-xs text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* ── Results Output ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-6 border-t border-border/60">
        <h2 className="text-lg font-bold text-foreground mb-4">Transcription Output</h2>

        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          {phase !== 'completed' || !job?.transcript ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                title="No transcription results yet"
                description="Upload an audio or video file and click Transcribe Audio. Your timestamped transcript and export controls will appear here."
                icon={<FileText className="w-8 h-8 opacity-40" />}
              />
            </div>
          ) : (
            form.file && job.statusResponse ? (
              <TranscriptionResultPanel
                key={job.jobId}
                transcript={job.transcript}
                status={job.statusResponse}
                file={form.file}
                initialExportFormat={form.exportFormat}
                onDirtyChange={handleResultDirtyChange}
                onNewFile={resetWorkspace}
              />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
