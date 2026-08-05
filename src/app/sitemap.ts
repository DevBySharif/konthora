import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/text-to-speech',
    '/audio-to-text',
    '/speech-to-text',
    '/speech-to-text/how-to-transcribe-audio',
    '/speech-to-text/timestamps',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/copyright',
    '/captions',
    '/formats',
    '/entity/kokoro',
    '/entity/whisper',
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.includes('to-') ? 0.9 : 0.5,
  }));
}
