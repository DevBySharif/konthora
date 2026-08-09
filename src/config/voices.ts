import type { ApiVoice } from '@/lib/api';

/**
 * Static content for the core voice landing pages at /voices/{voice-id}.
 *
 * The factual fields (id, displayName, gender, accent, language, recommended,
 * defaultSpeed, minimumSpeed, maximumSpeed) mirror the backend catalogue in
 * backend/app/services/kokoro_service.py. The remaining fields are page-level
 * content: intro, useCases, related, and faqs. No invented tonal descriptors —
 * only accent, gender, language, recommended status, and supported speed range.
 */

export interface VoicePageFaq {
  question: string;
  answer: string;
}

export interface VoicePageConfig extends ApiVoice {
  slug: string;
  shortName: string;
  heading: string;
  title: string;
  description: string;
  intro: string;
  useCases: string[];
  related: string[];
  faqs: VoicePageFaq[];
}

function idToSlug(id: string): string {
  return id.replace(/_/g, '-');
}

function slugToId(slug: string): string {
  return slug.replace(/-/g, '_');
}

export function getLanguagePage(language: string): string {
  switch (language) {
    case 'hi-IN':
      return '/text-to-speech/hindi';
    case 'es':
      return '/text-to-speech/spanish';
    case 'fr-FR':
      return '/text-to-speech/french';
    case 'it':
      return '/text-to-speech/italian';
    case 'pt-BR':
      return '/text-to-speech/portuguese';
    default:
      return '/text-to-speech';
  }
}

function getLanguageLabel(language: string): string {
  switch (language) {
    case 'hi-IN':
      return 'Hindi';
    case 'es':
      return 'Spanish';
    case 'fr-FR':
      return 'French';
    case 'it':
      return 'Italian';
    case 'pt-BR':
      return 'Portuguese';
    default:
      return 'English';
  }
}

export function buildVoice(
  config: ApiVoice,
  content: {
    heading?: string;
    intro: string;
    useCases: string[];
    related: string[];
    faqs: VoicePageFaq[];
  }
): VoicePageConfig {
  const name = config.displayName.replace(/\s*\((Female|Male)\)/, '');
  const languageLabel = getLanguageLabel(config.language);
  const genderWord = config.gender === 'female' ? 'Female' : 'Male';
  const heading = content.heading || `${name} ${genderWord} ${languageLabel} AI Voice`;
  const title = `${name} — ${languageLabel} ${genderWord} Text-to-Speech Voice | Konthora`;
  const description = `${name} is a ${genderWord.toLowerCase()} ${languageLabel} AI voice with a ${config.accent} accent in Konthora. Listen to the preview, generate ${languageLabel} speech at ${config.minimumSpeed}×–${config.maximumSpeed}× speed, and export audio as MP3 or WAV.`;

  return {
    ...config,
    slug: idToSlug(config.id),
    shortName: name,
    heading,
    title,
    description,
    intro: content.intro,
    useCases: content.useCases,
    related: content.related,
    faqs: content.faqs,
  };
}

