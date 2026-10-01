import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';
import Analytics from '@/components/analytics/Analytics';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/JsonLd';
import { constructOrganizationSchema } from '@/lib/schema';
import { getLastModified } from '@/config/freshness';
import { siteConfig } from '@/config/site';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://konthora.dev.bd'),
  // No `title.template` on purpose: `constructMetadata` returns a full title
  // string for every page, so a template would append the brand a second time
  // ("... | Kokoro TTS Studio | Konthora") and push the SERP snippet further
  // into truncation. Brand presence is handled per-page instead.
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: 'https://konthora.dev.bd',
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
      },
    }),
  },
};

// Declared once here rather than per page. Organization schema was previously
// emitted only by the homepage and two entity pages, so on 88 of 91 URLs an AI
// answer engine had no entity markup to resolve "Konthora" against. Emitting it
// site-wide makes the entity consistent everywhere it is crawled.
//
// The homepage also declares its own; a duplicate Organization node is harmless
// and keeps that page self-describing.
const organizationSchema = {
  ...constructOrganizationSchema(
    siteConfig.name,
    siteConfig.url,
    `${siteConfig.url}/icon.png`
  ),
  // Freshness the homepage previously carried only via WebSite schema.
  dateModified: getLastModified(''),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <JsonLd schema={organizationSchema} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <div className="grain" aria-hidden="true" />
        <Header />
        <main id="main-content" className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
