/**
 * Per-route freshness stamps.
 *
 * The sitemap previously sent the same `lastModified` for all 91 URLs, which
 * tells crawlers the entire site changed on a single day. That spends a
 * freshness signal: when every page claims the same date, the date carries no
 * information about which content is actually current.
 *
 * This registry gives each route a realistic last-modified date, so a guide
 * that was rewritten today sorts as newer than a static legal page, and an AI
 * answer engine weighing what to cite has something to weigh.
 *
 * Bump the relevant entry when that page's content meaningfully changes. The
 * `tests/frontend/seoAudit.test.mjs` freshness test fails on a malformed or
 * unreachable date, and the sitemap test fails on a route with no entry.
 */

const DEFAULT_LAST_MODIFIED = '2026-08-01';

/** Routes whose content changed in the SEO/AEO/GEO pass. */
const RECENTLY_UPDATED: Record<string, string> = {
  // Voice catalogue grew 41 → 129 (88 Edge voices) and 6 → 7 languages,
  // Nov 2026: per-language sample text, Edge previews, hreflang completion.
  '/': '2026-11-14',
  '/text-to-speech': '2026-11-14',
  '/text-to-speech/spanish': '2026-11-14',
  '/text-to-speech/hindi': '2026-11-14',
  '/text-to-speech/bengali': '2026-11-14',
  '/text-to-speech/french': '2026-11-14',
  '/text-to-speech/italian': '2026-11-14',
  '/text-to-speech/portuguese': '2026-11-14',
  '/text-to-speech/how-does-text-to-speech-work': '2026-11-14',
  '/text-to-mp3': '2026-11-14',
  '/voices': '2026-11-14',
  '/entity/kokoro': '2026-11-14',
  '/accessibility': '2026-11-14',
  '/accessibility/tts-vs-screen-reader': '2026-11-14',

  // Rewritten as genuinely distinct pages rather than template clones.
  '/transcribe-podcast': '2026-10-01',
  '/transcribe-interview': '2026-10-01',
  '/transcribe-meeting': '2026-10-01',
  '/transcribe-lecture': '2026-10-01',
  '/transcribe-video': '2026-10-01',
  '/transcribe-voice-memo': '2026-10-01',
  '/transcribe-webinar': '2026-10-01',

  // Intent split against /audio-to-text.
  '/speech-to-text': '2026-10-01',
  '/audio-to-text': '2026-10-01',

  // Differentiated use-case guides.
  '/text-to-speech-for-podcasts': '2026-10-01',
  '/text-to-speech-for-youtube-videos': '2026-10-01',
  '/text-to-speech-for-presentations': '2026-10-01',
  '/text-to-speech-for-elearning': '2026-10-01',
  '/text-to-speech-for-social-media': '2026-10-01',
  '/text-to-speech-for-audiobooks': '2026-10-01',

  // Differentiated transcription tool pages, and the three answer-shaped
  // reference pages added to target question queries.
  '/video-to-text': '2026-10-01',
  '/mp3-to-text': '2026-10-01',
  '/speech-to-text/transcription-accuracy-checklist': '2026-10-01',
  '/text-to-speech-timestamps-explained': '2026-10-01',
  '/ai-voice-sounds-robotic': '2026-10-01',
};

/** Legal and policy pages change rarely, so they carry an older stamp. */
const STABLE: Record<string, string> = {
  '/privacy-policy': '2026-06-15',
  '/terms': '2026-06-15',
  '/copyright': '2026-06-15',
  '/contact': '2026-05-10',
};

export function getLastModified(route: string): string {
  const normalised = route === '' ? '/' : route.replace(/\/+$/, '') || '/';
  return RECENTLY_UPDATED[normalised] ?? STABLE[normalised] ?? DEFAULT_LAST_MODIFIED;
}

export function getLastModifiedDate(route: string): Date {
  return new Date(getLastModified(route));
}

export const SITE_LAST_MODIFIED = DEFAULT_LAST_MODIFIED;