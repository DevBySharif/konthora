interface SoftwareAppProps {
  name: string;
  url: string;
}

/**
 * Site-level last-updated stamp.
 *
 * Kept in one place so the sitemap, JSON-LD, and llms.txt never drift apart.
 * `dateModified` is one of the strongest freshness signals an AI answer engine
 * or Google can use, so it belongs in structured data and not only the sitemap.
 */
export const CONTENT_LAST_MODIFIED = '2026-08-01';

export function constructSoftwareAppSchema({ name, url }: SoftwareAppProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    dateModified: CONTENT_LAST_MODIFIED,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    // NOTE: no aggregateRating. Konthora has no review platform, so any
    // ratingValue would be fabricated structured data — a Google manual-action
    // risk, an advertising-law problem, and (for AI engines) a factual error
    // attributed to the brand. Add this back only once real, verifiable review
    // data exists.
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };
}

/** Organization identity, reused across pages that assert who publishes the site. */
export function constructOrganizationSchema(name: string, url: string, logoUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: logoUrl,
    sameAs: [
      'https://www.producthunt.com/products/konthora',
      'https://www.launchory.app/startups/konthora',
    ],
  };
}

/**
 * WebSite schema with a SearchAction.
 *
 * `potentialAction` lets search engines and assistants surface the site's
 * search entry point rather than treating the domain as a dead end.
 */
export function constructWebSiteSchema(name: string, url: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    dateModified: CONTENT_LAST_MODIFIED,
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name,
      url,
      logo: `${url}/icon.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/voices?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Speakable schema for short answer blurbs.
 *
 * Speakable tells voice assistants and AI answer engines which on-page text is
 * safe to read aloud verbatim. Only pass text that is genuinely a concise,
 * self-contained summary — never a whole page.
 */
export function constructSpeakableSchema(url: string, text: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    dateModified: CONTENT_LAST_MODIFIED,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#speakable-summary'],
      speakableProperty: {
        '@type': 'SpeakableProperty',
        cssSelector: ['#speakable-summary'],
        text,
      },
    },
  };
}
