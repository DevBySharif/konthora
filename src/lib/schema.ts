interface SoftwareAppProps {
  name: string;
  url: string;
}

export function constructSoftwareAppSchema({ name, url }: SoftwareAppProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '12',
    },
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };
}
