import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Understand how we collect, use, and protect your information when utilizing our services.`,
  path: '/privacy-policy',
});

export default function Page() {
  const pageUrl = `${siteConfig.url}/privacy-policy`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section className="pb-24">
        <Container className="max-w-4xl">
          <div className="mb-10">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Privacy Policy' }]} />
            <PageHeader
              title="Privacy Policy"
              description="Understand how we collect, use, and protect your information when utilizing our services."
              badge="Privacy"
            />
          </div>

          <div className="flex gap-4 p-5 border border-yellow-500/20 bg-yellow-500/5 rounded-2xl text-yellow-700 dark:text-yellow-400/90 mb-12">
            <AlertTriangle className="h-6 w-6 shrink-0 text-yellow-600 dark:text-yellow-500" />
            <div className="space-y-1.5">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Draft Notice</h3>
              <p className="text-sm leading-relaxed">
                This document is a pre-production launch draft. It must be reviewed, adjusted, and finalized by qualified legal counsel before public production processing is enabled on Konthora.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                At <strong className="text-foreground">{siteConfig.name}</strong>, accessibility and user trust are core values. This policy explains our guidelines concerning data handling for visitors using our website.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                1. Temporary File Processing
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch] mb-4">
                  When the transcription and speech processing engines are integrated, the following data lifecycle policy will apply:
                </p>
                <ul className="list-disc pl-6 space-y-3 leading-8 text-muted-foreground max-w-[75ch] marker:text-muted-foreground/50">
                  <li className="pl-2">
                    <strong className="text-foreground">Uploaded Files:</strong> Any audio or video files uploaded to the transcription workspace will be processed temporarily on our servers to parse language and generate text timestamps.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">Generated Audio:</strong> Text scripts converted into voice output will be compiled on our servers to output downloadable MP3 or WAV files.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">Retention & Deletion:</strong> Uploaded texts are processed strictly in-memory and immediately wiped from server memory once synthesis concludes. Generated audio output files are cached temporarily under secure, randomized paths and automatically deleted after exactly 60 minutes.
                  </li>
                </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                2. Analytical Tools
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                  We may utilize basic website analytics to monitor traffic, load performance, and browser compatibility. These analytics do not inspect the content of your text scripts or media uploads and serve only to improve platform stability.
                </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                3. Cookies and Storage
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                  We use local storage within your browser to store user preferences such as your visual theme choice (Light or Dark mode). We do not track users across third-party websites.
                </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                4. Future Advertising Integration
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                  To keep our tools free, we plan to monetize the platform by serving advertisements. These ad services may use basic device identifiers to serve non-intrusive placements. We do not share user script files or media assets with advertising partners.
                </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                5. Changes to This Policy
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                  We reserves the right to revise this Privacy Policy to reflect backend integrations or regulatory updates. We recommend checking this page periodically for updates.
                </p>
            </div>

          </div>

          <div className="mt-16 pt-12 border-t border-border/50">
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-secondary/30 border border-border/40">
              <HelpCircle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Questions? Need clarification?</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Our support team is here to help you understand our policies and answer any questions you might have.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
                >
                  Contact Support
                </a>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 font-medium text-foreground transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
