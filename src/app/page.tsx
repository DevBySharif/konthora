import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import {
  constructSoftwareAppSchema,
  constructOrganizationSchema,
  constructWebSiteSchema,
  constructSpeakableSchema,
} from '@/lib/schema';
import { Container } from '@/components/ui/Container';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Hero } from '@/components/home/Hero';
import { Trusted } from '@/components/home/Trusted';
import { TextToSpeech } from '@/components/home/TextToSpeech';
import { AudioTranscription } from '@/components/home/AudioTranscription';
import { WhyKonthora } from '@/components/home/WhyKonthora';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { Workflow } from '@/components/home/Workflow';
import { SupportedLanguages } from '@/components/home/SupportedLanguages';
import { ProductFacts } from '@/components/home/ProductFacts';
import { FinalCTA } from '@/components/home/FinalCTA';

export const metadata: Metadata = constructMetadata({
  // Brand + combined offering. /text-to-speech keeps the high-intent
  // "Free AI Text to Speech Online" title, so the homepage must not duplicate
  // it or the two pages compete for the same query.
  title: 'Konthora — Free AI Voice & Transcription Studio',
  description:
    'Konthora turns text into natural AI speech and audio into timestamped transcripts. Generate MP3 or WAV voiceovers and export TXT, SRT, VTT, or JSON free.',
  path: '/',
});

const homeFaqs: FAQItem[] = [
  {
    question: 'Is Konthora free to use?',
    answer:
      'Yes, Konthora is currently free to use. You can generate speech and transcribe audio directly from your browser without creating an account.',
  },
  {
    question: 'Which audio formats are supported?',
    answer:
      'For text-to-speech, you can download audio in MP3 and WAV formats. For transcription, you can upload MP3, WAV, M4A, AAC, MP4, WebM, and MOV files.',
  },
  {
    question: 'Can transcripts include timestamps?',
    answer:
      'Yes. You can choose between sentence-level, paragraph-level, or precise word-level timestamps to sync text with your audio.',
  },
  {
    question: 'Can generated speech be downloaded?',
    answer:
      'Yes. You can generate and download high-quality speech files directly in MP3 or WAV format from the Text to Speech workspace.',
  },
  {
    question: 'Are uploaded files stored permanently?',
    answer:
      'No. Uploaded texts are processed strictly in-memory and immediately wiped once synthesis completes. Uploaded media files and transcripts are automatically deleted after 60 minutes.',
  },
  {
    question: 'Does it work on mobile devices?',
    answer:
      'Yes. Konthora is designed with a mobile-first responsive layout, allowing you to use all tools, configure settings, and manage workspaces on smartphones and tablets.',
  },
];

export default function HomePage() {
  const organizationSchema = constructOrganizationSchema(
    siteConfig.name,
    siteConfig.url,
    `${siteConfig.url}/icon.png`,
  );

  const websiteSchema = constructWebSiteSchema(
    siteConfig.name,
    siteConfig.url,
    siteConfig.description,
  );

  const webAppSchema = constructSoftwareAppSchema({
    name: `${siteConfig.name} AI Audio Tools`,
    url: siteConfig.url,
  });

  // Short, self-contained blurb that voice assistants and AI answer engines may
  // read verbatim. Must stay concise and factual — it is quoted as-is.
  const speakableSummary =
    'Konthora is a free browser-based AI audio studio. It converts text into natural speech using 41 neural voices across 6 languages, and converts audio and video into transcripts with sentence, paragraph, or word-level timestamps. No account is required.';

  const speakableSchema = constructSpeakableSchema(siteConfig.url, speakableSummary);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd schema={organizationSchema} />
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={speakableSchema} />

      {/*
        Target of the Speakable schema above. Keep it as plain, factual prose in
        a visually-hidden container: visible to crawlers and screen readers,
        rendered by voice assistants, but not shown on the page.
      */}
      <p id="speakable-summary" className="sr-only">
        {speakableSummary}
      </p>

      <Hero />
        <Trusted />
        <TextToSpeech />
        <AudioTranscription />
        <WhyKonthora />
        <FeatureGrid />
        <Workflow />
        <SupportedLanguages />
        <ProductFacts />

        {/* FAQ Section */}
        <section className="relative overflow-hidden" aria-labelledby="faq-heading">
          <Container className="py-20 md:py-28">
            <div className="text-center mb-12">
              <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-muted-foreground">
                Have questions about Konthora? Find quick answers below.
              </p>
            </div>
            <FAQ items={homeFaqs} />
          </Container>
        </section>

        <FinalCTA />
    </>
  );
}
