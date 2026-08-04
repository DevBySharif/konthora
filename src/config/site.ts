export const siteConfig = {
  name: 'Konthora',
  tagline: 'Natural Speech. Precise Transcripts.',
  description: 'Konthora provides browser-based tools for converting text into natural speech and transcribing audio or video with accurate timestamps.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@konthora.dev.bd',
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
