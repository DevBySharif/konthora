export const TTS_PREFERENCES_STORAGE_KEY = 'konthora.tts.preferences.v1';
export const TTS_PREFERENCES_VERSION = 1;

export const TTS_LANGUAGE_CODES = [
  'en-US',
  'hi-IN',
  'es',
  'fr-FR',
  'it',
  'pt-BR',
] as const;

export type TtsPreferenceLanguage = (typeof TTS_LANGUAGE_CODES)[number];
export type TtsOutputFormat = 'mp3' | 'wav';

export const TTS_SPEED_PRESETS = [
  { label: 'Slow', value: 0.85 },
  { label: 'Normal', value: 1 },
  { label: 'Fast', value: 1.15 },
] as const;

export const TTS_SENTENCE_PAUSE_CONTROL = {
  min: 0,
  max: 1000,
  step: 10,
} as const;

export const TTS_PARAGRAPH_PAUSE_CONTROL = {
  min: 0,
  max: 2000,
  step: 25,
} as const;

export interface TtsPreferences {
  version: typeof TTS_PREFERENCES_VERSION;
  language: TtsPreferenceLanguage;
  voiceId: string;
  speed: number;
  outputFormat: TtsOutputFormat;
  sentencePauseMs: number;
  paragraphPauseMs: number;
  normalizeText: boolean;
}

export const DEFAULT_TTS_PREFERENCES: TtsPreferences = {
  version: TTS_PREFERENCES_VERSION,
  language: 'en-US',
  voiceId: 'af_heart',
  speed: 1,
  outputFormat: 'mp3',
  sentencePauseMs: 220,
  paragraphPauseMs: 500,
  normalizeText: true,
};

export function getDefaultTtsPreferences(): TtsPreferences {
  return { ...DEFAULT_TTS_PREFERENCES };
}

function isFiniteInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;
}

export function parseTtsPreferences(value: string | null): TtsPreferences | null {
  if (!value) return null;

  try {
    const candidate = JSON.parse(value) as Partial<TtsPreferences>;
    if (
      candidate.version !== TTS_PREFERENCES_VERSION ||
      !TTS_LANGUAGE_CODES.includes(candidate.language as TtsPreferenceLanguage) ||
      typeof candidate.voiceId !== 'string' ||
      !candidate.voiceId.trim() ||
      !isFiniteInRange(candidate.speed, 0.75, 1.25) ||
      (candidate.outputFormat !== 'mp3' && candidate.outputFormat !== 'wav') ||
      !isFiniteInRange(candidate.sentencePauseMs, 0, 1000) ||
      !isFiniteInRange(candidate.paragraphPauseMs, 0, 2000) ||
      typeof candidate.normalizeText !== 'boolean'
    ) {
      return null;
    }

    return {
      version: TTS_PREFERENCES_VERSION,
      language: candidate.language as TtsPreferenceLanguage,
      voiceId: candidate.voiceId,
      speed: candidate.speed,
      outputFormat: candidate.outputFormat,
      sentencePauseMs: candidate.sentencePauseMs,
      paragraphPauseMs: candidate.paragraphPauseMs,
      normalizeText: candidate.normalizeText,
    };
  } catch {
    return null;
  }
}

export function estimateTtsDurationSeconds(
  text: string,
  speed: number,
  sentencePauseMs: number,
  paragraphPauseMs: number,
): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const words = trimmed.split(/\s+/u).length;
  const safeSpeed = Math.min(1.25, Math.max(0.75, speed));
  const speechSeconds = words / ((140 / 60) * safeSpeed);
  const sentenceBoundaries = Math.max(0, (trimmed.match(/[.!?।॥]+(?=\s|$)/gu) ?? []).length - 1);
  const paragraphBoundaries = (trimmed.match(/\n\s*\n/gu) ?? []).length;
  const pauseSeconds =
    sentenceBoundaries * (sentencePauseMs / 1000) +
    paragraphBoundaries * (paragraphPauseMs / 1000);

  return Math.max(1, Math.round(speechSeconds + pauseSeconds));
}

export function formatEstimatedDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '~0m 0s';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `~${minutes}m ${seconds}s`;
}
