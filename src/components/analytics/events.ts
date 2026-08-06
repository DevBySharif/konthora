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

export type TtsCharacterCountBucket = '1_250' | '251_500' | '501_1000' | '1001_1500' | '1501_2000';
export type TtsFormat = 'mp3' | 'wav';
export type TtsStage = 'submit' | 'poll' | 'download' | 'playback';

export function getCharacterCountBucket(count: number): TtsCharacterCountBucket {
  if (count <= 250) return '1_250';
  if (count <= 500) return '251_500';
  if (count <= 1000) return '501_1000';
  if (count <= 1500) return '1001_1500';
  return '1501_2000';
}

export const trackTtsSampleInserted = (source: 'input_action' | 'empty_state') => {
  trackEvent('tts_sample_inserted', { source });
};

export const trackTtsVoiceChanged = (params: {
  voice_id: string;
  accent: string;
  gender: string;
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
  character_count: number;
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
  character_count: number;
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
