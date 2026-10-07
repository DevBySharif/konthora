import { sendGAEvent } from '@next/third-parties/google';

const isProduction = process.env.NODE_ENV === 'production';

// Safely send events only in production
function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (!isProduction) return;
  if (params) {
    sendGAEvent('event', eventName, params);
  } else {
    sendGAEvent('event', eventName);
  }
}

/**
 * Buckets are inclusive ranges. The first bucket is labelled `0_250` because a
 * count of 0 is possible (empty editor) and "1_250" misreads as starting at 1.
 */
export type TtsCharacterCountBucket = '0_250' | '251_500' | '501_1000' | '1001_1500' | '1501_2000';
export type TtsFormat = 'mp3' | 'wav';
export type TtsStage = 'submit' | 'poll' | 'download' | 'playback';

export function getCharacterCountBucket(count: number): TtsCharacterCountBucket {
  if (count <= 250) return '0_250';
  if (count <= 500) return '251_500';
  if (count <= 1000) return '501_1000';
  if (count <= 1500) return '1001_1500';
  return '1501_2000';
}

export const trackTtsSampleInserted = (source: 'input_action' | 'empty_state' | 'quick_start') => {
  trackEvent('tts_sample_inserted', { source });
};

export const trackTtsVoiceChanged = (params: {
  voice_id: string;
  accent: string;
  gender: string;
  language?: string;
  recommended: boolean;
}) => {
  trackEvent('tts_voice_changed', params);
};

export const trackTtsSpeedChanged = (speed: number) => {
  trackEvent('tts_speed_changed', { speed });
};

export const trackTtsFormatChanged = (format: TtsFormat) => {
  trackEvent('tts_format_changed', { format });
};

export const trackTtsGenerateClicked = (params: {
  voice_id: string;
  accent: string;
  gender: string;
  speed: number;
  format: TtsFormat;
  character_count_bucket: TtsCharacterCountBucket;
}) => {
  trackEvent('tts_generate_clicked', params);
};

export const trackTtsGenerationCompleted = (params: {
  voice_id: string;
  accent: string;
  gender: string;
  speed: number;
  format: TtsFormat;
  character_count_bucket: TtsCharacterCountBucket;
  duration_seconds?: number;
  elapsed_seconds: number;
}) => {
  trackEvent('tts_generation_completed', params);
};

export const trackTtsGenerationFailed = (params: {
  stage: TtsStage;
  error_code?: string;
  voice_id: string;
  format: TtsFormat;
}) => {
  trackEvent('tts_generation_failed', params);
};

export const trackTtsPreviewPlayed = (params: { voice_id: string; format: TtsFormat }) => {
  trackEvent('tts_preview_played', params);
};

export const trackTtsAudioDownloaded = (params: { voice_id: string; format: TtsFormat }) => {
  trackEvent('tts_audio_downloaded', params);
};

export const trackTtsVoicePreviewPlayed = (params: {
  voice_id: string;
  accent: string;
  gender: string;
  recommended: boolean;
}) => {
  trackEvent('tts_voice_preview_played', params);
};

// ── Transcription analytics ──────────────────────────────────────────────────
// Privacy rule, same as TTS: never send file names, transcript text, or the
// detected-language guess. Only sizes, counts, and configuration choices.

export type TranscriptExportFormat = 'txt' | 'srt' | 'vtt' | 'json';
export type TranscriptTimestampMode = 'sentence' | 'paragraph' | 'word';
export type TranscriptFileSizeBucket = '0_10mb' | '10_50mb' | '50_100mb';

export function getFileSizeBucket(bytes: number): TranscriptFileSizeBucket {
  const mb = bytes / (1024 * 1024);
  if (mb <= 10) return '0_10mb';
  if (mb <= 50) return '10_50mb';
  return '50_100mb';
}

export const trackTranscriptFileSelected = (params: {
  file_size_bucket: TranscriptFileSizeBucket;
  is_video: boolean;
  source: 'picker' | 'drop';
}) => {
  trackEvent('transcript_file_selected', params);
};

export const trackTranscriptFileRejected = (params: { reason: string }) => {
  trackEvent('transcript_file_rejected', params);
};

export const trackTranscriptSubmitClicked = (params: {
  language: string;
  timestamp_mode: TranscriptTimestampMode;
  export_format: TranscriptExportFormat;
  file_size_bucket: TranscriptFileSizeBucket;
  is_video: boolean;
}) => {
  trackEvent('transcript_submit_clicked', params);
};

export const trackTranscriptCompleted = (params: {
  timestamp_mode: TranscriptTimestampMode;
  export_format: TranscriptExportFormat;
  duration_seconds: number | null;
  segment_count: number | null;
  word_count: number | null;
  elapsed_seconds: number;
}) => {
  trackEvent('transcript_completed', params);
};

export const trackTranscriptFailed = (params: {
  stage: 'submit' | 'poll';
  error_code?: string;
  export_format: TranscriptExportFormat;
}) => {
  trackEvent('transcript_failed', params);
};

export const trackTranscriptResultDownloaded = (params: {
  format: TranscriptExportFormat;
  edited: boolean;
  bundled: boolean;
}) => {
  trackEvent('transcript_result_downloaded', params);
};

export const trackTranscriptEdited = (params: {
  action: 'edit' | 'replace' | 'undo' | 'revert';
  match_count: number;
}) => {
  trackEvent('transcript_edited', params);
};
