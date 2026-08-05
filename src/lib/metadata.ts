import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface MetadataProps {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

const OG_IMAGE = '/opengraph-image';

export function constructMetadata({
  title,
  description,
  path,
  noIndex = false,
}: MetadataProps): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — AI text to speech and timestamped audio transcription`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}