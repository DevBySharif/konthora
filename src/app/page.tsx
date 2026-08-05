import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
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
import { FinalCTA } from '@/components/home/FinalCTA';

export const metadata: Metadata = constructMetadata({
  title: 'Konthora | Free AI Text to Speech & Audio Transcription',
  description:
    'Convert text into natural AI speech or transcribe audio and video with accurate timestamps. Create downloadable speech and timestamped transcripts with Konthora.',
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
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${siteConfig.name} AI Audio Tools`,
    url: siteConfig.url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };

  return (
    <>
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={webAppSchema} />

      <Hero />
        <Trusted />
        <TextToSpeech />
        <AudioTranscription />
        <WhyKonthora />
        <FeatureGrid />
        <Workflow />
        <SupportedLanguages />

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