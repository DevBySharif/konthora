export const SUPPORTED_LANGUAGE_CODES = [
  'en-US',
  'hi-IN',
  'es',
  'fr-FR',
  'it',
  'pt-BR',
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
];

export const DEFAULT_VOICE_BY_LANGUAGE: Record<SupportedLanguage, string> =
  SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang.value] = lang.defaultVoiceId;
    return acc;
  }, {} as Record<SupportedLanguage, string>);