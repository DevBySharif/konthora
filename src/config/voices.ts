import type { ApiVoice } from '@/lib/api';

/**
 * Static content for the core voice landing pages at /voices/{voice-id}.
 *
 * The factual fields (id, displayName, gender, accent, language, recommended,
 * defaultSpeed, minimumSpeed, maximumSpeed) mirror the backend catalogue in
 * backend/app/services/kokoro_service.py (Kokoro voices) and the live
 * GET /api/v1/tts/voices response from the Konthora API
 * (https://devsharif-konthora-api.hf.space, fetched 2026-11-15, 129 voices:
 * 41 Kokoro + 88 Edge). The remaining fields are page-level content: intro,
 * useCases, related, and faqs. No invented tonal descriptors —
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
  // Kokoro ids are already lowercase with underscores (af_heart -> af-heart).
  // Edge ids have no underscores but are mixed case, so the slug is the
  // lowercased id (bn-BD-NabanitaNeural -> bn-bd-nabanitaneural).
  return id.replace(/_/g, '-').toLowerCase();
}

function slugToId(slug: string): string {
  return slug.replace(/-/g, '_');
}

export function getLanguagePage(language: string): string {
  switch (language) {
    case 'bn-BD':
      return '/text-to-speech/bengali';
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
    case 'bn-BD':
      return 'Bengali';
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

/**
 * Hard ceiling on generated `<title>` and `description` lengths.
 *
 * Google truncates SERP titles around 580px and descriptions around 920px.
 * The previous generator pasted a whole use-case sentence into the title,
 * producing 116–130 character titles across all 41 voice pages, so the
 * differentiating terms were never actually shown.
 */
const TITLE_MAX = 65;
const TITLE_SUFFIX = ' | Konthora';
const DESCRIPTION_MAX = 155;

/**
 * Truncates on a word boundary without leaving a dangling article, conjunction,
 * or trailing punctuation.
 */
function clamp(text: string, max: number): string {
  const trimmed = text.trim().replace(/[\s,;:.\-–—]+$/, '');
  if (trimmed.length <= max) return trimmed;

  const hardCut = trimmed.slice(0, max);
  const lastSpace = hardCut.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? hardCut.slice(0, lastSpace) : hardCut;

  return cut
    .replace(/[\s,;:.\-–—]+$/, '')
    .replace(/\b(a|an|the|and|or|for|with|to|of|in|on)$/i, '')
    .trim();
}

/**
 * Reduces a full use-case sentence to a compact phrase for the title,
 * e.g. "Hindi narration for YouTube videos and social content ..." becomes
 * "Hindi narration". Trailing connectives are stripped so the phrase never
 * reads as "narration for" or "voiceovers and".
 */
