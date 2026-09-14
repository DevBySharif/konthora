import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/metadata';
import { constructSoftwareAppSchema } from '@/lib/schema';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { TtsWorkspaceWithPreset } from '@/components/tools/TtsWorkspaceWithPreset';
import { InfoSection, StepsSection, CrossLinks, InfoCard } from '@/components/tools/ToolInfoSections';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Volume2, Mic2, Gauge, FileAudio } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Free AI Text to Speech Online | Kokoro TTS Studio',
  description:
    'Free AI text to speech generator powered by Kokoro neural voice studio. Convert text into natural speech with 41 AI voices in 6 languages, with MP3 and WAV export.',
  path: '/text-to-speech',
});

export default function TextToSpeechPage() {
  const pageUrl = `${siteConfig.url}/text-to-speech`;

  const webAppSchema = constructSoftwareAppSchema({
    name: 'Konthora Free AI Text to Speech Online',
    url: pageUrl,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Text to Speech', item: pageUrl },
    ],
  };

  const ttsFaqs: FAQItem[] = [
    {
      question: 'What is the character limit for text generation?',
      answer:
        'Each speech job accepts text scripts of up to 2,000 characters. This keeps queue times fast and server resources focused, and you can run separate jobs for longer scripts.',
    },
    {
      question: 'Which voices and accents are supported?',
      answer:
        'Konthora provides 41 AI voices across English, Hindi, Spanish, French, Italian, and Portuguese, with American and British English options among the catalogue.',
    },
    {
      question: 'Which audio formats can I download?',
      answer:
        'You can download each voiceover as MP3 for broad compatibility, or as high-quality WAV for lossless editing.',
    },
    {
      question: 'Can I adjust the speaking speed?',
      answer:
        'Yes. You can control speech speed from 0.75× up to 1.25× before generating your voiceover.',
    },
    {
      question: 'Can I use the generated speech in commercial projects?',
      answer:
        'Yes. Voiceovers you generate are yours to use in podcasts, video projects, presentations, or ads, provided your input content is legal to use.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ttsFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const capabilityCards: InfoCard[] = [
    {
      icon: Mic2,
      title: '41 AI voices',
      desc: 'A growing voice catalogue with clear preview controls and language-specific selections.',
    },
    {
      icon: Volume2,
      title: '6 languages',
      desc: 'Create speech in English, Hindi, Spanish, French, Italian, and Portuguese.',
    },
    {
      icon: Gauge,
      title: 'MP3 or WAV',
      desc: 'Fine-tune pace anywhere between 0.75× and 1.25× to match your script and audience.',
    },
    {
      icon: FileAudio,
      title: 'Free in your browser',
      desc: 'Generate natural speech for scripts up to 2,000 characters per request, with no install.',
    },
  ];

  const useCaseCards: InfoCard[] = [
    {
      icon: FileAudio,
      title: 'Video voiceovers',
      desc: 'Narrate explainer videos, social clips, or product demos with a consistent, natural voice.',
    },
    {
      icon: Volume2,
      title: 'E-learning & courses',
      desc: 'Turn written lessons into audio so learners can study on the go.',
    },
    {
      icon: Mic2,
      title: 'Podcast & audio drafts',
      desc: 'Hear scripts read aloud to check tone and timing before you record.',
    },
    {
      icon: Gauge,
      title: 'Accessibility support',
      desc: 'Give a listening option to written content for users who prefer audio.',
    },
  ];

  const steps = [
    {
      title: 'Write or paste your script',
      desc: 'Enter up to 2,000 characters of text directly in the workspace above.',
    },
    {
      title: 'Choose voice, language and speed',
      desc: 'Pick a language and voice, then set the pace that fits your content.',
    },
    {
      title: 'Generate and download',
      desc: 'Generate a voiceover, preview it, and save it as MP3 or WAV.',
    },
  ];

  return (
    <>
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />

      <Section className="pb-4">
        <Container>
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Text to Speech' }]} />
          <PageHeader
            title="Free AI Text to Speech Online"
            description="Convert written scripts into natural-sounding speech in six languages, with customizable voices, adjustable speeds, and a one-click MP3 or WAV download."
            badge="Speech Workbench"
          />
          <TtsWorkspaceWithPreset />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow="Capabilities"
        title="Everything the speech workspace supports"
        description="Konthora provides free, browser-based text-to-speech powered by the open Kokoro voice model. Here is exactly what is supported."
        cards={capabilityCards}
        compact
      />

      <StepsSection
        id="how-to-generate-speech"
        eyebrow="How it works"
        title="Generate a voiceover in three steps"
        description="Generate natural speech from text in seconds, with no account and no install needed."
        steps={steps}
        compact
      />

      <InfoSection
        id="use-cases"
        eyebrow="Who it is for"
        title="How people use Konthora text to speech"
        description="Free AI voiceovers for creative projects and everyday content creation."
        cards={useCaseCards}
        twoCol
        compact
      />

      <CrossLinks
        title="Related tools"
        description="Pair speech generation with transcription to go from text to speech and back."
        links={[
          {
            href: siteConfig.links.audioToText,
            label: 'Audio to Text with Timestamps',
            description:
              'Transcribe audio or video into timestamped text and export as TXT, SRT, VTT, or JSON.',
            primary: true,
          },
          {
            href: siteConfig.links.home,
            label: 'All Konthora tools',
            description: 'Return to the home page and browse every browser-based audio tool we offer.',
          },
        ]}
        compact
      />

      {/* ── Explore Guides ── */}
      <Section aria-labelledby="explore-guides-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl" id="explore-guides-heading">
              Explore Text-to-Speech Guides
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Learn more about how the technology works, explore voice options, and discover practical use cases.
            </p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: '/text-to-speech/how-does-text-to-speech-work',
                label: 'How it works',
                description: 'Understand the technology behind AI speech generation.',
              },
              {
                href: '/voices',
                label: 'Explore AI Voices',
                description: 'Listen to and select from our American and British English voices.',
              },
              {
                href: '/text-to-speech-for-youtube-videos',
                label: 'YouTube Videos',
                description: 'Generate consistent voiceovers for your YouTube channel.',
              },
              {
                href: '/text-to-speech-for-podcasts',
                label: 'Podcasts',
                description: 'Draft podcast scripts and hear them spoken aloud.',
              },
              {
                href: '/text-to-speech-for-presentations',
                label: 'Presentations',
                description: 'Add clear audio narration to your slides.',
              },
              {
                href: '/text-to-speech-for-elearning',
                label: 'E-Learning',
                description: 'Convert written courses into accessible audio lessons.',
              },
              {
                href: '/text-to-speech-for-social-media',
                label: 'Social Media',
                description: 'Create engaging voiceovers for short-form video content.',
              },
              {
                href: '/text-to-speech-for-audiobooks',
                label: 'Audiobooks',
                description: 'Turn chapters of text into continuous spoken audio.',
              },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-xl border border-border/70 bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {l.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read guide
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Explore languages & formats ── */}
      <Section aria-labelledby="explore-lang-formats-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl" id="explore-lang-formats-heading">
              Explore Languages & Formats
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Make voiceovers in other languages, or convert any script straight into an MP3 file.
            </p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: '/text-to-speech/spanish', label: 'Spanish Text to Speech', description: 'Generate natural Spanish voiceovers with native voices.' },
              { href: '/text-to-speech/hindi', label: 'Hindi Text to Speech', description: 'Create natural Hindi narration for Indian audiences.' },
              { href: '/text-to-speech/french', label: 'French Text to Speech', description: 'A natural French voice for tutorials and ads.' },
              { href: '/text-to-speech/italian', label: 'Italian Text to Speech', description: 'Italian female and male voices for video and podcast.' },
              { href: '/text-to-speech/portuguese', label: 'Portuguese Text to Speech', description: 'Brazilian Portuguese voices for narration and lessons.' },
              { href: '/text-to-mp3', label: 'Text to MP3 Converter', description: 'Turn any script into a compact, downloadable MP3 file.' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-xl border border-border/70 bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {l.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read guide
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Tool FAQ Section */}
      <Section className="bg-secondary/10">
        <Container>
          <div className="text-center mb-12" id="tts-faq-heading">
            <h2 className="text-2xl font-bold text-foreground">Text to Speech FAQs</h2>
            <p className="mt-2 text-muted-foreground">Frequently asked questions about our speech workspace.</p>
          </div>
          <FAQ items={ttsFaqs} />
        </Container>
      </Section>
    </>
  );
}
