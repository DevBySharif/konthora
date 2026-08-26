import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Container } from '../ui/Container';
import { KonthoraBrand } from '../brand/KonthoraBrand';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Text to Speech', href: siteConfig.links.textToSpeech },
      { label: 'Audio to Text', href: siteConfig.links.audioToText },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Voice Library', href: '/voices' },
      { label: 'Guides', href: '/text-to-speech/how-does-text-to-speech-work' },
      { label: 'Text-to-Speech vs Screen Readers', href: '/accessibility/tts-vs-screen-reader' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: siteConfig.links.about },
      { label: 'Contact', href: siteConfig.links.contact },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: siteConfig.links.privacy },
      { label: 'Terms', href: siteConfig.links.terms },
      { label: 'Copyright Removal', href: siteConfig.links.copyright },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/40 text-foreground transition-colors duration-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <Container className="pt-20 pb-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand section */}
          <div className="flex flex-col items-start lg:col-span-4">
            <KonthoraBrand variant="footer" />
            <p className="mt-6 max-w-[280px] text-sm leading-relaxed text-muted-foreground line-clamp-2">
              Fast, natural AI speech and transcription powered by modern open models.
            </p>

            {/* Contact Card */}
            <a
              href={`mailto:support@konthora.dev.bd`}
              className="mt-8 inline-flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-card hover:text-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Mail className="h-4 w-4 text-muted-foreground/80" aria-hidden="true" />
              support@konthora.dev.bd
            </a>

            <a
              href="https://www.producthunt.com/products/konthora?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-konthora"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Konthora - Natural AI voices and accurate transcription in your browser | Product Hunt"
                width={250}
                height={54}
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1228496&theme=dark&t=1787315761233"
                className="block h-auto max-w-full"
              />
            </a>
            <a
              href="https://www.launchory.app/startups/konthora?ref=badge"
              target="_blank"
              className="mt-6 inline-block max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.launchory.app/api/badge/konthora?theme=dark"
                alt="Featured on Launchory"
                width={240}
                height={54}
                className="block h-auto max-w-full"
              />
            </a>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-6 space-y-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {currentYear} Konthora. All rights reserved.
          </p>
          <div className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shadow-sm">
            Built with Open Models
          </div>
        </div>
      </Container>
    </footer>
  );
}
