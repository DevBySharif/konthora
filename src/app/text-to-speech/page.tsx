import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { TtsWorkspace } from '@/components/tools/TtsWorkspace';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: 'Free AI Text to Speech Online | Konthora',
  description:
    'Convert text into natural AI speech with customizable voices, speed controls and downloadable MP3 or WAV audio using Konthora.',
  path: '/text-to-speech',
});

export default function TextToSpeechPage() {
  const pageUrl = `${siteConfig.url}/text-to-speech`;

  // Structured Data (JSON-LD)
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konthora Free AI Text to Speech Online',
    url: pageUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };

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
        name: 'Text to Speech',
        item: pageUrl,
      },
    ],
  };

  const ttsFaqs: FAQItem[] = [
    {
      question: 'What is the character limit for text generation?',
      answer:
        'Guests can generate speech for text scripts up to 2,000 characters per single session. This helps maintain server resources and guarantees fast queue times.',
    },
    {
      question: 'Which voice models and accents are supported?',
      answer:
        'We support multiple distinct neural voice profiles, including female and male voices. Supported accents include US English (American English) and UK English (British English).',
    },
    {
      question: 'Which audio formats will be supported for download?',
      answer:
        'You will be able to download generated voiceovers in standard MP3 format for maximum compatibility, or raw WAV format for high-quality lossless editing.',
    },
    {
      question: 'Can I use the generated speech in commercial projects?',
      answer:
        'Yes. All voiceovers generated through Konthora are owned by you. You can use them in podcasts, video projects, presentations, or advertisements without royalties.',
    },
  ];

  return (
    <>
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={breadcrumbSchema} />

      <Section className="pb-6">
        <Container>
          <PageHeader
            title="Free AI Text to Speech Online"
            description="Convert your written scripts into natural-sounding speech with customizable voices, adjustable speeds, and download support."
            badge="Speech Workbench"
          />
          <TtsWorkspace />
          <AdPlaceholder />
        </Container>
      </Section>

      {/* Tool FAQ Section */}
      <Section className="bg-secondary/10">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground">
              Text to Speech FAQs
            </h2>
            <p className="mt-2 text-muted-foreground">
              Frequently asked questions specific to our speech generation workspace.
            </p>
          </div>
          <FAQ items={ttsFaqs} />
        </Container>
      </Section>
    </>
  );
}
