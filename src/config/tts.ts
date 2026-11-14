export const SUPPORTED_LANGUAGE_CODES = [
  'en-US',
  'hi-IN',
  'es',
  'fr-FR',
  'it',
  'pt-BR',
  'bn-BD',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGE_CODES[number];

export interface SupportedLanguageConfig {
  value: SupportedLanguage;
  label: string;
  description: string;
  defaultVoiceId: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguageConfig[] = [
  {
    value: 'en-US',
    label: 'English',
    description: 'Standard English neural voices.',
    defaultVoiceId: 'af_heart',
  },
  {
    value: 'hi-IN',
    label: 'Hindi',
    description: 'Native Hindi neural voices.',
    defaultVoiceId: 'hf_alpha',
  },
  {
    value: 'es',
    label: 'Spanish',
    description: 'Native Spanish neural voices.',
    defaultVoiceId: 'ef_dora',
  },
  {
    value: 'fr-FR',
    label: 'French',
    description: 'Native French neural voices.',
    defaultVoiceId: 'ff_siwis',
  },
  {
    value: 'it',
    label: 'Italian',
    description: 'Native Italian neural voices.',
    defaultVoiceId: 'if_sara',
  },
  {
    value: 'pt-BR',
    label: 'Portuguese',
    description: 'Native Brazilian Portuguese neural voices.',
    defaultVoiceId: 'pf_dora',
  },
  {
    value: 'bn-BD',
    label: 'Bengali',
    description: 'Native Bengali (Bangla) neural voices, powered by Edge.',
    defaultVoiceId: 'bn-BD-NabanitaNeural',
  },
];

export const DEFAULT_VOICE_BY_LANGUAGE: Record<SupportedLanguage, string> =
  SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang.value] = lang.defaultVoiceId;
    return acc;
  }, {} as Record<SupportedLanguage, string>);

/**
 * Full hreflang set for the TTS language pages. Every language page (and the
 * main /text-to-speech page) must list ALL variants plus x-default: partial
 * maps taught crawlers the pages were unrelated, and the sitemap carried no
 * alternates at all. Site-relative paths — constructMetadata and sitemap.ts
 * resolve them against the canonical origin.
 */
export const TTS_LANGUAGE_ALTERNATES: Record<string, string> = {
  'en-US': '/text-to-speech',
  'hi-IN': '/text-to-speech/hindi',
  'es-ES': '/text-to-speech/spanish',
  'fr-FR': '/text-to-speech/french',
  'it-IT': '/text-to-speech/italian',
  'pt-BR': '/text-to-speech/portuguese',
  'bn-BD': '/text-to-speech/bengali',
  'x-default': '/text-to-speech',
};