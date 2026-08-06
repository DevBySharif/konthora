'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Upload, X, FileText, Download, Copy, FileAudio, FileVideo,
  Loader2, CheckCircle2, Clock, Lock
} from 'lucide-react';
import {
  createTranscriptionJob,
  getTranscriptionJobStatus,
  fetchStructuredTranscript,
  fetchTranscriptBlob,
  fetchTranscriptionCapabilities,
  ApiStructuredTranscript,
  ApiTranscriptionStatusResponse,
  ApiTranscriptionCapabilities,
  ApiTranscriptSegment,
  ApiError,
} from '@/lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `[${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}]`;
  return `[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}]`;
}

function enrichSegments(segments: ApiTranscriptSegment[]): ApiTranscriptSegment[] {
  return segments.map((seg) => ({
    ...seg,
    startFormatted: formatTimestamp(seg.start),
    endFormatted: formatTimestamp(seg.end),
  }));
}

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
  const [copyDone, setCopyDone] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const selectFile = (file: File) => {
    if (validateFile(file)) setForm((prev) => ({ ...prev, file }));
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
    setForm((prev) => ({ ...prev, file: null }));
    setErrorMsg(null);
    setPhase('idle');
    setJob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    abortRef.current?.abort();
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
          transcript.segments = enrichSegments(transcript.segments);
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

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!job) return;
    try {
      const blob = await fetchTranscriptBlob(job.jobId, job.token);
      const ext = form.exportFormat;
      const fileName = `${form.file?.name.replace(/\.[^.]+$/, '') || 'transcript'}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg('Failed to download transcript. Please try again.');
    }
  };

  // ── Copy ────────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    const text = job?.transcript?.fullText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setErrorMsg('Could not copy to clipboard. Please select and copy manually.');
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto">
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
          <div className="p-6 md:p-8">
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
                className={`flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 select-none ${
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
              <div className="flex items-center justify-between p-5 border border-border/80 bg-secondary/20 rounded-xl">
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
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    aria-label={`Remove file ${form.file.name}`}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border border-border bg-card rounded-2xl shadow-xs">
          {/* Language Selector */}
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
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
          <div className="flex justify-end p-5 bg-secondary/15 border border-border/80 rounded-2xl">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!form.file || isRunning || capsUnavailable}
            >
              {isRunning ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Transcribing…</>
              ) : (
                <><Upload className="w-5 h-5" /> Transcribe Audio</>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground px-4 text-center">
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
      <div className="mt-12 pt-8 border-t border-border/60">
        <h3 className="text-lg font-bold text-foreground mb-4">Transcription Output</h3>

        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          {phase !== 'completed' || !job?.transcript ? (
            <div className="p-6">
              <EmptyState
                title="No transcription results yet"
                description="Upload an audio or video file and click Transcribe Audio. Your timestamped transcript and export controls will appear here."
                icon={<FileText className="w-8 h-8 opacity-40" />}
              />
            </div>
          ) : (
            <>
              {/* ── Metadata Bar ── */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 border-b border-border/60 bg-secondary/10">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Transcription complete</span>
                </div>
                {job.transcript.durationSeconds > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{job.transcript.durationSeconds.toFixed(1)}s media</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{job.transcript.wordCount} words · {job.transcript.segmentCount} segments</span>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  Language: <strong className="text-foreground">{job.transcript.detectedLanguage.toUpperCase()}</strong>
                  {' '}({Math.round(job.transcript.languageProbability * 100)}% confidence)
                </span>
              </div>

              {/* ── Segment Preview ── */}
              <div className="p-6 max-h-[420px] overflow-y-auto space-y-3 font-mono text-sm">
                {job.transcript.segments.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm">
                    No speech was detected in the provided media file.
                  </p>
                ) : (
                  job.transcript.segments.map((seg) => (
                    <div key={seg.id} className="flex gap-3 group">
                      <span className="text-[11px] text-primary/70 font-semibold tabular-nums pt-0.5 shrink-0 w-28">
                        {seg.startFormatted} → {seg.endFormatted}
                      </span>
                      <span className="text-foreground leading-relaxed">
                        {seg.text.trim()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* ── Action Bar ── */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-6 py-4 border-t border-border/60 bg-secondary/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetWorkspace}
                  className="order-2 sm:order-1"
                >
                  New file
                </Button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!job.transcript.fullText}
                    aria-label="Copy full transcript text to clipboard"
                  >
                    {copyDone ? (
                      <><CheckCircle2 className="w-4 h-4 text-green-500" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy Text</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    aria-label={`Download transcript as ${form.exportFormat.toUpperCase()} file`}
                  >
                    <Download className="w-4 h-4" />
                    Download .{form.exportFormat.toUpperCase()}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
