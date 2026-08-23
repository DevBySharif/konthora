import { getAllVoices } from '@/config/voices';

/**
 * Stable, public product facts used where a single factual baseline matters.
 * Voice totals are derived from the authoritative voice catalogue.
 */
export const SUPPORTED_TTS_LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'Italian',
  'Portuguese',
] as const;

export const TOTAL_TTS_VOICES = getAllVoices().length;
export const TTS_LANGUAGE_COUNT = SUPPORTED_TTS_LANGUAGES.length;
export const TTS_LANGUAGE_NAMES = SUPPORTED_TTS_LANGUAGES.join(', ');
export const TRANSCRIPTION_LANGUAGE = 'English' as const;
export const TTS_OUTPUT_FORMATS = ['MP3', 'WAV'] as const;
export const TRANSCRIPT_EXPORT_FORMATS = ['TXT', 'SRT', 'VTT', 'JSON'] as const;
