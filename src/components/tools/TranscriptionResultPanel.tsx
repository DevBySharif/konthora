'use client';

import React, {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Package,
  Pencil,
  RotateCcw,
  Search,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  ApiStructuredTranscript,
  ApiTranscriptionStatusResponse,
} from '@/lib/api';
import {
  createTranscriptExportFiles,
  createTranscriptWorkspaceState,
  createTranscriptZip,
  findTranscriptMatches,
  formatDisplayTimestamp,
  formatTranscriptForCopy,
  getHighlightParts,
  isTranscriptDirty,
  sanitizeExportBaseName,
  transcriptWorkspaceReducer,
  type TranscriptExportContext,
  type TranscriptExportFormat,
} from '@/lib/transcriptWorkspace';

interface TranscriptionResultPanelProps {
  transcript: ApiStructuredTranscript;
  status: ApiTranscriptionStatusResponse;
  file: File;
  initialExportFormat: TranscriptExportFormat;
  onDirtyChange: (dirty: boolean) => void;
  onNewFile: () => void;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getWordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

export function TranscriptionResultPanel({
  transcript,
  status,
  file,
  initialExportFormat,
  onDirtyChange,
  onNewFile,
}: TranscriptionResultPanelProps) {
  const [state, dispatch] = useReducer(
    transcriptWorkspaceReducer,
    createTranscriptWorkspaceState(transcript.segments, file.name, initialExportFormat),
  );
  const [copyDone, setCopyDone] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const transcriptPanelRef = useRef<HTMLDivElement | null>(null);
  const segmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const reducedMotionRef = useRef(false);

  const dirty = isTranscriptDirty(state);
  const matches = useMemo(
    () => findTranscriptMatches(state.segments, state.searchQuery),
    [state.segments, state.searchQuery],
  );
  const activeMatchIndex = matches.length
    ? Math.min(state.activeMatchIndex, matches.length - 1)
    : 0;
  const activeMatch = matches[activeMatchIndex];
  const editedFullText = useMemo(
    () => state.segments.map((segment) => segment.text.trim()).filter(Boolean).join(' '),
    [state.segments],
  );
  const wordCount = getWordCount(editedFullText);
  const hasUsableTimings = state.segments.some(
    (segment) => Number.isFinite(segment.start) && Number.isFinite(segment.end),
  );

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    let active = true;
    queueMicrotask(() => {
      if (active) setSourceUrl(objectUrl);
    });
    return () => {
      active = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!state.autoScroll || state.activeSegmentId === null) return;
    const panel = transcriptPanelRef.current;
    const element = segmentRefs.current.get(state.activeSegmentId);
    if (!panel || !element) return;

    const panelRect = panel.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const isVisible = elementRect.top >= panelRect.top && elementRect.bottom <= panelRect.bottom;
    if (!isVisible) {
      element.scrollIntoView({
        block: 'nearest',
        behavior: reducedMotionRef.current ? 'auto' : 'smooth',
      });
    }
  }, [state.activeSegmentId, state.autoScroll]);

  useEffect(() => {
    if (!activeMatch) return;
    const segment = state.segments[activeMatch.segmentIndex];
    const element = segment ? segmentRefs.current.get(segment.id) : undefined;
    element?.scrollIntoView({
      block: 'nearest',
      behavior: reducedMotionRef.current ? 'auto' : 'smooth',
    });
  }, [activeMatchIndex, activeMatch, state.segments]);

  const exportContext: TranscriptExportContext = {
    schemaVersion: transcript.schemaVersion || '1.0',
    jobId: transcript.jobId,
    originalFileName: status.originalFileName || file.name,
    durationSeconds: transcript.durationSeconds,
    detectedLanguage: transcript.detectedLanguage,
    languageProbability: transcript.languageProbability,
    timestampMode: status.timestampMode,
    words: transcript.words,
  };

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLMediaElement>) => {
    const currentTime = event.currentTarget.currentTime;
    let activeId: number | null = null;
    for (const segment of state.segments) {
      if (currentTime >= segment.start && currentTime < segment.end) {
        activeId = segment.id;
        break;
      }
      if (currentTime >= segment.start) activeId = segment.id;
    }
    dispatch({ type: 'set-active-segment', value: activeId });
  };

  const seekToSegment = (start: number) => {
    const media = mediaRef.current;
    if (!media || !Number.isFinite(start)) return;
    media.currentTime = Math.max(0, start);
    void media.play().catch(() => {
      // Native controls remain available if autoplay is denied.
    });
  };

  const moveMatch = (direction: -1 | 1) => {
    if (!matches.length) return;
    const next = (activeMatchIndex + direction + matches.length) % matches.length;
    dispatch({ type: 'set-active-match', value: next });
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    moveMatch(event.shiftKey ? -1 : 1);
  };

  const handleCopy = async () => {
    const copyText = formatTranscriptForCopy(
      state.segments,
      state.displayMode,
      state.includeTimestampsInCopy,
      state.timestampStyle,
    );
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setDownloadError('Could not copy to clipboard. Please select and copy manually.');
    }
  };

  const getExportFiles = () =>
    createTranscriptExportFiles(
      exportContext,
      state.segments,
      state.exportBaseName,
    );

  const handleDownload = () => {
    try {
      setDownloadError(null);
      const fileToDownload = getExportFiles()[state.exportFormat];
      downloadBlob(
        new Blob([fileToDownload.content], { type: fileToDownload.type }),
        fileToDownload.name,
      );
    } catch {
      setDownloadError('Failed to prepare the edited transcript download.');
    }
  };

  const handleDownloadAll = () => {
    try {
      setDownloadError(null);
      const files = Object.values(getExportFiles());
      const zip = createTranscriptZip(files);
      downloadBlob(zip, `${sanitizeExportBaseName(state.exportBaseName)}-exports.zip`);
    } catch {
      setDownloadError('Failed to prepare the ZIP download.');
    }
  };

  const isVideo =
    file.type.startsWith('video/') ||
    ['.mp4', '.webm', '.mov'].some((extension) => file.name.toLowerCase().endsWith(extension));

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border/60 bg-secondary/10 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
          <span>Transcription complete</span>
        </div>
        {transcript.durationSeconds > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{transcript.durationSeconds.toFixed(1)}s media</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{wordCount} words · {state.segments.length} segments</span>
        </div>
        <span className="text-xs text-muted-foreground sm:ml-auto">
          Language:{' '}
          <strong className="text-foreground">
            {(transcript.detectedLanguage ?? 'unknown').toUpperCase()}
          </strong>
          {transcript.languageProbability != null && (
            <> ({Math.round(transcript.languageProbability * 100)}% confidence)</>
          )}
        </span>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <section aria-labelledby="source-media-heading" className="rounded-xl border border-border/70 bg-secondary/10 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h4 id="source-media-heading" className="text-sm font-semibold text-foreground">Source media</h4>
              <p className="truncate text-xs text-muted-foreground">{file.name}</p>
            </div>
            <label className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={state.autoScroll}
                onChange={(event) => dispatch({ type: 'set-auto-scroll', value: event.target.checked })}
                disabled={!hasUsableTimings}
                className="h-5 w-5 accent-primary"
              />
              Follow active segment
            </label>
          </div>
          {sourceUrl && (isVideo ? (
            <video
              ref={(element) => { mediaRef.current = element; }}
              src={sourceUrl}
              controls
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              className="max-h-72 w-full rounded-lg bg-black"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <audio
              ref={(element) => { mediaRef.current = element; }}
              src={sourceUrl}
              controls
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          ))}
        </section>

        <section aria-labelledby="transcript-tools-heading" className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h4 id="transcript-tools-heading" className="text-sm font-semibold text-foreground">Review transcript</h4>
              <p className="text-xs text-muted-foreground">Edits stay in this browser session and keep every segment&apos;s original timing.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="grid min-h-11 grid-cols-2 rounded-lg border border-border bg-background p-1" aria-label="Transcript text layout">
                {(['plain', 'paragraphs'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => dispatch({ type: 'set-display-mode', value: mode })}
                    aria-pressed={state.displayMode === mode}
                    className={`rounded-md px-3 text-xs font-semibold capitalize ${state.displayMode === mode ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="grid min-h-11 grid-cols-2 rounded-lg border border-border bg-background p-1" aria-label="Timestamp display style">
                {(['compact', 'full'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => dispatch({ type: 'set-timestamp-style', value: style })}
                    aria-pressed={state.timestampStyle === style}
                    className={`rounded-md px-3 text-xs font-semibold capitalize ${state.timestampStyle === style ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: state.editing ? 'finish-editing' : 'begin-editing' })}
                className="min-h-11"
              >
                <Pencil className="h-4 w-4" />
                {state.editing ? 'Finish editing' : 'Edit transcript'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => dispatch({ type: 'undo' })} disabled={!state.history.length} className="min-h-11">
                <Undo2 className="h-4 w-4" /> Undo
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => dispatch({ type: 'revert' })} disabled={!dirty} className="min-h-11">
                <RotateCcw className="h-4 w-4" /> Revert
              </Button>
            </div>
          </div>

          <details className="group rounded-xl border border-border/70 bg-secondary/10">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <span className="inline-flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Find and replace</span>
              <span className="inline-flex items-center gap-2 text-xs font-normal text-muted-foreground">
                {matches.length} match{matches.length === 1 ? '' : 'es'}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <div className="grid gap-3 border-t border-border/70 p-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
              <label className="min-w-0 text-xs font-semibold text-muted-foreground">
                Find
                <input
                  type="search"
                  value={state.searchQuery}
                  onChange={(event) => dispatch({ type: 'set-search-query', value: event.target.value })}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search transcript"
                  className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </label>
              <div className="flex items-end gap-1">
                <button type="button" onClick={() => moveMatch(-1)} disabled={!matches.length} aria-label="Previous transcript match" className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex h-11 min-w-16 items-center justify-center text-xs text-muted-foreground" aria-live="polite">
                  {matches.length ? `${activeMatchIndex + 1}/${matches.length}` : '0/0'}
                </span>
                <button type="button" onClick={() => moveMatch(1)} disabled={!matches.length} aria-label="Next transcript match" className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <label className="min-w-0 text-xs font-semibold text-muted-foreground">
                Replace with
                <input
                  type="text"
                  value={state.replaceText}
                  onChange={(event) => dispatch({ type: 'set-replace-text', value: event.target.value })}
                  placeholder="Replacement text"
                  className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <Button type="button" variant="outline" size="sm" className="min-h-11" disabled={!activeMatch} onClick={() => activeMatch && dispatch({ type: 'replace-one', match: activeMatch, replacement: state.replaceText })}>
                  Replace
                </Button>
                <Button type="button" variant="outline" size="sm" className="min-h-11" disabled={!matches.length} onClick={() => dispatch({ type: 'replace-all', query: state.searchQuery, replacement: state.replaceText })}>
                  Replace all
                </Button>
              </div>
            </div>
            <p className="px-4 pb-4 text-[11px] text-muted-foreground">Search and replace are case-insensitive. Press Enter for next and Shift+Enter for previous.</p>
          </details>

          <div
            ref={transcriptPanelRef}
            className={`max-h-[480px] overflow-y-auto overflow-x-hidden rounded-xl border border-border/70 bg-background p-3 font-mono text-sm sm:p-4 ${state.displayMode === 'paragraphs' ? 'space-y-3' : 'space-y-1'}`}
            aria-label="Editable timestamped transcript"
          >
            {state.segments.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">No speech was detected in the provided media file.</p>
            ) : state.segments.map((segment, segmentIndex) => {
              const isActive = state.activeSegmentId === segment.id;
              return (
                <div
                  key={segment.id}
                  ref={(element) => {
                    if (element) segmentRefs.current.set(segment.id, element);
                    else segmentRefs.current.delete(segment.id);
                  }}
                  className={`flex min-w-0 flex-col gap-1 rounded-lg px-2 py-2 sm:flex-row sm:gap-3 ${isActive ? 'bg-primary/10 ring-1 ring-primary/30' : state.displayMode === 'paragraphs' ? 'bg-secondary/20' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <button
                    type="button"
                    onClick={() => seekToSegment(segment.start)}
                    disabled={!sourceUrl || !hasUsableTimings}
                    className="min-h-11 shrink-0 self-start rounded px-1 text-left text-[11px] font-semibold tabular-nums text-primary/80 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default disabled:opacity-70 sm:w-32"
                    aria-label={`Play source media from ${formatDisplayTimestamp(segment.start, state.timestampStyle)}`}
                  >
                    {formatDisplayTimestamp(segment.start, state.timestampStyle)} → {formatDisplayTimestamp(segment.end, state.timestampStyle)}
                  </button>
                  {state.editing ? (
                    <textarea
                      value={segment.text}
                      onChange={(event) => dispatch({ type: 'edit-segment', segmentIndex, text: event.target.value })}
                      rows={Math.min(8, Math.max(2, Math.ceil(segment.text.length / 80)))}
                      aria-label={`Edit transcript segment ${segmentIndex + 1}`}
                      className="min-w-0 flex-1 resize-y break-words rounded-lg border border-border bg-card p-2 font-sans text-sm leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                  ) : (
                    <span className="min-w-0 max-w-full break-words font-sans leading-relaxed text-foreground [overflow-wrap:anywhere]">
                      {getHighlightParts(segment.text.trim(), state.searchQuery).map((part, partIndex) =>
                        part.match ? (
                          <mark key={`${partIndex}-${part.text}`} className="rounded bg-amber-300 px-0.5 text-black">{part.text}</mark>
                        ) : (
                          <React.Fragment key={`${partIndex}-${part.text}`}>{part.text}</React.Fragment>
                        ),
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="export-heading" className="space-y-4 rounded-xl border border-border/70 bg-secondary/10 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="min-w-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span id="export-heading">Export file name</span>
              <input
                type="text"
                value={state.exportBaseName}
                maxLength={80}
                onChange={(event) => dispatch({ type: 'set-export-base-name', value: event.target.value })}
                onBlur={() => dispatch({ type: 'set-export-base-name', value: sanitizeExportBaseName(state.exportBaseName) })}
                aria-describedby="export-name-help"
                className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
              <span id="export-name-help" className="mt-1 block text-[11px] font-normal normal-case tracking-normal">1–80 characters. The selected extension is added automatically.</span>
            </label>
            <div className="grid min-h-11 grid-cols-4 gap-1 rounded-lg border border-border bg-background p-1">
              {(['txt', 'srt', 'vtt', 'json'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => dispatch({ type: 'set-export-format', value: format })}
                  aria-pressed={state.exportFormat === format}
                  className={`rounded-md px-2 text-xs font-bold uppercase ${state.exportFormat === format ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={state.includeTimestampsInCopy}
                onChange={(event) => dispatch({ type: 'set-copy-timestamps', value: event.target.checked })}
                className="h-5 w-5 accent-primary"
              />
              Include timestamps when copying
            </label>
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={handleCopy} disabled={!editedFullText} className="min-h-11">
                {copyDone ? <><CheckCircle2 className="h-4 w-4 text-green-500" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDownloadAll} className="min-h-11">
                <Package className="h-4 w-4" /> Download all (.zip)
              </Button>
              <Button type="button" size="sm" onClick={handleDownload} className="min-h-11">
                <Download className="h-4 w-4" /> Download .{state.exportFormat.toUpperCase()}
              </Button>
            </div>
          </div>
          {downloadError && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{downloadError}</p>}
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/60 bg-secondary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-xs text-muted-foreground" aria-live="polite">
          {dirty ? 'Unsaved transcript edits are active in this browser session.' : 'Transcript matches the completed server result.'}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onNewFile} className="min-h-11">
          New transcription
        </Button>
      </div>
    </>
  );
}
