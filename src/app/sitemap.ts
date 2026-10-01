import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getAllVoices, getVoiceUrl } from '@/config/voices';
import { getLastModifiedDate } from '@/config/freshness';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    siteConfig.url ||
    'https://konthora.dev.bd'
  ).replace(/\/+$/, '');

  const voiceRoutes = getAllVoices().map((voice) => getVoiceUrl(voice.slug));

  const routes = [
    '',
    '/text-to-speech',
    '/text-to-speech-for-youtube-videos',
    '/text-to-speech-for-podcasts',
    '/text-to-speech-for-presentations',
    '/text-to-speech-for-elearning',
    '/text-to-speech-for-social-media',
    '/text-to-speech-for-audiobooks',
    '/text-to-speech/how-does-text-to-speech-work',
    '/text-to-speech/spanish',
    '/text-to-speech/hindi',
    '/text-to-speech/french',
    '/text-to-speech/italian',
    '/text-to-speech/portuguese',
    '/text-to-mp3',
    '/audio-to-text',
    '/mp3-to-text',
    '/video-to-text',
    '/speech-to-text',
    '/speech-to-text/audio-transcription-accuracy',
    '/speech-to-text/how-to-transcribe-audio',
    '/speech-to-text/timestamps',
    '/speech-to-text/transcription-accuracy-checklist',
    '/transcribe-podcast',
    '/transcribe-interview',
    '/transcribe-meeting',
    '/transcribe-lecture',
    '/transcribe-video',
    '/transcribe-voice-memo',
    '/transcribe-webinar',
    '/text-to-speech-timestamps-explained',
    '/ai-voice-sounds-robotic',
    '/accessibility/tts-vs-screen-reader',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/copyright',
    '/captions',
    '/captions/closed-captions-vs-subtitles',
    '/captions/how-to-add-captions-to-video',
    '/captions/subtitle-formats',
    '/formats',
    '/formats/json',
    '/formats/mp3-vs-wav',
    '/formats/srt',
    '/formats/txt',
    '/formats/vtt',
    '/entity/kokoro',
    '/entity/whisper',
    '/voices',
    '/voices/american-english-voices',
    '/voices/british-english-voices',
    ...voiceRoutes,
  ];

  return routes.map((route) => {
    const isHome = route === '';

    // Pages that embed a live workspace and target a commercial query.
    const isPrimaryTool =
      route === '/text-to-speech' ||
      route === '/audio-to-text' ||
      route === '/text-to-mp3' ||
      route === '/mp3-to-text' ||
      route === '/video-to-text';

    /**
     * `/speech-to-text` is an explainer ("How Audio Transcription Works") that
     * embeds no workspace. It was previously marked as a primary tool, so it
     * competed with `/audio-to-text` for the same commercial query while
     * offering nothing to click. Demoted to a normal guide below.
     */
    const isExplainer = route === '/speech-to-text';

    let priority = 0.5;
    let changeFrequency: 'weekly' | 'monthly' = 'monthly';

    if (isHome) {
      priority = 1.0;
      changeFrequency = 'weekly';
    } else if (isPrimaryTool) {
      priority = 0.9;
      changeFrequency = 'weekly';
    } else if (route.startsWith('/voices/')) {
      priority = 0.7;
      changeFrequency = 'monthly';
    } else if (route.startsWith('/formats/') || route.startsWith('/captions/')) {
      priority = 0.6;
      changeFrequency = 'monthly';
    } else if (route.startsWith('/speech-to-text/') || route.startsWith('/transcribe-')) {
      priority = 0.6;
      changeFrequency = 'monthly';
    }

    // `route.includes('to-')` used to sweep every guide into 0.9/weekly, which
    // over-signalled 30+ informational pages. Guides now sit at 0.6.
    if (!isHome && !isExplainer && priority === 0.5 && route.includes('to-')) {
      priority = 0.6;
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: getLastModifiedDate(route),
      changeFrequency,
      priority,
    };
  });
}
