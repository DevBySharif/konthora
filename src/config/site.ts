import { TOTAL_TTS_VOICES, TTS_LANGUAGE_COUNT } from '@/config/productFacts';

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://konthora.dev.bd'
).replace(/\/+$/, '');

export const siteConfig = {
  name: 'Konthora',
  tagline: 'Natural Speech. Precise Transcripts.',
  description: `Konthora provides browser-based text-to-speech with ${TOTAL_TTS_VOICES} AI voices across ${TTS_LANGUAGE_COUNT} languages, plus English audio and video transcription with accurate timestamps.`,
  url: siteUrl,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@konthora.dev.bd',
  author: 'Konthora Team',
  keywords: [
    'text to speech online',
    'audio to text',
    'transcription with timestamps',
    'free text to speech',
    'text to voice',
    'convert text to MP3',
    'transcribe audio with timestamps',
    'audio to SRT',
  ],
  links: {
    home: '/',
    textToSpeech: '/text-to-speech',
    audioToText: '/audio-to-text',
    about: '/about',
    contact: '/contact',
    privacy: '/privacy-policy',
    terms: '/terms',
    copyright: '/copyright',
  },
};

export type SiteConfig = typeof siteConfig;
