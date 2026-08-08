import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { TranscriptionWorkspace } from '@/components/tools/TranscriptionWorkspace';
import { InfoSection, StepsSection, CrossLinks, InfoCard } from '@/components/tools/ToolInfoSections';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { FileAudio, Clock, Languages, FileDown, Mic } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'MP3 to Text Converter Online Free | Konthora Transcriber',
  description:
    'Convert any MP3 file to text online for free. Get an accurate, timestamped transcript and export it as TXT, SRT, VTT, or JSON.',
  path: '/mp3-to-text',
});

export default function Mp3ToTextPage() {
  const pageUrl = `${siteConfig.url}/mp3-to-text`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konthora MP3 to Text Converter',
    url: pageUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'MP3 to Text', item: pageUrl },
    ],
  };

  const faqs: FAQItem[] = [
    {
      question: 'Can I convert an MP3 to text with timestamps?',
      answer:
        'Yes. The workspace transcribes your MP3 with Whisper and returns sentence, paragraph, or word-level timestamps you can download.',
    },
    {
      question: 'How large can my MP3 be?',
      answer:
        'Each upload can be up to 100 MB and up to 10 minutes long. Longer recordings can be split into smaller parts first.',
    },
    {
      question: 'Which languages does MP3 transcription support?',
      answer:
        'Konthora currently transcribes English-language audio. Selecting "Auto Detect" also processes the audio as English.',
    },
    {
      question: 'How do I export an MP3 transcript?',
      answer:
        'After transcription, download your result as plain TXT, SRT subtitles, WebVTT captions, or structured JSON.',
    },
    {
      question: 'Is transcription limited to MP3 files?',
      answer:
        'No. The same workspace also accepts WAV, M4A, AAC, MP4, WebM, and MOV files. This page just focuses on the most common one — MP3.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const capabilityCards: InfoCard[] = [
    {
      icon: FileAudio,
      title: 'MP3-first input',
      desc: 'Drop in an MP3 recording and get a transcript in minutes. Other audio formats are welcome too.',
    },
    {
      icon: Clock,
      title: 'Timestamps at every level',
      desc: 'Group timestamps per sentence, per paragraph, or down to individual words.',
    },
    {
      icon: Languages,
      title: 'English transcription',
      desc: 'Accurate speech recognition tuned for English-language MP3 recordings.',
    },
    {
      icon: FileDown,
      title: 'TXT, SRT, VTT, JSON',
      desc: 'Export what you need — clean notes, captions for video players, or timestamped data.',
    },
  ];

  const useCaseCards: InfoCard[] = [
    {
      icon: Mic,
      title: 'Podcast notes',
      desc: 'Turn an episode MP3 into searchable, timestamped show notes you can publish.',
    },
    {
      icon: FileDown,
      title: 'Subtitle creation',
      desc: 'Export SRT or VTT captions to make your video accessible to more viewers.',
    },
    {
      icon: Languages,
      title: 'Interviews and research',
      desc: 'Get a written, quotable record of interviews stored as MP3.',
    },
    {
      icon: Clock,
      title: 'Voice memos',
      desc: 'Convert quick MP3 recordings and notifications into text you can search later.',
    },
  ];

  const steps = [
    {
      title: 'Upload your MP3',
      desc: 'Drop in an MP3 file, or another supported format, up to 100 MB.',
    },
    {
      title: 'Choose how to group timestamps',
      desc: 'Pick sentence-, paragraph-, or word-level detail for your transcript.',
    },
    {
      title: 'Transcribe and export',
      desc: 'Review the text and download it as TXT, SRT, VTT, or JSON.',
    },
  ];

  return (
    <>
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />

      <Section className="pb-6">
        <Container>
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'MP3 to Text' }]} />
          <PageHeader
            title="MP3 to Text Converter Online"
            description="Upload an MP3 and get an accurate, timestamped transcript. Review the text, then export it as TXT, SRT, VTT, or JSON."
            badge="Transcription"
          />
          <TranscriptionWorkspace />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow="Capabilities"
        title="What the MP3 transcription workspace supports"
        description="Konthora turns MP3 audio into accurate, timestamped text you can edit and export. Here is the exact scope."
        cards={capabilityCards}
      />

      <StepsSection
        id="how-to-transcribe-mp3"
        eyebrow="How it works"
        title="Transcribe an MP3 in three steps"
        description="Upload a recording and get a timestamped transcript in minutes."
        steps={steps}
      />

      <InfoSection
        id="use-cases"
        eyebrow="Who it is for"
        title="How people use Konthora MP3 transcription"
        description="Searchable, quotable text from recordings for anyone working with audio."
        cards={useCaseCards}
        twoCol
      />

      <CrossLinks
        title="Related tools"
        description="Pair MP3 transcription with the rest of the audio workspace."
        links={[
          {
            href: '/audio-to-text',
            label: 'Full transcription workspace',
            description: 'Transcribe all supported formats with richer timestamp and export options.',
            primary: true,
          },
          {
            href: '/video-to-text',
            label: 'Video to Text',
            description: 'Extract the audio track from a video and transcribe it in the same way.',
          },
        ]}
      />

      {/* Tool FAQ Section */}
      <Section className="bg-secondary/10">
        <Container>
          <div className="text-center mb-12" id="mp3-to-text-faq-heading">
            <h2 className="text-2xl font-bold text-foreground">MP3 to Text FAQs</h2>
            <p className="mt-2 text-muted-foreground">Common questions about transcribing MP3 files to text.</p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}