function shortUseCase(useCase: string): string {
  const firstClause = useCase.split(',')[0].replace(/\.$/, '').trim();
  let phrase = firstClause.split(/\s+/).slice(0, 3).join(' ');

  // Drop dangling connectives.
  const TRAILING = /\s+(for|and|or|with|to|of|in|on|that|which)$/i;
  let previous;
  do {
    previous = phrase;
    phrase = phrase.replace(TRAILING, '').trim();
  } while (phrase !== previous);

  return phrase;
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

  // Identity (name + gender + accent) is the high-intent part and always wins.
  // The use case fills the remaining budget only when it adds new information —
  // repeating the language already in the accent ("Hindi ... Hindi narration")
  // wastes the characters that matter.
  const identity = `${name} (${genderWord}, ${config.accent}) AI Voice`;
  // Shorter identity that drops the parenthetical accent detail, e.g.
  // "English (United States)" becomes "English". Only used when the full
  // identity would overflow the SERP budget — today that is just the four
  // Multilingual twins, whose names are longer than their Neural twins'.
  const shortIdentity = `${name} (${genderWord}, ${languageLabel}) AI Voice`;
  let useCase = shortUseCase(content.useCases[0] ?? 'video narration');

  /**
   * Skip the use case only when it merely restates the accent already in the
   * title, e.g. "Hindi ... AI Voice for Hindi narration". Compared against the
   * accent rather than the language label, because every en-US voice's language
   * label is "English" and checking that would strip the use case everywhere.
   */
  if (useCase.toLowerCase().includes(config.accent.toLowerCase())) {
    useCase = '';
  }

  // Prefer the full identity with a use case, then the full identity alone,
  // then the short identity — whichever first fits the budget. The short
  // form is the last resort and always fits for the names in this catalogue.
  const titleOptions = useCase
    ? [`${identity} for ${useCase}`, identity, `${shortIdentity} for ${useCase}`, shortIdentity]
    : [identity, shortIdentity];
  const titleBody =
    titleOptions.find((option) => option.length + TITLE_SUFFIX.length <= TITLE_MAX) ?? shortIdentity;
  const title = `${titleBody}${TITLE_SUFFIX}`;

  const accentArticle = /^[aeiou]/i.test(config.accent) ? 'an' : 'a';
  const descriptionRaw =
    `${name} is a ${genderWord.toLowerCase()} ${languageLabel} AI voice with ${accentArticle} ${config.accent} accent, for video voiceovers, e-learning, and narration. Generate speech in Konthora.`;
  /**
   * When the raw description overflows, drop the trailing boilerplate
   * sentence instead of letting clamp() cut words mid-phrase (e.g. Ramona's
   * 157-char raw text would otherwise end on the dangling "Generate speech").
   * All 41 Kokoro descriptions fit unclamped, so this only ever fires for
   * long-accent Edge voices.
   */
  const descriptionSource =
    descriptionRaw.length > DESCRIPTION_MAX
      ? descriptionRaw.replace(/ Generate speech in Konthora\.$/, '')
      : descriptionRaw;
  const description = clamp(descriptionSource, DESCRIPTION_MAX);

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
    related: ['am_adam', 'af_nicole', 'af_bella'],
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
    related: ['af_heart', 'am_michael', 'am_eric'],
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
    related: ['af_heart', 'am_adam', 'af_bella'],
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
    related: ['bm_lewis', 'bf_isabella', 'bm_george'],
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
    related: ['bf_emma', 'bm_daniel', 'bm_george'],
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
    related: ['bm_lewis', 'bf_emma', 'bm_daniel'],
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
    related: ['hm_omega', 'hf_beta', 'hm_psi'],
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
    related: ['hf_alpha', 'hf_beta', 'hm_psi'],
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
    related: ['em_alex', 'em_santa', 'es-AR-ElenaNeural'],
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
    related: ['ef_dora', 'em_santa', 'es-AR-TomasNeural'],
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
    related: ['fr-FR-DeniseNeural', 'fr-FR-EloiseNeural', 'fr-CH-ArianeNeural'],
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
    related: ['im_nicola', 'it-IT-ElsaNeural', 'it-IT-IsabellaNeural'],
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
    related: ['pf_dora', 'pm_santa', 'pt-BR-AntonioNeural'],
    faqs: [
      { question: 'Is Alex a Portuguese voice?', answer: 'Yes. Alex is a male voice speaking Brazilian Portuguese (pt-BR).' },
      { question: 'Which other Portuguese voices exist?', answer: 'The Portuguese set includes Dora (female), Alex (male), and Santa (male).' },
      { question: 'What speed settings does Alex support?', answer: 'Alex supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_bella',
    displayName: 'Bella (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Bella is a female American English voice in the Konthora text-to-speech workspace, part of the full American English set. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended alternative alongside Heart and Nicole.',
    useCases: [
      'American English female narration for videos, ads, and short social clips.',
      'E-learning lessons, presentations, and course audio for North American audiences.',
      'Comparing American English female voices to choose a narrator.',
    ],
    related: ['af_heart', 'af_nicole', 'af_nova'],
    faqs: [
      { question: 'Is Bella an American English voice?', answer: 'Yes. Bella is a female voice speaking American English (en-US).' },
      { question: 'Is Bella recommended in the catalogue?', answer: 'No. Bella is part of the American English set but is not flagged as recommended.' },
      { question: 'What speed settings does Bella support?', answer: 'Bella supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_nova',
    displayName: 'Nova (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Nova is a female American English voice in the Konthora catalogue, an additional US female option beyond the recommended Heart. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, useful when comparing voices or adding a second narrator to a project.',
    useCases: [
      'Second narrator voiceovers for series, interviews, and multi-part content.',
      'Comparing American English female voices before committing to a narrator.',
      'Reading long-form English scripts where a different female US voice is desired.',
    ],
    related: ['af_nicole', 'af_heart', 'am_michael'],
    faqs: [
      { question: 'Is Nova a female voice?', answer: 'Yes, Nova is a female voice speaking American English.' },
      { question: 'Is Nova recommended in the catalogue?', answer: 'No. Nova is part of the American English set but is not flagged as recommended.' },
      { question: 'Does Nova support speed control?', answer: 'Nova supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_michael',
    displayName: 'Michael (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Michael is a male American English voice in the Konthora catalogue, an additional US male option alongside the recommended Adam. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, useful when a second male narrator or a voice comparison is needed.',
    useCases: [
      'Second male narrator for US-accented video, podcast, and ad production.',
      'Comparing male American English voices before choosing a narrator.',
      'Reads training, e-learning, and corporate scripts in US English.',
    ],
    related: ['am_adam', 'af_heart', 'am_eric'],
    faqs: [
      { question: 'Is Michael an American English voice?', answer: 'Yes. Michael is a male voice speaking American English (en-US).' },
      { question: 'Is Michael recommended?', answer: 'No. Michael is available in the American English set but is not marked as recommended.' },
      { question: 'What is Michael\'s speed range?', answer: 'Michael supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_alloy',
    displayName: 'Alloy (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Alloy is a female American English voice in the Konthora catalogue, one of the full American English set. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female option.',
    useCases: [
      'American English narration for explainer and product videos.',
      'E-learning and presentation audio for North American learners.',
      'Voice comparisons across the American English female set.',
    ],
    related: ['af_aoede', 'af_heart', 'af_sky'],
    faqs: [
      { question: 'Is Alloy a female American voice?', answer: 'Yes. Alloy is a female voice speaking American English (en-US).' },
      { question: 'Is Alloy recommended?', answer: 'No. Alloy is part of the American English set and is not flagged as recommended.' },
      { question: 'Does Alloy support speed control?', answer: 'Alloy supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_aoede',
    displayName: 'Aoede (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Aoede is a female American English voice in the Konthora catalogue, part of the full American English set. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female option.',
    useCases: [
      'US English narration for videos, tutorials, and short clips.',
      'Reading scripts aloud to review flow and pacing for English content.',
      'Comparing voices within the American English female set.',
    ],
    related: ['af_alloy', 'af_jessica', 'af_heart'],
    faqs: [
      { question: 'Is Aoede an American English voice?', answer: 'Yes. Aoede is a female voice speaking American English (en-US).' },
      { question: 'Is Aoede recommended?', answer: 'No. Aoede is part of the American English set and is not flagged as recommended.' },
      { question: 'What is Aoede\'s speed range?', answer: 'Aoede supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_jessica',
    displayName: 'Jessica (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Jessica is a female American English voice in the Konthora catalogue, one of the full American voices. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female option in the workspace.',
    useCases: [
      'American English narration for explainer and social videos.',
      'E-learning lessons and training audio for US audiences.',
      'Comparing female American English voices for narration projects.',
    ],
    related: ['af_kore', 'af_alloy', 'af_heart'],
    faqs: [
      { question: 'Is Jessica an American English voice?', answer: 'Yes. Jessica is a female voice speaking American English (en-US).' },
      { question: 'Is Jessica recommended?', answer: 'No. Jessica is part of the American English set and is not flagged as recommended.' },
      { question: 'What speed settings does Jessica support?', answer: 'Jessica supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_kore',
    displayName: 'Kore (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Kore is a female American English voice in the Konthora catalogue, part of the full American English set. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female voice.',
    useCases: [
      'American English narration for video and short-form content.',
      'E-learning and course audio for English-speaking audiences.',
      'Comparing options in the American English female set.',
    ],
    related: ['af_jessica', 'af_heart', 'am_eric'],
    faqs: [
      { question: 'Is Kore an American English voice?', answer: 'Yes. Kore is a female voice speaking American English (en-US).' },
      { question: 'Is Kore recommended?', answer: 'No. Kore is part of the American English set and is not flagged as recommended.' },
      { question: 'Does Kore support speed control?', answer: 'Kore supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_river',
    displayName: 'River (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'River is a female American English voice in the Konthora catalogue, one of the full American English voices. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female option.',
    useCases: [
      'US English narration for videos, ads, and short clips.',
      'E-learning narration and presentation audio for US audiences.',
      'Checking the sound of English scripts before final production.',
    ],
    related: ['af_sky', 'af_heart', 'am_liam'],
    faqs: [
      { question: 'Is River an American English voice?', answer: 'Yes. River is a female voice speaking American English (en-US).' },
      { question: 'Is River recommended?', answer: 'No. River is part of the American English set and is not flagged as recommended.' },
      { question: 'What is River\'s speed range?', answer: 'River supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_sarah',
    displayName: 'Sarah (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Sarah is a female American English voice in the Konthora catalogue, part of the full American English set. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female voice.',
    useCases: [
      'American English narration for video and marketing content.',
      'E-learning and training audio for US learners.',
      'Script reads and voice comparisons in the English workspace.',
    ],
    related: ['af_heart', 'af_jessica', 'af_sky'],
    faqs: [
      { question: 'Is Sarah an American English voice?', answer: 'Yes. Sarah is a female voice speaking American English (en-US).' },
      { question: 'Is Sarah recommended?', answer: 'No. Sarah is part of the American English set and is not flagged as recommended.' },
      { question: 'Does Sarah support speed control?', answer: 'Sarah supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'af_sky',
    displayName: 'Sky (Female)',
    gender: 'female',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Sky is a female American English voice in the Konthora catalogue, one of the full American English voices. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female voice.',
    useCases: [
      'US English narration for short-form video and social clips.',
      'E-learning and presentation audio for North American audiences.',
      'Reviewing English scripts through spoken playback.',
    ],
    related: ['af_river', 'af_heart', 'am_echo'],
    faqs: [
      { question: 'Is Sky an American English voice?', answer: 'Yes. Sky is a female voice speaking American English (en-US).' },
      { question: 'Is Sky recommended?', answer: 'No. Sky is part of the American English set and is not flagged as recommended.' },
      { question: 'What is Sky\'s speed range?', answer: 'Sky supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_echo',
    displayName: 'Echo (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Echo is a male American English voice in the Konthora catalogue, an additional US male option beyond the recommended Adam. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, useful for a second male narrator or voice comparison.',
    useCases: [
      'Second male narrator for US-accented content and series.',
      'Narrating English e-learning and training modules.',
      'Comparing male American English voices for video projects.',
    ],
    related: ['am_eric', 'af_heart', 'am_adam'],
    faqs: [
      { question: 'Is Echo an American English voice?', answer: 'Yes. Echo is a male voice speaking American English (en-US).' },
      { question: 'Is Echo recommended?', answer: 'No. Echo is part of the American English set and is not flagged as recommended.' },
      { question: 'Does Echo support speed control?', answer: 'Echo supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_eric',
    displayName: 'Eric (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Eric is a male American English voice in the Konthora catalogue, part of the full American English set. It reads English at speeds from 0.75× to 1.25× with a default of 1.0× and is available as a non-recommended male voice.',
    useCases: [
      'Male narration for US English videos, ads, and presentations.',
      'E-learning and corporate training audio for English audiences.',
      'Reading scripts aloud to verify tone and timing.',
    ],
    related: ['am_echo', 'af_heart', 'am_michael'],
    faqs: [
      { question: 'Is Eric an American English voice?', answer: 'Yes. Eric is a male voice speaking American English (en-US).' },
      { question: 'Is Eric recommended?', answer: 'No. Eric is part of the American English set and is not flagged as recommended.' },
      { question: 'What is Eric\'s speed range?', answer: 'Eric supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_fenrir',
    displayName: 'Fenrir (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Fenrir is a male American English voice in the Konthora catalogue, one of the full American English voices. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended male voice.',
    useCases: [
      'American male narration for YouTube and long-form content.',
      'Corporate and e-learning audio read in US English.',
      'Reviewing English scripts with spoken playback.',
    ],
    related: ['am_liam', 'am_onyx', 'af_heart'],
    faqs: [
      { question: 'Is Fenrir an American English voice?', answer: 'Yes. Fenrir is a male voice speaking American English (en-US).' },
      { question: 'Is Fenrir recommended?', answer: 'No. Fenrir is part of the American English set and is not flagged as recommended.' },
      { question: 'Does Fenrir support speed control?', answer: 'Fenrir supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_liam',
    displayName: 'Liam (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Liam is a male American English voice in the Konthora catalogue, part of the full American English set. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended male voice.',
    useCases: [
      'US male narration for video, ad, and social content.',
      'E-learning and training audio for English-speaking audiences.',
      'Reviewing English scripts through natural voice playback.',
    ],
    related: ['am_fenrir', 'am_echo', 'af_heart'],
    faqs: [
      { question: 'Is Liam an American English voice?', answer: 'Yes. Liam is a male voice speaking American English (en-US).' },
      { question: 'Is Liam recommended?', answer: 'No. Liam is part of the American English set and is not flagged as recommended.' },
      { question: 'What speed settings does Liam support?', answer: 'Liam supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_onyx',
    displayName: 'Onyx (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Onyx is a male American English voice in the Konthora catalogue, one of the full American English voices. It reads English at speeds from 0.75× to 1.25× with a default of 1.0× and serves as a non-recommended male option.',
    useCases: [
      'American male narration for explainers and presentations.',
      'Podcast and audiobook narration drafts in US English.',
      'Reading English scripts aloud to check pronunciation.',
    ],
    related: ['am_puck', 'am_fenrir', 'am_liam'],
    faqs: [
      { question: 'Is Onyx an American English voice?', answer: 'Yes. Onyx is a male voice speaking American English (en-US).' },
      { question: 'Is Onyx recommended?', answer: 'No. Onyx is part of the American English set and is not flagged as recommended.' },
      { question: 'Does Onyx support speed control?', answer: 'Onyx supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_puck',
    displayName: 'Puck (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Puck is a male American English voice in the Konthora catalogue, part of the full American English set. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended male voice.',
    useCases: [
      'US English narration for video, short-form, and explainer content.',
      'Male e-learning and training voice for American audiences.',
      'Reading scripts and comparing male American English voices.',
    ],
    related: ['am_onyx', 'am_echo', 'af_sky'],
    faqs: [
      { question: 'Is Puck an American English voice?', answer: 'Yes. Puck is a male voice speaking American English (en-US).' },
      { question: 'Is Puck recommended?', answer: 'No. Puck is part of the American English set and is not flagged as recommended.' },
      { question: 'What is Puck\'s speed range?', answer: 'Puck supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'am_santa',
    displayName: 'Santa (Male)',
    gender: 'male',
    accent: 'American English',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Santa is a male American English voice in the Konthora catalogue, one of the full American English voices. It reads standard US English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended male voice.',
    useCases: [
      'American English narration for video and marketing content.',
      'Narrating e-learning and corporate training materials.',
      'Male voice comparison for US English projects.',
    ],
    related: ['am_onyx', 'af_heart', 'am_adam'],
    faqs: [
      { question: 'Is Santa an American English voice?', answer: 'Yes. Santa is a male voice speaking American English (en-US).' },
      { question: 'Is Santa recommended?', answer: 'No. Santa is part of the American English set and is not flagged as recommended.' },
      { question: 'Does Santa support speed control?', answer: 'Santa supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bf_isabella',
    displayName: 'Isabella (Female)',
    gender: 'female',
    accent: 'British English',
    language: 'en-GB',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Isabella is a female British English voice in the Konthora catalogue, part of the full British English set. It reads UK English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female voice.',
    useCases: [
      'British English female narration for video and e-learning.',
      'UK-accented content for European and international audiences.',
      'Second female narrator for series and multi-part projects.',
    ],
    related: ['bf_emma', 'bf_alice', 'bm_george'],
    faqs: [
      { question: 'Is Isabella a British female voice?', answer: 'Yes. Isabella is a female voice speaking British English (en-GB).' },
      { question: 'Is Isabella recommended?', answer: 'No. Isabella is part of the British English set and is not flagged as recommended.' },
      { question: 'What is Isabella\'s speed range?', answer: 'Isabella supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bf_alice',
    displayName: 'Alice (Female)',
    gender: 'female',
    accent: 'British English',
    language: 'en-GB',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Alice is a female British English voice in the Konthora catalogue, one of the full British English voices. It reads UK English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended female voice.',
    useCases: [
      'British English narration for YouTube, e-learning, and docs.',
      'Female UK voice for European and international audiences.',
      'Comparing female British voices for narration projects.',
    ],
    related: ['bf_emma', 'bf_lily', 'bm_daniel'],
    faqs: [
      { question: 'Is Alice a British female voice?', answer: 'Yes. Alice is a female voice speaking British English (en-GB).' },
      { question: 'Is Alice recommended?', answer: 'No. Alice is part of the British English set and is not flagged as recommended.' },
      { question: 'Does Alice support speed control?', answer: 'Alice supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bf_lily',
    displayName: 'Lily (Female)',
    gender: 'female',
    accent: 'British English',
    language: 'en-GB',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Lily is a female British English voice in the Konthora catalogue, part of the full British English set. She reads UK English at a default speed of 1.0× (range 0.75×–1.25×) and is an available non-recommended female voice.',
    useCases: [
      'British English narration and captions for video platforms.',
      'Female second-narrator voice for podcasts and series.',
      'UK English e-learning and student-facing content.',
    ],
    related: ['bf_emma', 'bf_alice', 'bm_fable'],
    faqs: [
      { question: 'Is Lily a British female voice?', answer: 'Yes. Lily is a female voice speaking British English (en-GB).' },
      { question: 'Is Lily recommended?', answer: 'No. Lily is part of the British English set and is not flagged as recommended.' },
      { question: 'What is Lily\'s speed range?', answer: 'Lily supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bm_daniel',
    displayName: 'Daniel (Male)',
    gender: 'male',
    accent: 'British English',
    language: 'en-GB',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Daniel is a male British English voice in the Konthora catalogue, one of the full British English voices. It reads UK English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended male voice.',
    useCases: [
      'British male narration for video, ad, and podcast content.',
      'E-learning and corporate training audio for UK audiences.',
      'Second male narrator for a UK-accented series.',
    ],
    related: ['bm_lewis', 'bm_fable', 'bf_emma'],
    faqs: [
      { question: 'Is Daniel a British male voice?', answer: 'Yes. Daniel is a male voice speaking British English (en-GB).' },
      { question: 'Is Daniel recommended?', answer: 'No. Daniel is part of the British English set and is not flagged as recommended.' },
      { question: 'Does Daniel support speed control?', answer: 'Daniel supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bm_fable',
    displayName: 'Fable (Male)',
    gender: 'male',
    accent: 'British English',
    language: 'en-GB',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Fable is a male British English voice in the Konthora catalogue, part of the full British English set. It reads UK English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended male voice.',
    useCases: [
      'British male narration for audiobooks, stories, and docs.',
      'UK-accented e-learning and podcast drafts.',
      'Comparing male British English voices before production.',
    ],
    related: ['bm_george', 'bm_daniel', 'bf_lily'],
    faqs: [
      { question: 'Is Fable a British male voice?', answer: 'Yes. Fable is a male voice speaking British English (en-GB).' },
      { question: 'Is Fable recommended?', answer: 'No. Fable is part of the British English set and is not flagged as recommended.' },
      { question: 'What is Fable\'s speed range?', answer: 'Fable supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'hf_beta',
    displayName: 'Beta (Female)',
    gender: 'female',
    accent: 'Hindi',
    language: 'hi-IN',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Beta is a female Hindi voice in the Konthora multilingual workspace, one of four native Hindi voices that read Devanagari text. It speaks at a default speed of 1.0× (range 0.75×–1.25×) and is part of the Hindi set alongside Alpha, Omega, and Psi.',
    useCases: [
      'Hindi narration for videos and social content aimed at Indian viewers.',
      'Hindi e-learning audio and course narration.',
      'Reading Hindi scripts aloud to check pronunciation and pacing.',
    ],
    related: ['hf_alpha', 'hm_psi', 'hm_omega'],
    faqs: [
      { question: 'Is Beta a Hindi voice?', answer: 'Yes. Beta is a female voice speaking Hindi (hi-IN).' },
      { question: 'Is Beta recommended?', answer: 'No. Beta is part of the Hindi set and is not specifically recommended.' },
      { question: 'What is Beta\'s speed range?', answer: 'Beta supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'hm_psi',
    displayName: 'Psi (Male)',
    gender: 'male',
    accent: 'Hindi',
    language: 'hi-IN',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Psi is a male Hindi voice in the Konthora catalogue, part of the native Hindi set that reads Devanagari text. It speaks at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended male voice in the Indian workspace.',
    useCases: [
      'Male Hindi narration for videos, podcasts, and online stories.',
      'Hindi e-learning and course audio for learners.',
      'Reading male Hindi scripts aloud for podcast and video drafts.',
    ],
    related: ['hm_omega', 'hf_alpha', 'hf_beta'],
    faqs: [
      { question: 'Is Psi an Indian voice?', answer: 'Yes. Psi is a male voice speaking Hindi (hi-IN).' },
      { question: 'Is Psi recommended?', answer: 'No. Psi is part of the native Hindi set and is not specially flagged as recommended.' },
      { question: 'Does Psi support speed control?', answer: 'Psi supports speed from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'em_santa',
    displayName: 'Santa (Male)',
    gender: 'male',
    accent: 'Spanish',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Santa is a male Spanish voice in the Konthora multilingual workspace, part of the Spanish set alongside Dora and Alex. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a male Spanish voice.',
    useCases: [
      'Spanish male narration for videos, ads, and podcasts.',
      'Spanish e-learning and course audio for Hispanic audiences.',
      'Reading Spanish scripts aloud to review phrasing and clarity.',
    ],
    related: ['em_alex', 'ef_dora', 'es-AR-TomasNeural'],
    faqs: [
      { question: 'Is Santa a Spanish voice?', answer: 'Yes. Santa is a male voice speaking Spanish (es).' },
      { question: 'Is Santa recommended?', answer: 'No. Santa is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Santa support?', answer: 'Santa supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'im_nicola',
    displayName: 'Nicola (Male)',
    gender: 'male',
    accent: 'Italian',
    language: 'it',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Nicola is a male Italian voice in the Konthora catalogue, joined in the Italian set by Sara (female). It reads Italian at a default speed of 1.0× (range 0.75×–1.25×) and is the male option for Italian narration.',
    useCases: [
      'Italian male narration for videos, ads, and e-learning.',
      'Podcast, marketing, and e-learning voiceover in Italian.',
      'Reviewing male Italian scripts through spoken playback.',
    ],
    related: ['if_sara', 'it-IT-GiuseppeMultilingualNeural', 'it-IT-DiegoNeural'],
    faqs: [
      { question: 'Is Nicola an Italian voice?', answer: 'Yes. Nicola is a male voice speaking Italian (it), alongside Sara (female).' },
      { question: 'Is Nicola recommended?', answer: 'No. The Italian set contains Sara and Nicola; neither is marked recommended.' },
      { question: 'What is Nicola\'s speed range?', answer: 'Nicola supports speed from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'pf_dora',
    displayName: 'Dora (Female)',
    gender: 'female',
    accent: 'Portuguese',
    language: 'pt-BR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Dora is a female Brazilian Portuguese voice in the Konthora catalogue, part of the pt-BR set with Alex and Santa. It reads Brazilian Portuguese at a default speed of 1.0× (range 0.75×–1.25×) and is the female voice for Portuguese narration.',
    useCases: [
      'Brazilian Portuguese narration for videos, ads, and e-learning.',
      'Digital audio for e-education and localized marketing content.',
      'Female Portuguese scripts read aloud for review.',
    ],
    related: ['pm_alex', 'pm_santa', 'pt-BR-ThalitaMultilingualNeural'],
    faqs: [
      { question: 'Is Dora a Portuguese voice?', answer: 'Yes. Dora is a female voice speaking Brazilian Portuguese (pt-BR).' },
      { question: 'Is Dora recommended?', answer: 'No. The Portuguese set includes Dora, Alex, and Santa; none is specially recommended.' },
      { question: 'Does Dora support speed control?', answer: 'Dora supports speeds from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'pm_santa',
    displayName: 'Santa (Male)',
    gender: 'male',
    accent: 'Portuguese',
    language: 'pt-BR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
  }, {
    intro: 'Santa is a male Brazilian Portuguese voice in the Konthora catalogue, part of the pt-BR set with Alex and Dora. It reads Brazilian Portuguese at a default speed of 1.0× (range 0.75×–1.25×) and is a native male option for Portuguese content.',
    useCases: [
      'Male Brazilian Portuguese narration for ads and videos.',
      'Portuguese male narration for e-learning, corporate, and media content.',
      'Portuguese scripts read aloud to verify rhythm and pronunciation.',
    ],
    related: ['pm_alex', 'pf_dora', 'pt-BR-AntonioNeural'],
    faqs: [
      { question: 'Is Santa a Portuguese voice?', answer: 'Yes. Santa is a male voice speaking Brazilian Portuguese (pt-BR).' },
      { question: 'Which other Portuguese voices exist?', answer: 'The Portuguese set includes Dora (female), Alex (male), and Santa (male).' },
      { question: 'What speed settings does Santa support?', answer: 'Santa supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bn-BD-NabanitaNeural',
    displayName: 'Nabanita (Female)',
    gender: 'female',
    accent: 'Bangla (Bangladesh)',
    language: 'bn-BD',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Nabanita is a female Bangla (Bangladesh) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads Bengali at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'Bengali narration for videos, ads, and short-form social content.',
      'Bengali e-learning lessons, course narration, and corporate training audio.',
      'Reading Bengali scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['bn-BD-PradeepNeural', 'bn-IN-BashkarNeural', 'bn-IN-TanishaaNeural'],
    faqs: [
      { question: 'Is Nabanita a female Bengali voice?', answer: 'Yes. Nabanita is a female voice with a Bangla (Bangladesh) accent.' },
      { question: 'Is Nabanita recommended in Konthora?', answer: 'Yes. Nabanita is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Nabanita support?', answer: 'Nabanita supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bn-BD-PradeepNeural',
    displayName: 'Pradeep (Male)',
    gender: 'male',
    accent: 'Bangla (Bangladesh)',
    language: 'bn-BD',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Pradeep is a male Bangla (Bangladesh) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads Bengali at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'Bengali narration for videos, ads, and short-form social content.',
      'Bengali e-learning lessons, course narration, and corporate training audio.',
      'Reading Bengali scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['bn-BD-NabanitaNeural', 'bn-IN-BashkarNeural', 'bn-IN-TanishaaNeural'],
    faqs: [
      { question: 'Is Pradeep a male Bengali voice?', answer: 'Yes. Pradeep is a male voice with a Bangla (Bangladesh) accent.' },
      { question: 'Is Pradeep recommended in Konthora?', answer: 'Yes. Pradeep is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Pradeep support?', answer: 'Pradeep supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bn-IN-BashkarNeural',
    displayName: 'Bashkar (Male)',
    gender: 'male',
    accent: 'Bengali (India)',
    language: 'bn-BD',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Bashkar is a male Bengali (India) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads Bengali at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'Bengali narration for videos, ads, and short-form social content.',
      'Bengali e-learning lessons, course narration, and corporate training audio.',
      'Reading Bengali scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['bn-BD-NabanitaNeural', 'bn-BD-PradeepNeural', 'bn-IN-TanishaaNeural'],
    faqs: [
      { question: 'Is Bashkar a male Bengali voice?', answer: 'Yes. Bashkar is a male voice with a Bengali (India) accent.' },
      { question: 'Is Bashkar recommended in Konthora?', answer: 'Yes. Bashkar is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Bashkar support?', answer: 'Bashkar supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'bn-IN-TanishaaNeural',
    displayName: 'Tanishaa (Female)',
    gender: 'female',
    accent: 'Bengali (India)',
    language: 'bn-BD',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Tanishaa is a female Bengali (India) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads Bengali at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'Bengali narration for videos, ads, and short-form social content.',
      'Bengali e-learning lessons, course narration, and corporate training audio.',
      'Reading Bengali scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['bn-BD-NabanitaNeural', 'bn-BD-PradeepNeural', 'bn-IN-BashkarNeural'],
    faqs: [
      { question: 'Is Tanishaa a female Bengali voice?', answer: 'Yes. Tanishaa is a female voice with a Bengali (India) accent.' },
      { question: 'Is Tanishaa recommended in Konthora?', answer: 'Yes. Tanishaa is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Tanishaa support?', answer: 'Tanishaa supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-AvaNeural',
    displayName: 'Ava (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Ava is a female English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AndrewNeural', 'en-US-EmmaNeural', 'en-US-BrianNeural'],
    faqs: [
      { question: 'Is Ava a female English voice?', answer: 'Yes. Ava is a female voice with an English (United States) accent.' },
      { question: 'Is Ava recommended in Konthora?', answer: 'No. Ava is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Ava support?', answer: 'Ava supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-AndrewNeural',
    displayName: 'Andrew (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Andrew is a male English (United States) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads English at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-EmmaNeural', 'en-US-BrianNeural'],
    faqs: [
      { question: 'Is Andrew a male English voice?', answer: 'Yes. Andrew is a male voice with an English (United States) accent.' },
      { question: 'Is Andrew recommended in Konthora?', answer: 'Yes. Andrew is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Andrew support?', answer: 'Andrew supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-EmmaNeural',
    displayName: 'Emma (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Emma is a female English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-BrianNeural'],
    faqs: [
      { question: 'Is Emma a female English voice?', answer: 'Yes. Emma is a female voice with an English (United States) accent.' },
      { question: 'Is Emma recommended in Konthora?', answer: 'No. Emma is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Emma support?', answer: 'Emma supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-BrianNeural',
    displayName: 'Brian (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Brian is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a English (United States) narrator is needed.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Brian a male English voice?', answer: 'Yes. Brian is a male voice with an English (United States) accent.' },
      { question: 'Is Brian recommended in Konthora?', answer: 'No. Brian is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Brian support?', answer: 'Brian supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-AnaNeural',
    displayName: 'Ana (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Ana is a female English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Ana a female English voice?', answer: 'Yes. Ana is a female voice with an English (United States) accent.' },
      { question: 'Is Ana recommended in Konthora?', answer: 'No. Ana is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Ana support?', answer: 'Ana supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-AndrewMultilingualNeural',
    displayName: 'Andrew Multilingual (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Andrew is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a English (United States) narrator is needed.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Andrew a male English voice?', answer: 'Yes. Andrew is a male voice with an English (United States) accent.' },
      { question: 'Is Andrew recommended in Konthora?', answer: 'No. Andrew is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Andrew support?', answer: 'Andrew supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-AriaNeural',
    displayName: 'Aria (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Aria is a female English (United States) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads English at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Aria a female English voice?', answer: 'Yes. Aria is a female voice with an English (United States) accent.' },
      { question: 'Is Aria recommended in Konthora?', answer: 'Yes. Aria is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Aria support?', answer: 'Aria supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-AvaMultilingualNeural',
    displayName: 'Ava Multilingual (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Ava is a female English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a English (United States) narrator is needed.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Ava a female English voice?', answer: 'Yes. Ava is a female voice with an English (United States) accent.' },
      { question: 'Is Ava recommended in Konthora?', answer: 'No. Ava is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Ava support?', answer: 'Ava supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-BrianMultilingualNeural',
    displayName: 'Brian Multilingual (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Brian is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Brian a male English voice?', answer: 'Yes. Brian is a male voice with an English (United States) accent.' },
      { question: 'Is Brian recommended in Konthora?', answer: 'No. Brian is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Brian support?', answer: 'Brian supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-ChristopherNeural',
    displayName: 'Christopher (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Christopher is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a English (United States) narrator is needed.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Christopher a male English voice?', answer: 'Yes. Christopher is a male voice with an English (United States) accent.' },
      { question: 'Is Christopher recommended in Konthora?', answer: 'No. Christopher is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Christopher support?', answer: 'Christopher supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-EmmaMultilingualNeural',
    displayName: 'Emma Multilingual (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Emma is a female English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Emma a female English voice?', answer: 'Yes. Emma is a female voice with an English (United States) accent.' },
      { question: 'Is Emma recommended in Konthora?', answer: 'No. Emma is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Emma support?', answer: 'Emma supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-EricNeural',
    displayName: 'Eric (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Eric is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a English (United States) narrator is needed.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Eric a male English voice?', answer: 'Yes. Eric is a male voice with an English (United States) accent.' },
      { question: 'Is Eric recommended in Konthora?', answer: 'No. Eric is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Eric support?', answer: 'Eric supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-GuyNeural',
    displayName: 'Guy (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Guy is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Guy a male English voice?', answer: 'Yes. Guy is a male voice with an English (United States) accent.' },
      { question: 'Is Guy recommended in Konthora?', answer: 'No. Guy is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Guy support?', answer: 'Guy supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-JennyNeural',
    displayName: 'Jenny (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Jenny is a female English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a English (United States) narrator is needed.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Jenny a female English voice?', answer: 'Yes. Jenny is a female voice with an English (United States) accent.' },
      { question: 'Is Jenny recommended in Konthora?', answer: 'No. Jenny is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Jenny support?', answer: 'Jenny supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-MichelleNeural',
    displayName: 'Michelle (Female)',
    gender: 'female',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Michelle is a female English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Michelle a female English voice?', answer: 'Yes. Michelle is a female voice with an English (United States) accent.' },
      { question: 'Is Michelle recommended in Konthora?', answer: 'No. Michelle is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Michelle support?', answer: 'Michelle supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-RogerNeural',
    displayName: 'Roger (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Roger is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a English (United States) narrator is needed.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Roger a male English voice?', answer: 'Yes. Roger is a male voice with an English (United States) accent.' },
      { question: 'Is Roger recommended in Konthora?', answer: 'No. Roger is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Roger support?', answer: 'Roger supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'en-US-SteffanNeural',
    displayName: 'Steffan (Male)',
    gender: 'male',
    accent: 'English (United States)',
    language: 'en-US',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Steffan is a male English (United States) voice in the Konthora catalogue, served by the Edge engine. It reads English at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'English narration for videos, ads, and short-form social content.',
      'English e-learning lessons, course narration, and corporate training audio.',
      'Reading English scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural'],
    faqs: [
      { question: 'Is Steffan a male English voice?', answer: 'Yes. Steffan is a male voice with an English (United States) accent.' },
      { question: 'Is Steffan recommended in Konthora?', answer: 'No. Steffan is part of the English set but is not flagged as recommended.' },
      { question: 'What speed settings does Steffan support?', answer: 'Steffan supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-BE-CharlineNeural',
    displayName: 'Charline (Female)',
    gender: 'female',
    accent: 'French (Belgium)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Charline is a female French (Belgium) voice in the Konthora catalogue, served by the Edge engine. It reads French at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a French (Belgium) narrator is needed.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-GerardNeural', 'fr-CA-ThierryNeural', 'fr-CA-AntoineNeural'],
    faqs: [
      { question: 'Is Charline a female French voice?', answer: 'Yes. Charline is a female voice with a French (Belgium) accent.' },
      { question: 'Is Charline recommended in Konthora?', answer: 'No. Charline is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Charline support?', answer: 'Charline supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-BE-GerardNeural',
    displayName: 'Gerard (Male)',
    gender: 'male',
    accent: 'French (Belgium)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Gerard is a male French (Belgium) voice in the Konthora catalogue, served by the Edge engine. It reads French at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-CA-ThierryNeural', 'fr-CA-AntoineNeural'],
    faqs: [
      { question: 'Is Gerard a male French voice?', answer: 'Yes. Gerard is a male voice with a French (Belgium) accent.' },
      { question: 'Is Gerard recommended in Konthora?', answer: 'No. Gerard is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Gerard support?', answer: 'Gerard supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-CA-ThierryNeural',
    displayName: 'Thierry (Male)',
    gender: 'male',
    accent: 'French (Canada)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Thierry is a male French (Canada) voice in the Konthora catalogue, served by the Edge engine. It reads French at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a French (Canada) narrator is needed.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-AntoineNeural'],
    faqs: [
      { question: 'Is Thierry a male French voice?', answer: 'Yes. Thierry is a male voice with a French (Canada) accent.' },
      { question: 'Is Thierry recommended in Konthora?', answer: 'No. Thierry is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Thierry support?', answer: 'Thierry supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-CA-AntoineNeural',
    displayName: 'Antoine (Male)',
    gender: 'male',
    accent: 'French (Canada)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Antoine is a male French (Canada) voice in the Konthora catalogue, served by the Edge engine. It reads French at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Antoine a male French voice?', answer: 'Yes. Antoine is a male voice with a French (Canada) accent.' },
      { question: 'Is Antoine recommended in Konthora?', answer: 'No. Antoine is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Antoine support?', answer: 'Antoine supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-CA-JeanNeural',
    displayName: 'Jean (Male)',
    gender: 'male',
    accent: 'French (Canada)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Jean is a male French (Canada) voice in the Konthora catalogue, served by the Edge engine. It reads French at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a French (Canada) narrator is needed.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Jean a male French voice?', answer: 'Yes. Jean is a male voice with a French (Canada) accent.' },
      { question: 'Is Jean recommended in Konthora?', answer: 'No. Jean is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Jean support?', answer: 'Jean supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-CA-SylvieNeural',
    displayName: 'Sylvie (Female)',
    gender: 'female',
    accent: 'French (Canada)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Sylvie is a female French (Canada) voice in the Konthora catalogue, served by the Edge engine. It reads French at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Sylvie a female French voice?', answer: 'Yes. Sylvie is a female voice with a French (Canada) accent.' },
      { question: 'Is Sylvie recommended in Konthora?', answer: 'No. Sylvie is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Sylvie support?', answer: 'Sylvie supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-FR-VivienneMultilingualNeural',
    displayName: 'Vivienne (Female)',
    gender: 'female',
    accent: 'French (France)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Vivienne is a female French (France) voice in the Konthora catalogue, served by the Edge engine. It reads French at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a French (France) narrator is needed.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Vivienne a female French voice?', answer: 'Yes. Vivienne is a female voice with a French (France) accent.' },
      { question: 'Is Vivienne recommended in Konthora?', answer: 'No. Vivienne is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Vivienne support?', answer: 'Vivienne supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-FR-RemyMultilingualNeural',
    displayName: 'Remy (Male)',
    gender: 'male',
    accent: 'French (France)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Remy is a male French (France) voice in the Konthora catalogue, served by the Edge engine. It reads French at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Remy a male French voice?', answer: 'Yes. Remy is a male voice with a French (France) accent.' },
      { question: 'Is Remy recommended in Konthora?', answer: 'No. Remy is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Remy support?', answer: 'Remy supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-FR-DeniseNeural',
    displayName: 'Denise (Female)',
    gender: 'female',
    accent: 'French (France)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Denise is a female French (France) voice in the Konthora catalogue, served by the Edge engine. It reads French at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a French (France) narrator is needed.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Denise a female French voice?', answer: 'Yes. Denise is a female voice with a French (France) accent.' },
      { question: 'Is Denise recommended in Konthora?', answer: 'No. Denise is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Denise support?', answer: 'Denise supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-FR-EloiseNeural',
    displayName: 'Eloise (Female)',
    gender: 'female',
    accent: 'French (France)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Eloise is a female French (France) voice in the Konthora catalogue, served by the Edge engine. It reads French at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Eloise a female French voice?', answer: 'Yes. Eloise is a female voice with a French (France) accent.' },
      { question: 'Is Eloise recommended in Konthora?', answer: 'No. Eloise is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Eloise support?', answer: 'Eloise supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-FR-HenriNeural',
    displayName: 'Henri (Male)',
    gender: 'male',
    accent: 'French (France)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Henri is a male French (France) voice in the Konthora catalogue, served by the Edge engine. It reads French at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a French (France) narrator is needed.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Henri a male French voice?', answer: 'Yes. Henri is a male voice with a French (France) accent.' },
      { question: 'Is Henri recommended in Konthora?', answer: 'No. Henri is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Henri support?', answer: 'Henri supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-CH-ArianeNeural',
    displayName: 'Ariane (Female)',
    gender: 'female',
    accent: 'French (Switzerland)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Ariane is a female French (Switzerland) voice in the Konthora catalogue, served by the Edge engine. It reads French at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Ariane a female French voice?', answer: 'Yes. Ariane is a female voice with a French (Switzerland) accent.' },
      { question: 'Is Ariane recommended in Konthora?', answer: 'No. Ariane is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Ariane support?', answer: 'Ariane supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'fr-CH-FabriceNeural',
    displayName: 'Fabrice (Male)',
    gender: 'male',
    accent: 'French (Switzerland)',
    language: 'fr-FR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Fabrice is a male French (Switzerland) voice in the Konthora catalogue, served by the Edge engine. It reads French at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a French (Switzerland) narrator is needed.',
    useCases: [
      'French narration for videos, ads, and short-form social content.',
      'French e-learning lessons, course narration, and corporate training audio.',
      'Reading French scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['fr-BE-CharlineNeural', 'fr-BE-GerardNeural', 'fr-CA-ThierryNeural'],
    faqs: [
      { question: 'Is Fabrice a male French voice?', answer: 'Yes. Fabrice is a male voice with a French (Switzerland) accent.' },
      { question: 'Is Fabrice recommended in Konthora?', answer: 'No. Fabrice is part of the French set but is not flagged as recommended.' },
      { question: 'What speed settings does Fabrice support?', answer: 'Fabrice supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'hi-IN-MadhurNeural',
    displayName: 'Madhur (Male)',
    gender: 'male',
    accent: 'Hindi (India)',
    language: 'hi-IN',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Madhur is a male Hindi (India) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads Hindi at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'Hindi narration for videos, ads, and short-form social content.',
      'Hindi e-learning lessons, course narration, and corporate training audio.',
      'Reading Hindi scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['hi-IN-SwaraNeural'],
    faqs: [
      { question: 'Is Madhur a male Hindi voice?', answer: 'Yes. Madhur is a male voice with a Hindi (India) accent.' },
      { question: 'Is Madhur recommended in Konthora?', answer: 'Yes. Madhur is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Madhur support?', answer: 'Madhur supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'hi-IN-SwaraNeural',
    displayName: 'Swara (Female)',
    gender: 'female',
    accent: 'Hindi (India)',
    language: 'hi-IN',
    recommended: true,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Swara is a female Hindi (India) voice in the Konthora catalogue, served by the Edge engine, and is marked as recommended in the voice picker. It reads Hindi at a default speed of 1.0× (range 0.75×–1.25×).',
    useCases: [
      'Hindi narration for videos, ads, and short-form social content.',
      'Hindi e-learning lessons, course narration, and corporate training audio.',
      'Reading Hindi scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['hi-IN-MadhurNeural'],
    faqs: [
      { question: 'Is Swara a female Hindi voice?', answer: 'Yes. Swara is a female voice with a Hindi (India) accent.' },
      { question: 'Is Swara recommended in Konthora?', answer: 'Yes. Swara is flagged as recommended in the Konthora voice catalogue.' },
      { question: 'What speed settings does Swara support?', answer: 'Swara supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'it-IT-GiuseppeMultilingualNeural',
    displayName: 'Giuseppe (Male)',
    gender: 'male',
    accent: 'Italian (Italy)',
    language: 'it',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Giuseppe is a male Italian (Italy) voice in the Konthora catalogue, served by the Edge engine. It reads Italian at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Italian narration for videos, ads, and short-form social content.',
      'Italian e-learning lessons, course narration, and corporate training audio.',
      'Reading Italian scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['it-IT-DiegoNeural', 'it-IT-ElsaNeural', 'it-IT-IsabellaNeural'],
    faqs: [
      { question: 'Is Giuseppe a male Italian voice?', answer: 'Yes. Giuseppe is a male voice with an Italian (Italy) accent.' },
      { question: 'Is Giuseppe recommended in Konthora?', answer: 'No. Giuseppe is part of the Italian set but is not flagged as recommended.' },
      { question: 'What speed settings does Giuseppe support?', answer: 'Giuseppe supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'it-IT-DiegoNeural',
    displayName: 'Diego (Male)',
    gender: 'male',
    accent: 'Italian (Italy)',
    language: 'it',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Diego is a male Italian (Italy) voice in the Konthora catalogue, served by the Edge engine. It reads Italian at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Italian (Italy) narrator is needed.',
    useCases: [
      'Italian narration for videos, ads, and short-form social content.',
      'Italian e-learning lessons, course narration, and corporate training audio.',
      'Reading Italian scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['it-IT-GiuseppeMultilingualNeural', 'it-IT-ElsaNeural', 'it-IT-IsabellaNeural'],
    faqs: [
      { question: 'Is Diego a male Italian voice?', answer: 'Yes. Diego is a male voice with an Italian (Italy) accent.' },
      { question: 'Is Diego recommended in Konthora?', answer: 'No. Diego is part of the Italian set but is not flagged as recommended.' },
      { question: 'What speed settings does Diego support?', answer: 'Diego supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'it-IT-ElsaNeural',
    displayName: 'Elsa (Female)',
    gender: 'female',
    accent: 'Italian (Italy)',
    language: 'it',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Elsa is a female Italian (Italy) voice in the Konthora catalogue, served by the Edge engine. It reads Italian at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Italian narration for videos, ads, and short-form social content.',
      'Italian e-learning lessons, course narration, and corporate training audio.',
      'Reading Italian scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['it-IT-GiuseppeMultilingualNeural', 'it-IT-DiegoNeural', 'it-IT-IsabellaNeural'],
    faqs: [
      { question: 'Is Elsa a female Italian voice?', answer: 'Yes. Elsa is a female voice with an Italian (Italy) accent.' },
      { question: 'Is Elsa recommended in Konthora?', answer: 'No. Elsa is part of the Italian set but is not flagged as recommended.' },
      { question: 'What speed settings does Elsa support?', answer: 'Elsa supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'it-IT-IsabellaNeural',
    displayName: 'Isabella (Female)',
    gender: 'female',
    accent: 'Italian (Italy)',
    language: 'it',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Isabella is a female Italian (Italy) voice in the Konthora catalogue, served by the Edge engine. It reads Italian at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Italian (Italy) narrator is needed.',
    useCases: [
      'Italian narration for videos, ads, and short-form social content.',
      'Italian e-learning lessons, course narration, and corporate training audio.',
      'Reading Italian scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['it-IT-GiuseppeMultilingualNeural', 'it-IT-DiegoNeural', 'it-IT-ElsaNeural'],
    faqs: [
      { question: 'Is Isabella a female Italian voice?', answer: 'Yes. Isabella is a female voice with an Italian (Italy) accent.' },
      { question: 'Is Isabella recommended in Konthora?', answer: 'No. Isabella is part of the Italian set but is not flagged as recommended.' },
      { question: 'What speed settings does Isabella support?', answer: 'Isabella supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'pt-BR-ThalitaMultilingualNeural',
    displayName: 'Thalita (Female)',
    gender: 'female',
    accent: 'Portuguese (Brazil)',
    language: 'pt-BR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Thalita is a female Portuguese (Brazil) voice in the Konthora catalogue, served by the Edge engine. It reads Portuguese at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Portuguese narration for videos, ads, and short-form social content.',
      'Portuguese e-learning lessons, course narration, and corporate training audio.',
      'Reading Portuguese scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['pt-BR-AntonioNeural', 'pt-BR-FranciscaNeural'],
    faqs: [
      { question: 'Is Thalita a female Portuguese voice?', answer: 'Yes. Thalita is a female voice with a Portuguese (Brazil) accent.' },
      { question: 'Is Thalita recommended in Konthora?', answer: 'No. Thalita is part of the Portuguese set but is not flagged as recommended.' },
      { question: 'What speed settings does Thalita support?', answer: 'Thalita supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'pt-BR-AntonioNeural',
    displayName: 'Antonio (Male)',
    gender: 'male',
    accent: 'Portuguese (Brazil)',
    language: 'pt-BR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Antonio is a male Portuguese (Brazil) voice in the Konthora catalogue, served by the Edge engine. It reads Portuguese at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Portuguese (Brazil) narrator is needed.',
    useCases: [
      'Portuguese narration for videos, ads, and short-form social content.',
      'Portuguese e-learning lessons, course narration, and corporate training audio.',
      'Reading Portuguese scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['pt-BR-ThalitaMultilingualNeural', 'pt-BR-FranciscaNeural'],
    faqs: [
      { question: 'Is Antonio a male Portuguese voice?', answer: 'Yes. Antonio is a male voice with a Portuguese (Brazil) accent.' },
      { question: 'Is Antonio recommended in Konthora?', answer: 'No. Antonio is part of the Portuguese set but is not flagged as recommended.' },
      { question: 'What speed settings does Antonio support?', answer: 'Antonio supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'pt-BR-FranciscaNeural',
    displayName: 'Francisca (Female)',
    gender: 'female',
    accent: 'Portuguese (Brazil)',
    language: 'pt-BR',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Francisca is a female Portuguese (Brazil) voice in the Konthora catalogue, served by the Edge engine. It reads Portuguese at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Portuguese narration for videos, ads, and short-form social content.',
      'Portuguese e-learning lessons, course narration, and corporate training audio.',
      'Reading Portuguese scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['pt-BR-ThalitaMultilingualNeural', 'pt-BR-AntonioNeural'],
    faqs: [
      { question: 'Is Francisca a female Portuguese voice?', answer: 'Yes. Francisca is a female voice with a Portuguese (Brazil) accent.' },
      { question: 'Is Francisca recommended in Konthora?', answer: 'No. Francisca is part of the Portuguese set but is not flagged as recommended.' },
      { question: 'What speed settings does Francisca support?', answer: 'Francisca supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-AR-ElenaNeural',
    displayName: 'Elena (Female)',
    gender: 'female',
    accent: 'Spanish (Argentina)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Elena is a female Spanish (Argentina) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Argentina) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-TomasNeural', 'es-BO-MarceloNeural', 'es-BO-SofiaNeural'],
    faqs: [
      { question: 'Is Elena a female Spanish voice?', answer: 'Yes. Elena is a female voice with a Spanish (Argentina) accent.' },
      { question: 'Is Elena recommended in Konthora?', answer: 'No. Elena is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Elena support?', answer: 'Elena supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-AR-TomasNeural',
    displayName: 'Tomas (Male)',
    gender: 'male',
    accent: 'Spanish (Argentina)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Tomas is a male Spanish (Argentina) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-BO-MarceloNeural', 'es-BO-SofiaNeural'],
    faqs: [
      { question: 'Is Tomas a male Spanish voice?', answer: 'Yes. Tomas is a male voice with a Spanish (Argentina) accent.' },
      { question: 'Is Tomas recommended in Konthora?', answer: 'No. Tomas is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Tomas support?', answer: 'Tomas supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-BO-MarceloNeural',
    displayName: 'Marcelo (Male)',
    gender: 'male',
    accent: 'Spanish (Bolivia)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Marcelo is a male Spanish (Bolivia) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Bolivia) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-SofiaNeural'],
    faqs: [
      { question: 'Is Marcelo a male Spanish voice?', answer: 'Yes. Marcelo is a male voice with a Spanish (Bolivia) accent.' },
      { question: 'Is Marcelo recommended in Konthora?', answer: 'No. Marcelo is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Marcelo support?', answer: 'Marcelo supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-BO-SofiaNeural',
    displayName: 'Sofia (Female)',
    gender: 'female',
    accent: 'Spanish (Bolivia)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Sofia is a female Spanish (Bolivia) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Sofia a female Spanish voice?', answer: 'Yes. Sofia is a female voice with a Spanish (Bolivia) accent.' },
      { question: 'Is Sofia recommended in Konthora?', answer: 'No. Sofia is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Sofia support?', answer: 'Sofia supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CL-CatalinaNeural',
    displayName: 'Catalina (Female)',
    gender: 'female',
    accent: 'Spanish (Chile)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Catalina is a female Spanish (Chile) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Chile) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Catalina a female Spanish voice?', answer: 'Yes. Catalina is a female voice with a Spanish (Chile) accent.' },
      { question: 'Is Catalina recommended in Konthora?', answer: 'No. Catalina is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Catalina support?', answer: 'Catalina supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CL-LorenzoNeural',
    displayName: 'Lorenzo (Male)',
    gender: 'male',
    accent: 'Spanish (Chile)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Lorenzo is a male Spanish (Chile) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Lorenzo a male Spanish voice?', answer: 'Yes. Lorenzo is a male voice with a Spanish (Chile) accent.' },
      { question: 'Is Lorenzo recommended in Konthora?', answer: 'No. Lorenzo is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Lorenzo support?', answer: 'Lorenzo supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-ES-XimenaNeural',
    displayName: 'Ximena (Female)',
    gender: 'female',
    accent: 'Spanish (Spain)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Ximena is a female Spanish (Spain) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Spain) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Ximena a female Spanish voice?', answer: 'Yes. Ximena is a female voice with a Spanish (Spain) accent.' },
      { question: 'Is Ximena recommended in Konthora?', answer: 'No. Ximena is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Ximena support?', answer: 'Ximena supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CO-GonzaloNeural',
    displayName: 'Gonzalo (Male)',
    gender: 'male',
    accent: 'Spanish (Colombia)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Gonzalo is a male Spanish (Colombia) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Gonzalo a male Spanish voice?', answer: 'Yes. Gonzalo is a male voice with a Spanish (Colombia) accent.' },
      { question: 'Is Gonzalo recommended in Konthora?', answer: 'No. Gonzalo is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Gonzalo support?', answer: 'Gonzalo supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CO-SalomeNeural',
    displayName: 'Salome (Female)',
    gender: 'female',
    accent: 'Spanish (Colombia)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Salome is a female Spanish (Colombia) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Colombia) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Salome a female Spanish voice?', answer: 'Yes. Salome is a female voice with a Spanish (Colombia) accent.' },
      { question: 'Is Salome recommended in Konthora?', answer: 'No. Salome is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Salome support?', answer: 'Salome supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CR-JuanNeural',
    displayName: 'Juan (Male)',
    gender: 'male',
    accent: 'Spanish (Costa Rica)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Juan is a male Spanish (Costa Rica) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Juan a male Spanish voice?', answer: 'Yes. Juan is a male voice with a Spanish (Costa Rica) accent.' },
      { question: 'Is Juan recommended in Konthora?', answer: 'No. Juan is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Juan support?', answer: 'Juan supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CR-MariaNeural',
    displayName: 'Maria (Female)',
    gender: 'female',
    accent: 'Spanish (Costa Rica)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Maria is a female Spanish (Costa Rica) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Costa Rica) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Maria a female Spanish voice?', answer: 'Yes. Maria is a female voice with a Spanish (Costa Rica) accent.' },
      { question: 'Is Maria recommended in Konthora?', answer: 'No. Maria is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Maria support?', answer: 'Maria supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CU-BelkysNeural',
    displayName: 'Belkys (Female)',
    gender: 'female',
    accent: 'Spanish (Cuba)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Belkys is a female Spanish (Cuba) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Belkys a female Spanish voice?', answer: 'Yes. Belkys is a female voice with a Spanish (Cuba) accent.' },
      { question: 'Is Belkys recommended in Konthora?', answer: 'No. Belkys is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Belkys support?', answer: 'Belkys supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-CU-ManuelNeural',
    displayName: 'Manuel (Male)',
    gender: 'male',
    accent: 'Spanish (Cuba)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Manuel is a male Spanish (Cuba) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Cuba) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Manuel a male Spanish voice?', answer: 'Yes. Manuel is a male voice with a Spanish (Cuba) accent.' },
      { question: 'Is Manuel recommended in Konthora?', answer: 'No. Manuel is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Manuel support?', answer: 'Manuel supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-DO-EmilioNeural',
    displayName: 'Emilio (Male)',
    gender: 'male',
    accent: 'Spanish (Dominican Republic)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Emilio is a male Spanish (Dominican Republic) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Emilio a male Spanish voice?', answer: 'Yes. Emilio is a male voice with a Spanish (Dominican Republic) accent.' },
      { question: 'Is Emilio recommended in Konthora?', answer: 'No. Emilio is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Emilio support?', answer: 'Emilio supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-DO-RamonaNeural',
    displayName: 'Ramona (Female)',
    gender: 'female',
    accent: 'Spanish (Dominican Republic)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Ramona is a female Spanish (Dominican Republic) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Dominican Republic) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Ramona a female Spanish voice?', answer: 'Yes. Ramona is a female voice with a Spanish (Dominican Republic) accent.' },
      { question: 'Is Ramona recommended in Konthora?', answer: 'No. Ramona is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Ramona support?', answer: 'Ramona supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-EC-AndreaNeural',
    displayName: 'Andrea (Female)',
    gender: 'female',
    accent: 'Spanish (Ecuador)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Andrea is a female Spanish (Ecuador) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Andrea a female Spanish voice?', answer: 'Yes. Andrea is a female voice with a Spanish (Ecuador) accent.' },
      { question: 'Is Andrea recommended in Konthora?', answer: 'No. Andrea is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Andrea support?', answer: 'Andrea supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-EC-LuisNeural',
    displayName: 'Luis (Male)',
    gender: 'male',
    accent: 'Spanish (Ecuador)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Luis is a male Spanish (Ecuador) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Ecuador) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Luis a male Spanish voice?', answer: 'Yes. Luis is a male voice with a Spanish (Ecuador) accent.' },
      { question: 'Is Luis recommended in Konthora?', answer: 'No. Luis is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Luis support?', answer: 'Luis supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-SV-LorenaNeural',
    displayName: 'Lorena (Female)',
    gender: 'female',
    accent: 'Spanish (El Salvador)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Lorena is a female Spanish (El Salvador) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Lorena a female Spanish voice?', answer: 'Yes. Lorena is a female voice with a Spanish (El Salvador) accent.' },
      { question: 'Is Lorena recommended in Konthora?', answer: 'No. Lorena is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Lorena support?', answer: 'Lorena supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-SV-RodrigoNeural',
    displayName: 'Rodrigo (Male)',
    gender: 'male',
    accent: 'Spanish (El Salvador)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Rodrigo is a male Spanish (El Salvador) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (El Salvador) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Rodrigo a male Spanish voice?', answer: 'Yes. Rodrigo is a male voice with a Spanish (El Salvador) accent.' },
      { question: 'Is Rodrigo recommended in Konthora?', answer: 'No. Rodrigo is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Rodrigo support?', answer: 'Rodrigo supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-GQ-JavierNeural',
    displayName: 'Javier (Male)',
    gender: 'male',
    accent: 'Spanish (Equatorial Guinea)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Javier is a male Spanish (Equatorial Guinea) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Javier a male Spanish voice?', answer: 'Yes. Javier is a male voice with a Spanish (Equatorial Guinea) accent.' },
      { question: 'Is Javier recommended in Konthora?', answer: 'No. Javier is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Javier support?', answer: 'Javier supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-GQ-TeresaNeural',
    displayName: 'Teresa (Female)',
    gender: 'female',
    accent: 'Spanish (Equatorial Guinea)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Teresa is a female Spanish (Equatorial Guinea) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Equatorial Guinea) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Teresa a female Spanish voice?', answer: 'Yes. Teresa is a female voice with a Spanish (Equatorial Guinea) accent.' },
      { question: 'Is Teresa recommended in Konthora?', answer: 'No. Teresa is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Teresa support?', answer: 'Teresa supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-GT-AndresNeural',
    displayName: 'Andres (Male)',
    gender: 'male',
    accent: 'Spanish (Guatemala)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Andres is a male Spanish (Guatemala) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Andres a male Spanish voice?', answer: 'Yes. Andres is a male voice with a Spanish (Guatemala) accent.' },
      { question: 'Is Andres recommended in Konthora?', answer: 'No. Andres is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Andres support?', answer: 'Andres supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-GT-MartaNeural',
    displayName: 'Marta (Female)',
    gender: 'female',
    accent: 'Spanish (Guatemala)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Marta is a female Spanish (Guatemala) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Guatemala) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Marta a female Spanish voice?', answer: 'Yes. Marta is a female voice with a Spanish (Guatemala) accent.' },
      { question: 'Is Marta recommended in Konthora?', answer: 'No. Marta is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Marta support?', answer: 'Marta supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-HN-CarlosNeural',
    displayName: 'Carlos (Male)',
    gender: 'male',
    accent: 'Spanish (Honduras)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Carlos is a male Spanish (Honduras) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Carlos a male Spanish voice?', answer: 'Yes. Carlos is a male voice with a Spanish (Honduras) accent.' },
      { question: 'Is Carlos recommended in Konthora?', answer: 'No. Carlos is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Carlos support?', answer: 'Carlos supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-HN-KarlaNeural',
    displayName: 'Karla (Female)',
    gender: 'female',
    accent: 'Spanish (Honduras)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Karla is a female Spanish (Honduras) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Honduras) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Karla a female Spanish voice?', answer: 'Yes. Karla is a female voice with a Spanish (Honduras) accent.' },
      { question: 'Is Karla recommended in Konthora?', answer: 'No. Karla is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Karla support?', answer: 'Karla supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-MX-DaliaNeural',
    displayName: 'Dalia (Female)',
    gender: 'female',
    accent: 'Spanish (Mexico)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Dalia is a female Spanish (Mexico) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Dalia a female Spanish voice?', answer: 'Yes. Dalia is a female voice with a Spanish (Mexico) accent.' },
      { question: 'Is Dalia recommended in Konthora?', answer: 'No. Dalia is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Dalia support?', answer: 'Dalia supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-MX-JorgeNeural',
    displayName: 'Jorge (Male)',
    gender: 'male',
    accent: 'Spanish (Mexico)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Jorge is a male Spanish (Mexico) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Mexico) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Jorge a male Spanish voice?', answer: 'Yes. Jorge is a male voice with a Spanish (Mexico) accent.' },
      { question: 'Is Jorge recommended in Konthora?', answer: 'No. Jorge is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Jorge support?', answer: 'Jorge supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-NI-FedericoNeural',
    displayName: 'Federico (Male)',
    gender: 'male',
    accent: 'Spanish (Nicaragua)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Federico is a male Spanish (Nicaragua) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Federico a male Spanish voice?', answer: 'Yes. Federico is a male voice with a Spanish (Nicaragua) accent.' },
      { question: 'Is Federico recommended in Konthora?', answer: 'No. Federico is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Federico support?', answer: 'Federico supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-NI-YolandaNeural',
    displayName: 'Yolanda (Female)',
    gender: 'female',
    accent: 'Spanish (Nicaragua)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Yolanda is a female Spanish (Nicaragua) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Nicaragua) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Yolanda a female Spanish voice?', answer: 'Yes. Yolanda is a female voice with a Spanish (Nicaragua) accent.' },
      { question: 'Is Yolanda recommended in Konthora?', answer: 'No. Yolanda is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Yolanda support?', answer: 'Yolanda supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PA-MargaritaNeural',
    displayName: 'Margarita (Female)',
    gender: 'female',
    accent: 'Spanish (Panama)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Margarita is a female Spanish (Panama) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Margarita a female Spanish voice?', answer: 'Yes. Margarita is a female voice with a Spanish (Panama) accent.' },
      { question: 'Is Margarita recommended in Konthora?', answer: 'No. Margarita is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Margarita support?', answer: 'Margarita supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PA-RobertoNeural',
    displayName: 'Roberto (Male)',
    gender: 'male',
    accent: 'Spanish (Panama)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Roberto is a male Spanish (Panama) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Panama) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Roberto a male Spanish voice?', answer: 'Yes. Roberto is a male voice with a Spanish (Panama) accent.' },
      { question: 'Is Roberto recommended in Konthora?', answer: 'No. Roberto is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Roberto support?', answer: 'Roberto supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PY-MarioNeural',
    displayName: 'Mario (Male)',
    gender: 'male',
    accent: 'Spanish (Paraguay)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Mario is a male Spanish (Paraguay) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Mario a male Spanish voice?', answer: 'Yes. Mario is a male voice with a Spanish (Paraguay) accent.' },
      { question: 'Is Mario recommended in Konthora?', answer: 'No. Mario is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Mario support?', answer: 'Mario supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PY-TaniaNeural',
    displayName: 'Tania (Female)',
    gender: 'female',
    accent: 'Spanish (Paraguay)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Tania is a female Spanish (Paraguay) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Paraguay) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Tania a female Spanish voice?', answer: 'Yes. Tania is a female voice with a Spanish (Paraguay) accent.' },
      { question: 'Is Tania recommended in Konthora?', answer: 'No. Tania is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Tania support?', answer: 'Tania supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PE-AlexNeural',
    displayName: 'Alex (Male)',
    gender: 'male',
    accent: 'Spanish (Peru)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Alex is a male Spanish (Peru) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Alex a male Spanish voice?', answer: 'Yes. Alex is a male voice with a Spanish (Peru) accent.' },
      { question: 'Is Alex recommended in Konthora?', answer: 'No. Alex is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Alex support?', answer: 'Alex supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PE-CamilaNeural',
    displayName: 'Camila (Female)',
    gender: 'female',
    accent: 'Spanish (Peru)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Camila is a female Spanish (Peru) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Peru) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Camila a female Spanish voice?', answer: 'Yes. Camila is a female voice with a Spanish (Peru) accent.' },
      { question: 'Is Camila recommended in Konthora?', answer: 'No. Camila is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Camila support?', answer: 'Camila supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PR-KarinaNeural',
    displayName: 'Karina (Female)',
    gender: 'female',
    accent: 'Spanish (Puerto Rico)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Karina is a female Spanish (Puerto Rico) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Karina a female Spanish voice?', answer: 'Yes. Karina is a female voice with a Spanish (Puerto Rico) accent.' },
      { question: 'Is Karina recommended in Konthora?', answer: 'No. Karina is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Karina support?', answer: 'Karina supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-PR-VictorNeural',
    displayName: 'Victor (Male)',
    gender: 'male',
    accent: 'Spanish (Puerto Rico)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Victor is a male Spanish (Puerto Rico) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Puerto Rico) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Victor a male Spanish voice?', answer: 'Yes. Victor is a male voice with a Spanish (Puerto Rico) accent.' },
      { question: 'Is Victor recommended in Konthora?', answer: 'No. Victor is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Victor support?', answer: 'Victor supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-ES-AlvaroNeural',
    displayName: 'Alvaro (Male)',
    gender: 'male',
    accent: 'Spanish (Spain)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Alvaro is a male Spanish (Spain) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Alvaro a male Spanish voice?', answer: 'Yes. Alvaro is a male voice with a Spanish (Spain) accent.' },
      { question: 'Is Alvaro recommended in Konthora?', answer: 'No. Alvaro is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Alvaro support?', answer: 'Alvaro supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-ES-ElviraNeural',
    displayName: 'Elvira (Female)',
    gender: 'female',
    accent: 'Spanish (Spain)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Elvira is a female Spanish (Spain) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Spain) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Elvira a female Spanish voice?', answer: 'Yes. Elvira is a female voice with a Spanish (Spain) accent.' },
      { question: 'Is Elvira recommended in Konthora?', answer: 'No. Elvira is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Elvira support?', answer: 'Elvira supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-US-AlonsoNeural',
    displayName: 'Alonso (Male)',
    gender: 'male',
    accent: 'Spanish (United States)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Alonso is a male Spanish (United States) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Alonso a male Spanish voice?', answer: 'Yes. Alonso is a male voice with a Spanish (United States) accent.' },
      { question: 'Is Alonso recommended in Konthora?', answer: 'No. Alonso is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Alonso support?', answer: 'Alonso supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-US-PalomaNeural',
    displayName: 'Paloma (Female)',
    gender: 'female',
    accent: 'Spanish (United States)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Paloma is a female Spanish (United States) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (United States) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Paloma a female Spanish voice?', answer: 'Yes. Paloma is a female voice with a Spanish (United States) accent.' },
      { question: 'Is Paloma recommended in Konthora?', answer: 'No. Paloma is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Paloma support?', answer: 'Paloma supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-UY-MateoNeural',
    displayName: 'Mateo (Male)',
    gender: 'male',
    accent: 'Spanish (Uruguay)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Mateo is a male Spanish (Uruguay) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Mateo a male Spanish voice?', answer: 'Yes. Mateo is a male voice with a Spanish (Uruguay) accent.' },
      { question: 'Is Mateo recommended in Konthora?', answer: 'No. Mateo is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Mateo support?', answer: 'Mateo supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-UY-ValentinaNeural',
    displayName: 'Valentina (Female)',
    gender: 'female',
    accent: 'Spanish (Uruguay)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Valentina is a female Spanish (Uruguay) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Uruguay) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Valentina a female Spanish voice?', answer: 'Yes. Valentina is a female voice with a Spanish (Uruguay) accent.' },
      { question: 'Is Valentina recommended in Konthora?', answer: 'No. Valentina is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Valentina support?', answer: 'Valentina supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-VE-PaolaNeural',
    displayName: 'Paola (Female)',
    gender: 'female',
    accent: 'Spanish (Venezuela)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Paola is a female Spanish (Venezuela) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at a default speed of 1.0× (range 0.75×–1.25×) and is available as a non-recommended option in the voice picker.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Paola a female Spanish voice?', answer: 'Yes. Paola is a female voice with a Spanish (Venezuela) accent.' },
      { question: 'Is Paola recommended in Konthora?', answer: 'No. Paola is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Paola support?', answer: 'Paola supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
    ],
  }),
  buildVoice({
    id: 'es-VE-SebastianNeural',
    displayName: 'Sebastian (Male)',
    gender: 'male',
    accent: 'Spanish (Venezuela)',
    language: 'es',
    recommended: false,
    defaultSpeed: 1.0,
    minimumSpeed: 0.75,
    maximumSpeed: 1.25,
    engine: 'edge',
  }, {
    intro: 'Sebastian is a male Spanish (Venezuela) voice in the Konthora catalogue, served by the Edge engine. It reads Spanish at speeds from 0.75× to 1.25× with a default of 1.0×, and is available whenever a Spanish (Venezuela) narrator is needed.',
    useCases: [
      'Spanish narration for videos, ads, and short-form social content.',
      'Spanish e-learning lessons, course narration, and corporate training audio.',
      'Reading Spanish scripts aloud to check pronunciation and pacing before sharing.',
    ],
    related: ['es-AR-ElenaNeural', 'es-AR-TomasNeural', 'es-BO-MarceloNeural'],
    faqs: [
      { question: 'Is Sebastian a male Spanish voice?', answer: 'Yes. Sebastian is a male voice with a Spanish (Venezuela) accent.' },
      { question: 'Is Sebastian recommended in Konthora?', answer: 'No. Sebastian is part of the Spanish set but is not flagged as recommended.' },
      { question: 'What speed settings does Sebastian support?', answer: 'Sebastian supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
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
  // Edge slugs are lowercased ids, so dashes cannot be turned back into
  // underscores: resolve through the catalogue first and only fall back to
  // the Kokoro underscore reconstruction for unknown slugs.
  return getVoiceBySlug(slug)?.id ?? slugToId(slug);
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