export const VOICE_PAGE_CONFIGS: VoicePageConfig[] = [
  buildVoice({
    id: 'af_heart',
    displayName: 'Heart (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    heading: 'Heart Female American English AI Voice',
    intro: 'Heart is the default female American English voice in the Konthora text-to-speech workspace. It reads standard US English at a default speed of 1.0× and is marked as recommended in the voice picker, making it the starting point for most English narration with optional playback between 0.75× and 1.25×.',
    useCases: [
      'Narrating English explainer videos, product demos, and short-form social clips.',
      'Reading presentation slides, e-learning lessons, and course scripts aloud.',
      'Checking the pacing and pronunciation of written English copy before producing.',
    ],
    related: ['am_adam', 'af_nicole', 'bf_emma'],
    faqs: [
      { question: 'Is Heart a male or female voice?', answer: 'Heart is a female voice speaking American English.' },
      { question: 'Why is Heart marked as recommended?', answer: 'Heart is flagged as recommended in the Konthora voice catalogue, which signals the default female American English choice.' },
      { question: 'What speed range does Heart support?', answer: 'Heart supports speech from 0.75× up to 1.25×, with a default speed of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_adam',
    displayName: 'Adam (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Adam is a male American English voice marked as recommended in the Konthora voice picker. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is the counterpart to Heart when a male US narrator is preferred for video, podcast, or e-learning scripts.',
    useCases: [
      'Male narration for English YouTube videos, ads, and short social clips.',
      'E-learning narration, presentations, and corporate training audio.',
      'Checking the sound of English scripts before the final edit for podcasts.',
    ],
    related: ['af_heart', 'bm_lewis', 'bm_george'],
    faqs: [
      { question: 'Is Adam a male or female voice?', answer: 'Adam is a male voice speaking American English.' },
      { question: 'Is Adam recommended in Konthora?', answer: 'Yes. Adam is flagged as recommended alongside Heart (female) in the catalogue.' },
      { question: 'What speed settings does Adam support?', answer: 'Adam supports speed from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_nicole',
    displayName: 'Nicole (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Nicole is a female American English voice in the Konthora catalogue, a second US female option alongside the recommended Heart. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, useful when comparing voices or mixing several narrators in one project.',
    useCases: [
      'Comparing American English female voices before committing to a narrator.',
      'Second-narrator voiceovers for interviews, series, and multi-part content.',
      'Reading long-form English scripts where a different female US voice is desired.',
    ],
    related: ['af_heart', 'am_adam', 'bf_emma'],
    faqs: [
      { question: 'Is Nicole a female voice?', answer: 'Yes, Nicole is a female voice speaking American English.' },
      { question: 'Is Nicole recommended in the catalogue?', answer: 'No. Nicole is part of the American English set but is not flagged as recommended.' },
      { question: 'Does Nicole support speed control?', answer: 'Nicole supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bf_emma',
    displayName: 'Emma (Female)',
    gender: 'female',
    accent: 'British English',
    language: 'en-GB',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Emma is a female British English voice and one of the recommended voices in the Konthora catalogue. It reads UK English at a default of 1.0× speed (range 0.75×–1.25×), making it the go-to choice when British pronunciation and spelling conventions are preferred for narration.',
    useCases: [
      'Narrating video content for UK and international English audiences.',
      'E-learning, audiobook, and documentary narration with a British accent.',
      'Podcast scripts and marketing copy read naturally in British English.',
    ],
    related: ['bm_lewis', 'af_heart', 'bm_george'],
    faqs: [
      { question: 'Is Emma a British English voice?', answer: 'Yes. Emma is a recommended female voice speaking British English (en-GB).' },
      { question: 'Is Emma available for free?', answer: 'Emma is part of the free Konthora browser-based text-to-speech workspace.' },
      { question: 'What is Emma\'s speed range?', answer: 'Emma supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bm_lewis',
    displayName: 'Lewis (Male)',
    gender: 'male',
    accent: 'British English',
    language: 'en-GB',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Lewis is a male British English voice and one of the recommended voices in the Konthora catalogue. It reads UK English at a default speed of 1.0× (range 0.75×–1.25×) and is the male British counterpart to Emma for narration and e-learning workloads.',
    useCases: [
      'British male narration for video, advertising, and YouTube content.',
      'Corporate training, e-learning, and audiobook-style narration.',
      'Reading scripts aloud to verify tone and timing before final recording.',
    ],
    related: ['bf_emma', 'am_adam', 'bm_george'],
    faqs: [
      { question: 'Is Lewis a British male voice?', answer: 'Yes. Lewis is a recommended male voice speaking British English (en-GB).' },
      { question: 'Can I download audio from Lewis?', answer: 'Yes. Konthora exports generated speech as MP3 or WAV.' },
      { question: 'What is Lewis\'s speed range?', answer: 'Lewis supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bm_george',
    displayName: 'George (Male)',
    gender: 'male',
    accent: 'British English',
    language: 'en-GB',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'George is a male British English voice in the Konthora catalogue, an additional UK male option beyond the recommended Lewis. It reads English from 0.75× to 1.25× with a default of 1.0× and is available whenever a second British male narrator or voice comparison is needed.',
    useCases: [
      'Second male narrator for UK-accented series, podcasts, and interviews.',
      'Comparing British male voices before choosing the narrator for a project.',
      'Long-form English narration such as courses, documentaries, and scripts.',
    ],
    related: ['bm_lewis', 'bf_emma', 'am_adam'],
    faqs: [
      { question: 'Is George a British male voice?', answer: 'Yes. George is a male voice speaking British English (en-GB).' },
      { question: 'Is George recommended?', answer: 'No. George is available in the British English set but is not flagged as recommended.' },
      { question: 'Does George support speed control?', answer: 'George supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'hf_alpha',
    displayName: 'Alpha (Female)',
    gender: 'female',
    accent: 'Hindi',
    language: 'hi-IN',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Alpha is a female Hindi voice in the Konthora catalogue, one of four native Hindi voices that read Devanagari text. It speaks at a default speed of 1.0× (range 0.75×–1.25×) and is the primary female choice for Hindi narration alongside Omega (male).',
    useCases: [
      'Hindi narration for YouTube videos and social content aimed at Indian viewers.',
      'Hindi e-learning lessons, course narration, and corporate audio.',
      'Voice scripts in Hindi to check pronunciation and pacing before sharing.',
    ],
    related: ['hm_omega', 'af_heart', 'if_sara'],
    faqs: [
      { question: 'Is Alpha a Hindi voice?', answer: 'Yes. Alpha is a female voice speaking Hindi (hi-IN).' },
      { question: 'Which other Hindi voices exist?', answer: 'The Hindi set includes Alpha and Beta (female) along with Omega and Psi (male).' },
      { question: 'What is Alpha\'s speed range?', answer: 'Alpha supports speed from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'hm_omega',
    displayName: 'Omega (Male)',
    gender: 'male',
    accent: 'Hindi',
    language: 'hi-IN',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Omega is a male Hindi voice in the Konthora catalogue, speaking native Indian Hindi at a default of 1.0× (range 0.75×–1.25×). As the male counterpart to Alpha, it is the standard choice for male-voiced Hindi narration in the workspace.',
    useCases: [
      'Hindi male narration for stories, podcasts, and online videos.',
      'Hindi e-learning audio and voice for Indian-language courseware.',
      'Reading scripts where a male Hindi narrator is preferred.',
    ],
    related: ['hf_alpha', 'em_alex', 'if_sara'],
    faqs: [
      { question: 'Is Omega a male Hindi voice?', answer: 'Yes. Omega is a male voice speaking Hindi (hi-IN).' },
      { question: 'Is Omega recommended?', answer: 'Omega is part of the native Hindi set and is not specifically flagged as recommended.' },
      { question: 'What is Omega\'s speed range?', answer: 'Omega supports speed from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'ef_dora',
    displayName: 'Dora (Female)',
    gender: 'female',
    accent: 'Spanish',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Dora is a female Spanish voice in the Konthora multilingual workspace, part of the \"es\" set alongside Alex and Santa. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is the female option for Spanish narration.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons and courses for Latin-American and Spanish audiences.',
      'Hearing Spanish scripts read aloud to review flow and clarity.',
    ],
    related: ['em_alex', 'if_sara', 'ff_siwis'],
    faqs: [
      { question: 'Is Dora a Spanish voice?', answer: 'Yes. Dora is a female voice speaking Spanish (es).' },
      { question: 'Is Dora recommended?', answer: 'Dora is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What is Dora\'s speed range?', answer: 'Dora supports speed from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'em_alex',
    displayName: 'Alex (Male)',
    gender: 'male',
    accent: 'Spanish',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Alex is a male Spanish voice in the Konthora catalogue, part of the Spanish set with Dora and Santa. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is the native male voice for Spanish narration.',
    useCases: [
      'Male Spanish narration for videos, ads, and audio content.',
      'Spanish e-learning and training narration for companies and schools.',
      'Reviewing translated Spanish scripts through spoken playback.',
    ],
    related: ['ef_dora', 'pm_alex', 'if_sara'],
    faqs: [
      { question: 'Is Alex a male Spanish voice?', answer: 'Yes. Alex is a male voice speaking Spanish (es).' },
      { question: 'Is Alex recommended?', answer: 'Alex is part of the Spanish voice set and is not flagged as recommended.' },
      { question: 'What speed settings does Alex support?', answer: 'Alex supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'ff_siwis',
    displayName: 'Siwis (Female)',
    gender: 'female',
    accent: 'French',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Siwis is a female French voice and the only native French voice in the Konthora catalogue. It reads French (fr-FR) at a default speed of 1.0× (range 0.75×–1.25×) and is the sole French option in the workspace for narration and tutorials.',
    useCases: [
      'French narration for videos, tutorials, and ads aimed at French speakers.',
      'French e-learning, course audio, and spoken-language practice.',
      'Reading French scripts aloud to check pronunciation and phrasing.',
    ],
    related: ['if_sara', 'ef_dora', 'af_heart'],
    faqs: [
      { question: 'Is Siwis a French voice?', answer: 'Yes. Siwis is a female voice speaking French (fr-FR).' },
      { question: 'Only native French voice — really?', answer: 'The French set currently ships a single voice, Siwis (female). Select French in the workspace to use it.' },
      { question: 'What is Siwis\'s speed range?', answer: 'Siwis supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'if_sara',
    displayName: 'Sara (Female)',
    gender: 'female',
    accent: 'Italian',
    language: 'it',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Sara is a female Italian voice in the Konthora catalogue, joined in the Italian set by Nicola (male). It reads Italian at a default speed of 1.0× (range 0.75×–1.25×) and is the native female voice for Italian narration.',
    useCases: [
      'Italian narration for videos, ads, and e-learning courses.',
      'Italian voiceover for podcasts and marketing content.',
      'Reviewing Italian scripts through natural-sounding spoken playback.',
    ],
    related: ['pm_alex', 'ff_siwis', 'ef_dora'],
    faqs: [
      { question: 'Is Sara an Italian voice?', answer: 'Yes. Sara is a female voice speaking Italian (it), alongside Nicola (male).' },
      { question: 'Is Sara recommended?', answer: 'The Italian set contains Sara and Nicola; neither is flagged as recommended.' },
      { question: 'What is Sara\'s speed range?', answer: 'Sara supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'pm_alex',
    displayName: 'Alex (Male)',
    gender: 'male',
    accent: 'Portuguese',
    language: 'pt-BR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Alex is a male Brazilian Portuguese voice in the Konthora catalogue, part of the pt-BR set with Dora and Santa. It reads Brazilian Portuguese at a default speed of 1.0× (range 0.75×–1.25×) and is the native male voice for Portuguese narration.',
    useCases: [
      'Brazilian Portuguese narration for videos, ads, and e-learning.',
      'Localized Portuguese audio for e-commerce, education, and media products.',
      'Portuguese scripts read aloud to verify rhythm and pronunciation.',
    ],
    related: ['if_sara', 'bf_emma', 'ef_dora'],
    faqs: [
      { question: 'Is Alex a Portuguese voice?', answer: 'Yes. Alex is a male voice speaking Brazilian Portuguese (pt-BR).' },
      { question: 'Which other Portuguese voices exist?', answer: 'The Portuguese set includes Dora (female), Alex (male), and Santa (male).' },
      { question: 'What speed settings does Alex support?', answer: 'Alex supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
];

const VOICE_BY_SLUG = new Map(VOICE_PAGE_CONFIGS.map((v) => [v.slug, v]));

export function getAllVoices(): VoicePageConfig[] {
  return VOICE_PAGE_CONFIGS;
}

export function getVoiceBySlug(slug: string): VoicePageConfig | undefined {
  return VOICE_BY_SLUG.get(slug);
}

export function getVoiceBySlugOrId(value: string): VoicePageConfig | undefined {
  return getVoiceBySlug(value) || VOICE_PAGE_CONFIGS.find((v) => v.id === value);
}

export function getVoiceUrl(slug: string): string {
  return `/voices/${slug}`;
}

export function getVoiceIdFromSlug(slug: string): string {
  return slugToId(slug);
}

export function getVoiceSlugFromId(id: string): string {
  return idToSlug(id);
}

export function getRelatedVoices(voice: VoicePageConfig): VoicePageConfig[] {
  return voice.related
    .map((id) => VOICE_PAGE_CONFIGS.find((v) => v.id === id))
    .filter((v): v is VoicePageConfig => Boolean(v));
}

export function getLanguageVoicePages(language: string): VoicePageConfig[] {
  return VOICE_PAGE_CONFIGS.filter((v) => v.language === language);
}
