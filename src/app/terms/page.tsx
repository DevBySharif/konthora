import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Terms of Service | ${siteConfig.name}`,
  description: `Review the terms of service for using ${siteConfig.name} AI audio tools. Acceptable use, content ownership, and liability rules.`,
  path: '/terms',
});

export default function TermsPage() {
  const pageUrl = `${siteConfig.url}/terms`;

  // Structured Data (JSON-LD)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Terms of Service',
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section>
        <Container className="max-w-4xl">
          <PageHeader
            title="Terms of Service"
            description="Read the terms and rules governing the use of our speech synthesis and transcription services."
            badge="Terms"
          />

          {/* Legal Draft Warning */}
          <div className="p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm leading-relaxed mb-8">
            <strong>Draft Document:</strong> This document is a pre-production launch draft. It must be reviewed, adjusted, and finalized by qualified legal counsel before public production processing is enabled on Konthora.
          </div>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6 leading-relaxed">
            <p>
              Welcome to <strong className="text-foreground">{siteConfig.name}</strong>. By accessing our website, you agree to comply with the rules outlined in these Terms of Service.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
            <p>
              By utilizing the text-to-speech and transcription workspaces, you confirm that you accept these terms and agree to abide by them. If you do not agree, you must not utilize our website tools.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">2. Acceptable Use and Restrictions</h2>
            <p>
              You agree to use our platform only for lawful purposes. You must not use the platform to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                Upload, transcribe, or generate audio containing illegal material, hate speech, harassment, or defamatory statements.
              </li>
              <li>
                Engage in any automated scraping, reverse engineering, or rate-limiting abuse of our browser workspaces or underlying systems.
              </li>
              <li>
                Infringe on third-party copyright, patents, or intellectual property rights.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8">3. Ownership of Content</h2>
            <p>
              You retain all ownership rights in the source text scripts and media files that you submit to Konthora. We do not claim any proprietary rights over your uploaded text or audio, and all generated outputs (such as voice files or transcription logs) belong entirely to you for personal or commercial use.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">4. Service Availability</h2>
            <p>
              Our workspaces are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee uninterrupted runtime, zero transcription errors, or that server capacities will always be available during peak traffic.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Konthora and its developers shall not be liable for any direct, indirect, or incidental damages resulting from file upload loss, generated audio quality, transcription inaccuracies, or system downtime.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">6. Governing Law</h2>
            <p>
              These Terms of Service are governed by local regulatory guidelines. Any disputes arising from the use of our services will be subject to local court jurisdictions.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
