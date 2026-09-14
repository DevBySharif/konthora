import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    siteConfig.url ||
    'https://konthora.dev.bd'
  ).replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/_next/static/media/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
