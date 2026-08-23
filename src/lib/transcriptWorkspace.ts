export type TranscriptDisplayMode = 'plain' | 'paragraphs';
export type TranscriptTimestampStyle = 'compact' | 'full';
export type TranscriptExportFormat = 'txt' | 'srt' | 'vtt' | 'json';

export interface TranscriptWordData {
  word: string;
  start: number;
  end: number;
  probability?: number | null;
}

export interface TranscriptSegmentData {
  id: number;
  text: string;
  start: number;
  end: number;
  words?: TranscriptWordData[];
  noSpeechProbability?: number | null;
}

export interface EditableTranscriptSegment extends TranscriptSegmentData {
  originalText: string;
}

export interface TranscriptSearchMatch {
  segmentIndex: number;
  start: number;
  end: number;
}

export interface TranscriptExportContext {
  schemaVersion: string;
  jobId: string;
  originalFileName: string;
  durationSeconds: number;
  detectedLanguage: string | null;
  languageProbability: number | null;
  timestampMode: string;
  words?: TranscriptWordData[];
}

export interface TranscriptWorkspaceState {
  originalSegments: EditableTranscriptSegment[];
  segments: EditableTranscriptSegment[];
  history: EditableTranscriptSegment[][];
  editing: boolean;
  displayMode: TranscriptDisplayMode;
  includeTimestampsInCopy: boolean;
  timestampStyle: TranscriptTimestampStyle;
  exportFormat: TranscriptExportFormat;
  exportBaseName: string;
  searchQuery: string;
  activeMatchIndex: number;
  replaceText: string;
  autoScroll: boolean;
  activeSegmentId: number | null;
}

export type TranscriptWorkspaceAction =
  | { type: 'begin-editing' }
  | { type: 'finish-editing' }
  | { type: 'edit-segment'; segmentIndex: number; text: string }
  | { type: 'replace-one'; match: TranscriptSearchMatch; replacement: string }
  | { type: 'replace-all'; query: string; replacement: string }
  | { type: 'undo' }
  | { type: 'revert' }
  | { type: 'set-display-mode'; value: TranscriptDisplayMode }
  | { type: 'set-copy-timestamps'; value: boolean }
  | { type: 'set-timestamp-style'; value: TranscriptTimestampStyle }
  | { type: 'set-export-format'; value: TranscriptExportFormat }
  | { type: 'set-export-base-name'; value: string }
  | { type: 'set-search-query'; value: string }
  | { type: 'set-active-match'; value: number }
  | { type: 'set-replace-text'; value: string }
  | { type: 'set-auto-scroll'; value: boolean }
  | { type: 'set-active-segment'; value: number | null };

const MAX_HISTORY_ENTRIES = 30;
export const MAX_EXPORT_BASE_NAME_LENGTH = 80;

export function requiresTranscriptDiscardConfirmation(dirty: boolean): boolean {
  return dirty;
}

function cloneInitialSegments(segments: TranscriptSegmentData[]): EditableTranscriptSegment[] {
  return segments.map((segment) => ({
    ...segment,
    text: segment.text,
    originalText: segment.text,
    words: segment.words?.map((word) => ({ ...word })),
  }));
}

export function getDefaultExportBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/u, '');
  return sanitizeExportBaseName(withoutExtension || 'transcript');
}

export function createTranscriptWorkspaceState(
  segments: TranscriptSegmentData[],
  originalFileName: string,
  exportFormat: TranscriptExportFormat = 'txt',
): TranscriptWorkspaceState {
  const initialSegments = cloneInitialSegments(segments);
  return {
    originalSegments: initialSegments,
    segments: initialSegments,
    history: [],
    editing: false,
    displayMode: 'plain',
    includeTimestampsInCopy: false,
    timestampStyle: 'compact',
    exportFormat,
    exportBaseName: getDefaultExportBaseName(originalFileName),
    searchQuery: '',
    activeMatchIndex: 0,
    replaceText: '',
    autoScroll: true,
    activeSegmentId: null,
  };
}

function withHistory(
  state: TranscriptWorkspaceState,
  segments: EditableTranscriptSegment[],
): TranscriptWorkspaceState {
  return {
    ...state,
    segments,
    history: [...state.history, state.segments].slice(-MAX_HISTORY_ENTRIES),
  };
}

