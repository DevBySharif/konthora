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
import { FileVideo, Clock, Languages, FileDown, Scissors } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Video to Text Converter Online Free | Konthora Transcriber',
  description:
    'Convert video to text online for free. Upload MP4, WebM, or MOV and get an accurate, timestamped transcript ready to export as TXT, SRT, VTT, or JSON.',
  path: '/video-to-text',
});

export default function VideoToTextPage() {
  const pageUrl = `${siteConfig.url}/video-to-text`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konthora Video to Text Converter',
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
      { '@type': 'ListItem', position: 2, name: 'Video to Text', item: pageUrl },
    ],
  };

  const faqs: FAQItem[] = [
    {
      question: 'How do I convert a video to text?',
      answer:
        'Upload an MP4, WebM, or MOV file. Konthora extracts the audio track, transcribes it with Whisper, and returns a timestamped transcript you can export.',
    },
    {
      question: 'Which video formats work?',
      answer:
        'MP4, WebM, and MOV are all supported. Any audio file formats that share the same workspace also work here.',
    },
    {
      question: 'Are video timestamps included in the transcript?',
      answer:
        'Yes. You get sentence, paragraph, or word-level timestamps and can download them as SRT or VTT subtitle files, TXT, or JSON.',
    },
    {
      question: 'What is the limit on video size?',
      answer:
        'Videos can be up to 100 MB and up to 10 minutes long. Longer videos can be split into parts or trimmed before upload.',
    },
    {
      question: 'Which languages can be transcribed?',
      answer:
        'Konthora transcribes English-language speech. Auto Detect also processes your video as English.',
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
      icon: FileVideo,
      title: 'MP4, WebM, MOV',
      desc: 'Upload the most common video formats and let Konthora find the audio track.',
    },
    {
      icon: Scissors,
      title: 'Automatic extraction',
      desc: 'The audio track is sampled and prepared for transcription for you.',
    },
    {
      icon: Languages,
      title: 'English transcription',
      desc: 'Accurate speech recognition tuned for English-language video and audio.',
    },
    {
      icon: FileDown,
      title: 'TXT, SRT, VTT, JSON',
      desc: 'Export your transcript, subtitles, or timestamped data.',
    },
  ];

  const useCaseCards: InfoCard[] = [
    {
      icon: FileVideo,
      title: 'YouTube and social',
      desc: 'Turn a video into descriptions, captions, and easy-to-search blog posts.',
    },
    {
      icon: FileDown,
      title: 'Subtitles for reach',
      desc: 'Create SRT or VTT captions to make your videos accessible to a wider audience.',
    },
    {
      icon: Clock,
      title: 'Marketers and creators',
      desc: 'Punctuate a video discovery so you can jump straight to the parts that matter.',
    },
    {
      icon: Languages,
      title: 'E-learning and webinars',
      desc: 'Give learners a written version of recorded lessons, tutorials, and briefings.',
    },
  ];

  const steps = [
    {
      title: 'Upload your video',
      desc: 'Drop in an MP4, WebM, or MOV file, up to 100 MB.',
    },
    {
      title: 'Choose timestamp grouping',
      desc: 'Pick sentence, paragraph, or word-level timestamps for your transcript.',
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
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Video to Text' }]} />
          <PageHeader
            title="Video to Text Converter Online"
            description="Upload an MP4, WebM, or MOV video and get an accurate, timestamped transcript. Export it as TXT, SRT, VTT, or JSON."
            badge="Transcription"
          />
          <TranscriptionWorkspace />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow="Capabilities"
        title="What the video transcription workspace supports"
        description="Konthora extracts the audio from your video and turns it into timestamped text. Here is exactly what is supported."
        cards={capabilityCards}
      />

      <StepsSection
        id="how-to-convert-video-to-text"
        eyebrow="How it works"
        title="Convert a video to text in three steps"
        description="Upload a clip and get an accurate, timestamped transcript in minutes."
        steps={steps}
      />

      <InfoSection
        id="use-cases"
        eyebrow="Who it is for"
        title="How people use Konthora video transcription"
        description="Timestamped captions and transcripts for content, learning, and discovery."
        cards={useCaseCards}
        twoCol
      />

      <CrossLinks
        title="Related tools"
        description="Combine video transcription with storytelling and speech generation."
        links={[
          {
            href: '/text-to-speech',
            label: 'Text to Speech',
            description: 'Turn your transcript straight into a natural voiceover to accompany the clip.',
            primary: true,
          },
          {
            href: '/mp3-to-text',
            label: 'MP3 to Text',
            description: 'Does the same extraction for audio-only recordings.',
          },
        ]}
      />

      {/* Tool FAQ Section */}
      <Section className="bg-secondary/10">
        <Container>
          <div className="text-center mb-12" id="video-to-text-faq-heading">
            <h2 className="text-2xl font-bold text-foreground">Video to Text FAQs</h2>
            <p className="mt-2 text-muted-foreground">Common questions about converting video to text.</p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}