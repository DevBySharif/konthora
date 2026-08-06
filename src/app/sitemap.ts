import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
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
    '/audio-to-text',
    '/speech-to-text',
    '/speech-to-text/audio-transcription-accuracy',
    '/speech-to-text/how-to-transcribe-audio',
    '/speech-to-text/timestamps',
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
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.includes('to-') ? 0.9 : 0.5,
  }));
}