export function transcriptWorkspaceReducer(
  state: TranscriptWorkspaceState,
  action: TranscriptWorkspaceAction,
): TranscriptWorkspaceState {
  switch (action.type) {
    case 'begin-editing':
      if (state.editing) return state;
      return {
        ...state,
        editing: true,
        history: [...state.history, state.segments].slice(-MAX_HISTORY_ENTRIES),
      };
    case 'finish-editing':
      return { ...state, editing: false };
    case 'edit-segment':
      return {
        ...state,
        segments: state.segments.map((segment, index) =>
          index === action.segmentIndex ? { ...segment, text: action.text } : segment,
        ),
      };
    case 'replace-one': {
      const target = state.segments[action.match.segmentIndex];
      if (!target) return state;
      const nextText =
        target.text.slice(0, action.match.start) +
        action.replacement +
        target.text.slice(action.match.end);
      return withHistory(
        state,
        state.segments.map((segment, index) =>
          index === action.match.segmentIndex ? { ...segment, text: nextText } : segment,
        ),
      );
    }
    case 'replace-all': {
      const query = action.query.trim();
      if (!query) return state;
      const pattern = new RegExp(escapeRegExp(query), 'giu');
      const segments = state.segments.map((segment) => ({
        ...segment,
        text: segment.text.replace(pattern, action.replacement),
      }));
      return withHistory(state, segments);
    }
    case 'undo': {
      const previous = state.history.at(-1);
      if (!previous) return state;
      return {
        ...state,
        segments: previous,
        history: state.history.slice(0, -1),
        editing: false,
      };
    }
    case 'revert':
      return withHistory(
        { ...state, editing: false },
        state.originalSegments.map((segment) => ({ ...segment })),
      );
    case 'set-display-mode':
      return { ...state, displayMode: action.value };
    case 'set-copy-timestamps':
      return { ...state, includeTimestampsInCopy: action.value };
    case 'set-timestamp-style':
      return { ...state, timestampStyle: action.value };
    case 'set-export-format':
      return { ...state, exportFormat: action.value };
    case 'set-export-base-name':
      return { ...state, exportBaseName: action.value.slice(0, MAX_EXPORT_BASE_NAME_LENGTH) };
    case 'set-search-query':
      return { ...state, searchQuery: action.value, activeMatchIndex: 0 };
    case 'set-active-match':
      return { ...state, activeMatchIndex: action.value };
    case 'set-replace-text':
      return { ...state, replaceText: action.value };
    case 'set-auto-scroll':
      return { ...state, autoScroll: action.value };
    case 'set-active-segment':
      return state.activeSegmentId === action.value
        ? state
        : { ...state, activeSegmentId: action.value };
    default:
      return state;
  }
}

export function isTranscriptDirty(state: TranscriptWorkspaceState): boolean {
  return state.segments.some(
    (segment, index) => segment.text !== state.originalSegments[index]?.originalText,
  );
}

export function findTranscriptMatches(
  segments: TranscriptSegmentData[],
  rawQuery: string,
): TranscriptSearchMatch[] {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) return [];

  const matches: TranscriptSearchMatch[] = [];
  segments.forEach((segment, segmentIndex) => {
    const haystack = segment.text.toLocaleLowerCase();
    let start = 0;
    while (start <= haystack.length - query.length) {
      const matchStart = haystack.indexOf(query, start);
      if (matchStart === -1) break;
      matches.push({
        segmentIndex,
        start: matchStart,
        end: matchStart + query.length,
      });
      start = matchStart + Math.max(1, query.length);
    }
  });
  return matches;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

export function getHighlightParts(text: string, rawQuery: string): HighlightPart[] {
  const query = rawQuery.trim();
  if (!query) return [{ text, match: false }];
  const pattern = new RegExp(`(${escapeRegExp(query)})`, 'giu');
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      match: part.toLocaleLowerCase() === query.toLocaleLowerCase(),
    }));
}

