import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Volume2, FileAudio, Users, Target } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: `About Us | ${siteConfig.name}`,
  description: `Learn about ${siteConfig.name}, our quality-first neural text-to-speech generators and timestamped audio transcription tools.`,
  path: '/about',
});

export default function AboutPage() {
  const pageUrl = `${siteConfig.url}/about`;

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
        name: 'About',
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
            title={`About ${siteConfig.name}`}
            description="Our mission is to build clean, fast, and professional AI audio utilities for content creators, transcribers, and developers."
            badge="Our Story"
          />

          <div className="prose dark:prose-invert max-w-none mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              The name <strong className="text-foreground">{siteConfig.name}</strong> is inspired by the Bengali word <strong className="text-foreground">&ldquo;Kontho,&rdquo;</strong> which translates to <strong className="text-foreground">voice</strong>. True to this etymology, our platform focuses on expanding the possibilities of human voice and spoken content by providing high-quality tools to generate natural speech and parse audio recordings into highly readable, timestamped transcripts.
            </p>

            <p>
              We believe that powerful tools don&rsquo;t need to be complex or cluttered. By designing browser-centric workspaces, we make it easy for public users to draft high-fidelity audio tracks or transcribe speech without requiring bloated software installations, subscription accounts, or complex onboarding.
            </p>
          </div>

          {/* Grid of values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Natural Speech Output</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By focusing on high-quality neural voice synthesis models, our future speech engine aims to create conversational, human-like voice outputs that avoid standard robotic inflections.
              </p>
            </div>

            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <FileAudio className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Accurate Timestamps</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our transcription workflow is designed to parse media files and link text segments directly with timeline timestamps down to individual words, ideal for syncing subtitles and indexes.
              </p>
            </div>

            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Quality-First Approach</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We focus only on doing two things exceptionally well—Text to Speech and Audio Transcription—rather than building a bloated platform with dozens of unrelated, mediocre AI features.
              </p>
            </div>

            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Privacy & Transparency</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We are committed to transparent user agreements and safe content management, providing clear notices about temporary data processing and automatic deletion parameters.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
