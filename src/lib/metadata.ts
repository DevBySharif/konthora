import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface MetadataProps {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  /** Absolute or site-relative language variants for hreflang. */
  languages?: Record<string, string>;
}

/**
 * `opengraph-image` is a generated route; Next serves it at
 * `/opengraph-image?<hash>`. Referencing the bare path works in most crawlers
 * but is a fragile reference, so it is resolved to an absolute URL here.
 */
const OG_IMAGE = `${siteConfig.url}/opengraph-image`;

export function constructMetadata({
  title,
  description,
  path,
  noIndex = false,
  languages,
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
      ...(languages
        ? {
            languages: Object.fromEntries(
              Object.entries(languages).map(([locale, href]) => [
                locale,
                `${siteConfig.url}${href}`,
              ]),
            ),
          }
        : {}),
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