export function formatDisplayTimestamp(
  seconds: number,
  style: TranscriptTimestampStyle,
): string {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = Math.floor(safeSeconds % 60);
  if (style === 'full') {
    return `[${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
  }
  if (hours > 0) {
    return `[${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
  }
  return `[${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
}

export function formatTranscriptForCopy(
  segments: TranscriptSegmentData[],
  displayMode: TranscriptDisplayMode,
  includeTimestamps: boolean,
  timestampStyle: TranscriptTimestampStyle,
): string {
  const separator = displayMode === 'paragraphs' ? '\n\n' : ' ';
  return segments
    .map((segment) => {
      const text = segment.text.trim();
      if (!includeTimestamps) return text;
      return `${formatDisplayTimestamp(segment.start, timestampStyle)} ${text}`.trim();
    })
    .filter(Boolean)
    .join(separator);
}

export function sanitizeExportBaseName(value: string): string {
  return value
    .trim()
    .slice(0, MAX_EXPORT_BASE_NAME_LENGTH)
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/[-_]{2,}/gu, '-')
    .replace(/^[-_.]+|[-_.]+$/gu, '')
    .slice(0, MAX_EXPORT_BASE_NAME_LENGTH) || 'transcript';
}

function parseTimestamp(seconds: number): [number, number, number, number] {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  let hours = Math.floor(safe / 3600);
  let minutes = Math.floor((safe % 3600) / 60);
  let secs = Math.floor(safe % 60);
  let milliseconds = Math.round((safe - Math.floor(safe)) * 1000);
  if (milliseconds >= 1000) {
    milliseconds = 0;
    secs += 1;
    if (secs >= 60) {
      secs = 0;
      minutes += 1;
      if (minutes >= 60) {
        minutes = 0;
        hours += 1;
      }
    }
  }
  return [hours, minutes, secs, milliseconds];
}

function formatCueTimestamp(seconds: number, separator: ',' | '.'): string {
  const [hours, minutes, secs, milliseconds] = parseTimestamp(seconds);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}${separator}${String(milliseconds).padStart(3, '0')}`;
}

function wrapSubtitleText(text: string, limit = 84): string {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return '';
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > limit) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.join('\n');
}

export function renderTxt(segments: TranscriptSegmentData[]): string {
  return segments
    .map((segment) => `${formatDisplayTimestamp(segment.start, 'compact')}\n${segment.text.trim()}\n`)
    .join('\n');
}

function normalizedCueTimes(
  segments: TranscriptSegmentData[],
): Array<TranscriptSegmentData & { cueStart: number; cueEnd: number }> {
  let lastEnd = 0;
  return segments.map((segment) => {
    const cueStart = Math.max(lastEnd, Math.max(0, segment.start));
    const cueEnd = Math.max(cueStart + 0.5, segment.end);
    lastEnd = cueEnd;
    return { ...segment, cueStart, cueEnd };
  });
}

export function renderSrt(segments: TranscriptSegmentData[]): string {
  return normalizedCueTimes(segments)
    .map(
      (segment, index) =>
        `${index + 1}\n${formatCueTimestamp(segment.cueStart, ',')} --> ${formatCueTimestamp(segment.cueEnd, ',')}\n${wrapSubtitleText(segment.text)}\n`,
    )
    .join('\n');
}

export function renderVtt(segments: TranscriptSegmentData[]): string {
  const cues = normalizedCueTimes(segments)
    .map(
      (segment, index) =>
        `${index + 1}\n${formatCueTimestamp(segment.cueStart, '.')} --> ${formatCueTimestamp(segment.cueEnd, '.')}\n${wrapSubtitleText(segment.text)}\n`,
    )
    .join('\n');
  return `WEBVTT\n\n${cues}`;
}

export function renderJson(
  context: TranscriptExportContext,
  segments: EditableTranscriptSegment[],
): string {
  const fullText = segments.map((segment) => segment.text.trim()).filter(Boolean).join(' ');
  return JSON.stringify(
    {
      schemaVersion: context.schemaVersion,
      jobId: context.jobId,
      source: {
        displayName: context.originalFileName,
        durationSeconds: context.durationSeconds,
      },
      language: {
        detected: context.detectedLanguage,
        probability: context.languageProbability,
      },
      timestampMode: context.timestampMode,
      fullText,
      edited: segments.some((segment) => segment.text !== segment.originalText),
      segments: segments.map(({ originalText, ...segment }) => ({
        ...segment,
        edited: segment.text !== originalText,
      })),
      words: context.words ?? [],
    },
    null,
    2,
  );
}

export interface TranscriptExportFile {
  name: string;
  type: string;
  content: string;
}

export function createTranscriptExportFiles(
  context: TranscriptExportContext,
  segments: EditableTranscriptSegment[],
  rawBaseName: string,
): Record<TranscriptExportFormat, TranscriptExportFile> {
  const baseName = sanitizeExportBaseName(rawBaseName);
  return {
    txt: { name: `${baseName}.txt`, type: 'text/plain;charset=utf-8', content: renderTxt(segments) },
    srt: { name: `${baseName}.srt`, type: 'application/x-subrip;charset=utf-8', content: renderSrt(segments) },
    vtt: { name: `${baseName}.vtt`, type: 'text/vtt;charset=utf-8', content: renderVtt(segments) },
    json: { name: `${baseName}.json`, type: 'application/json;charset=utf-8', content: renderJson(context, segments) },
  };
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

function concatBytes(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

export function createTranscriptZip(files: TranscriptExportFile[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const checksum = crc32(data);

    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, 0);
    writeUint16(localView, 12, 0);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, data.length);
    writeUint32(localView, 22, data.length);
    writeUint16(localView, 26, name.length);
    writeUint16(localView, 28, 0);
    localHeader.set(name, 30);
    localParts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, 0);
    writeUint16(centralView, 14, 0);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, data.length);
    writeUint32(centralView, 24, data.length);
    writeUint16(centralView, 28, name.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, localOffset);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);

    localOffset += localHeader.length + data.length;
  }

  const localData = concatBytes(localParts);
  const centralData = concatBytes(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralData.length);
  writeUint32(endView, 16, localData.length);
  writeUint16(endView, 20, 0);

  const archive = concatBytes([localData, centralData, end]);
  return new Blob([archive.buffer], { type: 'application/zip' });
}
