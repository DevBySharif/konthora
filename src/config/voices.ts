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
  const rawUseCase = content.useCases[0] || 'video voiceovers and narration';
  const useCaseShort = rawUseCase.split(',')[0].replace(/\.$/, '').trim();
  const title = `${name} (${genderWord}, ${config.accent}) AI Voice for ${useCaseShort} | Konthora`;
  const accentArticle = /^[aeiou]/i.test(config.accent) ? 'an' : 'a';
  const description = `${name} is a ${genderWord.toLowerCase()} ${languageLabel} AI voice with ${accentArticle} ${config.accent} accent, ideal for ${rawUseCase.toLowerCase().replace(/\.$/, '')}. Preview audio and generate speech in Konthora.`;

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
    related: ['am_adam', 'af_heart', 'bf_emma'],
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
    related: ['af_heart', 'af_jessica', 'bm_george'],
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
    related: ['am_eric', 'af_heart', 'bm_adam'],
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
    related: ['am_puck', 'am_fenrir', 'bm_daniel'],
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
    related: ['hm_omega', 'hf_alpha', 'af_sara'],
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
    related: ['em_alex', 'ef_dora', 'pm_alex'],
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
    related: ['if_sara', 'em_alex', 'pm_alex'],
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
    related: ['pm_alex', 'pm_santa', 'ef_dora'],
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
    related: ['pm_alex', 'pf_dora', 'em_santa'],
    faqs: [
      { question: 'Is Santa a Portuguese voice?', answer: 'Yes. Santa is a male voice speaking Brazilian Portuguese (pt-BR).' },
      { question: 'Which other Portuguese voices exist?', answer: 'The Portuguese set includes Dora (female), Alex (male), and Santa (male).' },
      { question: 'What speed settings does Santa support?', answer: 'Santa supports speech from 0.75× to 1.25×, with a default of 1.0×.' },
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
