import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Accessibility | ${siteConfig.name}`,
  description:
    'Konthora is built for keyboard, screen readers, and text scaling. Read our accessibility commitment, what works today, and how to report a barrier.',
  path: '/accessibility',
});

export default function AccessibilityPage() {
  const pageUrl = `${siteConfig.url}/accessibility`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Accessibility', item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section>
        <Container className="max-w-4xl">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Accessibility' }]} />
          <PageHeader
            title="Accessibility"
            description="Konthora is built to be usable by everyone, including people who navigate by keyboard, use screen readers, or scale text in their browser."
            badge="Our Commitment"
          />

          <div className="prose dark:prose-invert max-w-none mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              We aim for the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. Accessibility
              is part of how we build the workspace, not a feature added afterwards: the tools are
              designed so that generating speech and transcripts does not depend on a mouse, a
              particular screen size, or a particular way of seeing the page.
            </p>

            <h2 className="text-xl font-bold text-foreground">What works today</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Keyboard navigation.</strong> Every control in
                the text-to-speech and transcription workspaces — language and voice pickers, speed
                and pause sliders, generate and download buttons — is reachable and operable by
                keyboard, with a visible focus outline on the active control.
              </li>
              <li>
                <strong className="text-foreground">Screen-reader labels.</strong> Interactive
                controls carry accessible names and states: voice pickers announce the selected
                voice, toggles and sliders announce their values, and status changes (queued,
                generating, completed, failed) are shown as text rather than colour alone.
              </li>
              <li>
                <strong className="text-foreground">Structure.</strong> Pages use one main heading
                and a logical heading order, landmarks, and breadcrumb navigation, so assistive
                technology can map a page before reading it.
              </li>
              <li>
                <strong className="text-foreground">Text and contrast.</strong> Copy uses
                high-contrast text on the dark interface, and the layout is responsive, so text
                can be scaled up in the browser.
              </li>
              <li>
                <strong className="text-foreground">No account walls.</strong> Nothing on the site
                requires creating an account or completing a visual challenge to use the tools.
              </li>
              <li>
                <strong className="text-foreground">Audio alternatives.</strong> Transcription
                output is text (TXT, SRT, VTT, JSON), so audio content has a readable equivalent.
                For the other direction, see our guide on{' '}
                <Link href="/accessibility/tts-vs-screen-reader" className="text-primary hover:underline">
                  text-to-speech vs screen readers
                </Link>
                .
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">Known limitations</h2>
            <p>
              Generated speech previews play as audio with a visible play/pause control and a text
              label; a preview reads one short fixed sentence in the voice&apos;s own language.
              Some decorative motion (hero animation, hover states) is visual only and carries no
              information. If you find a control that cannot be reached by keyboard, a label that
              a screen reader misreads, or a page that breaks at large text sizes, that is a bug
              — please tell us.
            </p>

            <h2 className="text-xl font-bold text-foreground">Report a barrier</h2>
            <p>
              Tell us which page you were on, what you were trying to do, and what assistive
              technology or browser you use, through our{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact page
              </Link>
              . We review accessibility reports as bugs and fix the underlying control rather than
              offering a separate version of the site.
            </p>

            <p className="text-sm border-l-4 border-primary/40 pl-4 italic">
              This statement was last updated on 15 November 2026. It describes the site as
              built today; when a control changes, the statement is updated with it.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
