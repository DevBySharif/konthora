import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { TtsWorkspace } from '@/components/tools/TtsWorkspace';
import { InfoSection, StepsSection, CrossLinks, InfoCard } from '@/components/tools/ToolInfoSections';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { FileAudio, Volume2, Gauge, Mic, Music2, Globe } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Text to MP3 Converter Online Free | Konthora Narrator',
  description:
    'Convert text into an MP3 audio file online for free. Type or paste a script, pick a natural AI voice, and download the result as a ready-to-use MP3.',
  path: '/text-to-mp3',
});

export default function TextToMp3Page() {
  const pageUrl = `${siteConfig.url}/text-to-mp3`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konthora Text to MP3 Converter',
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
      { '@type': 'ListItem', position: 2, name: 'Text to MP3', item: pageUrl },
    ],
  };

  const faqs: FAQItem[] = [
    {
      question: 'Is a text to MP3 converter different from text to speech?',
      answer:
        'Both tools use the same neural speech engine. The MP3 converter focuses on the end result you want — a compact, ready-to-share MP3 file — and lets you pick voices across multiple languages.',
    },
    {
      question: 'What languages can I use to create MP3 files?',
      answer:
        'You can generate MP3 audio from English, Spanish, Portuguese, French, Italian, and Hindi text using the native voices available for each language.',
    },
    {
      question: 'Can I download a WAV instead of MP3?',
      answer:
        'Yes. The workspace offers both MP3 and WAV output. Choose MP3 for smaller, web-friendly files or WAV for high-quality editing.',
    },
    {
      question: 'How long can the text I convert to MP3 be?',
      answer:
        'Each conversion job accepts scripts of up to 2,000 characters. Longer content can be split across multiple files.',
    },
    {
      question: 'Are my scripts kept or saved anywhere?',
      answer:
        'No. Your text and the generated audio are processed securely and automatically deleted after 60 minutes.',
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
      title: 'MP3 that is ready to use',
      desc: 'Get a compact MP3 file that drops straight into editors, websites, and messaging apps.',
    },
    {
      icon: Volume2,
      title: '6 languages, 40+ voices',
      desc: 'Pick from English, Spanish, French, Italian, Portuguese, and Hindi AI voices.',
    },
    {
      icon: Mic,
      title: 'Natural neural narration',
      desc: 'Konthora uses the open Kokoro voice engine to produce lifelike narration from plain text.',
    },
    {
      icon: Gauge,
      title: 'Speed control',
      desc: 'Adjust the narration tempo between 0.75× and 1.25× until the delivery feels right.',
    },
  ];

  const useCaseCards: InfoCard[] = [
    {
      icon: Music2,
      title: 'Blog-to-audio',
      desc: 'Give readers an audio version of an article or newsletter they can listen to on the go.',
    },
    {
      icon: Volume2,
      title: 'Audiobook and narration drafts',
      desc: 'Hear your manuscript read aloud before recording, and export chapters as MP3.',
    },
    {
      icon: Mic,
      title: 'Background narration',
      desc: 'Drop a quick narrated voiceover into video, presentation, or ad production.',
    },
    {
      icon: Globe,
      title: 'Localized marketing',
      desc: 'Generate identical reads in several languages and share them as MP3 attachments.',
    },
  ];

  const steps = [
    {
      title: 'Paste your script',
      desc: 'Enter up to 2,000 characters of text you want turned into speech.',
    },
    {
      title: 'Pick a voice and speed',
      desc: 'Choose a language and voice, then adjust the tempo to your liking.',
    },
    {
      title: 'Generate and download MP3',
      desc: 'Wait for synthesis, preview the result, and download the MP3 file.',
    },
  ];

  return (
    <>
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />

      <Section className="pb-6">
        <Container>
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Text to MP3' }]} />
          <PageHeader
            title="Text to MP3 Converter Online"
            description="Type or paste any text and turn it into a natural-sounding MP3 file. Choose from 6 languages, adjust the speed, and download the finished audio in seconds."
            badge="Narrator"
          />
          <TtsWorkspace />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow="Capabilities"
        title="What the MP3 converter supports"
        description="Konthora turns plain text into downloadable MP3 audio using the open Kokoro voice engine. Here is exactly what is supported."
        cards={capabilityCards}
      />

      <StepsSection
        id="how-to-convert-text-to-mp3"
        eyebrow="How it works"
        title="Turn a script into an MP3 in three steps"
        description="No account or install needed — generate a shareable MP3 from text in seconds."
        steps={steps}
      />

      <InfoSection
        id="use-cases"
        eyebrow="Who it is for"
        title="How people use Konthora MP3 narration"
        description="Portable AI narration for content, projects, and everyday sharing."
        cards={useCaseCards}
        twoCol
      />

      <CrossLinks
        title="Related tools"
        description="Pair MP3 narration with transcription to keep your audio workflow in one place."
        links={[
          {
            href: '/text-to-speech',
            label: 'Full text generation workspace',
            description:
              'Use every voice and language Konthora offers, with MP3 and WAV download.',
            primary: true,
          },
          {
            href: '/mp3-to-text',
            label: 'MP3 to Text',
            description: 'Do the reverse: extract a timestamped written transcript from an MP3 file.',
          },
        ]}
      />

      {/* Tool FAQ Section */}
      <Section className="bg-secondary/10">
        <Container>
          <div className="text-center mb-12" id="mp3-faq-heading">
            <h2 className="text-2xl font-bold text-foreground">Text to MP3 FAQs</h2>
            <p className="mt-2 text-muted-foreground">Answers to common questions about creating MP3 audio from text.</p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}