import React from 'react';
import type { Metadata } from 'next';
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
import { TTS_LANGUAGE_ALTERNATES } from '@/config/tts';
import { Mic2, Volume2, Gauge, Languages, Globe } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Bengali Text to Speech Online Free | Konthora AI Voices',
  description:
    'Convert Bengali (Bangla) text to natural speech online for free. Generate Bengali AI voiceover in 4 native voices, then download as MP3 or WAV.',
  path: '/text-to-speech/bengali',
  languages: TTS_LANGUAGE_ALTERNATES,
});

export default function BengaliTtsPage() {
  const pageUrl = `${siteConfig.url}/text-to-speech/bengali`;

  const webAppSchema = constructSoftwareAppSchema({
    name: 'Konthora Bengali Text to Speech',
    url: pageUrl,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Text to Speech', item: `${siteConfig.url}/text-to-speech` },
      { '@type': 'ListItem', position: 3, name: 'Bengali', item: pageUrl },
    ],
  };

  const faqs: FAQItem[] = [
    {
      question: 'Does Konthora support Bengali text to speech?',
      answer:
        'Yes. Konthora ships native Bengali (Bangla) neural voices that read Bengali text with correct pronunciation, accent, and intonation.',
    },
    {
      question: 'Which Bengali voices are available?',
      answer:
        'There are currently 4 Bengali voices: Nabanita (female, Bangladesh), Pradeep (male, Bangladesh), Bashkar (male, India), and Tanishaa (female, India). Select Bengali in the workspace to browse them.',
    },
    {
      question: 'Can I download Bengali voiceovers as MP3 or WAV?',
      answer:
        'Yes. Once a voiceover is generated you can download it as MP3 for compatibility or high-quality WAV for editing.',
    },
    {
      question: 'Can I adjust the speaking speed for Bengali audio?',
      answer:
        'Yes. The speed control works for every language, including Bengali, from 0.75× up to 1.25× before generating your voiceover.',
    },
    {
      question: 'How long can a Bengali text-to-speech script be?',
      answer:
        'Each job accepts scripts of up to 2,000 characters. Longer content can be processed in separate jobs.',
    },
    {
      question: 'What powers the Bengali voices?',
      answer:
        'Bengali voices run on Microsoft neural voices (the Edge engine), while the English voices use the open Kokoro engine. If Edge is temporarily unreachable, the Bengali voices disappear from the picker until it recovers — the Kokoro voices always stay available.',
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
      icon: Mic2,
      title: '4 Bengali voices',
      desc: 'Nabanita, Pradeep, Bashkar, and Tanishaa — female and male characters for natural Bengali narration.',
    },
    {
      icon: Volume2,
      title: 'MP3 or WAV output',
      desc: 'Download a compact MP3 for sharing or a high-quality WAV for professional Bengali audio editing.',
    },
    {
      icon: Gauge,
      title: 'Adjustable speed',
      desc: 'Fine-tune the tempo of your Bengali narration from 0.75× up to 1.25×.',
    },
    {
      icon: Globe,
      title: 'More languages',
      desc: 'English, Hindi, Spanish, French, Italian, and Portuguese voices are also available in the same workspace.',
    },
  ];

  const useCaseCards: InfoCard[] = [
    {
      icon: Languages,
      title: 'YouTube & social media',
      desc: 'Narrate Bengali explainer videos, shorts, and ad reads with a consistent voice.',
    },
    {
      icon: Mic2,
      title: 'Podcasts & audio drafts',
      desc: 'Hear Bengali scripts read aloud to check tone, timing, and pronunciation before you record.',
    },
    {
      icon: Volume2,
      title: 'E-learning & courses',
      desc: 'Turn Bengali lesson scripts into listenable audio for students learning on the go.',
    },
    {
      icon: Globe,
      title: 'Audiobooks & narration',
      desc: 'Preview long-form Bengali narration and export clean audio for further editing.',
    },
  ];

  const steps = [
    {
      title: 'Switch to Bengali',
      desc: 'Select Bengali (বাংলা) in the workspace language picker to load the Bengali voice set.',
    },
    {
      title: 'Paste your script',
      desc: 'Enter up to 2,000 characters of Bengali text and pick a voice plus speed.',
    },
    {
      title: 'Generate and download',
      desc: 'Generate the voiceover, preview it, and save it as MP3 or WAV.',
    },
  ];

  return (
    <>
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />

      <Section className="pb-6">
        <Container>
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Text to Speech', href: '/text-to-speech' }, { name: 'Bengali' }]} />
          <PageHeader
            title="Bengali Text to Speech Online"
            description="Type Bengali (Bangla) text and turn it into natural AI speech instantly, free, in your browser — with 4 native voices, adjustable speed, and a one-click MP3 or WAV download."
            badge="Speech Workbench · বাংলা"
          />
          <TtsWorkspaceWithPreset />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow="Capabilities"
        title="What the Bengali speech workspace supports"
        description="Konthora renders Bengali text into lifelike audio using Microsoft neural voices. Here is exactly what is supported."
        cards={capabilityCards}
      />

      <StepsSection
        id="how-to-generate-bengali-speech"
        eyebrow="How it works"
        title="Generate Bengali voiceover in three steps"
        description="No account and no install needed — generate natural Bengali audio from text in seconds."
        steps={steps}
      />

      <InfoSection
        id="use-cases"
        eyebrow="Who it is for"
        title="How people use Konthora Bengali TTS"
        description="Bengali AI voiceover for content creators, educators, and localization teams."
        cards={useCaseCards}
        twoCol
      />

      <CrossLinks
        title="Related tools"
        description="Take Bengali speech further with the rest of the Konthora workspace."
        links={[
          {
            href: '/text-to-mp3',
            label: 'Text to MP3',
            description: 'Convert any script into a compact MP3 you can drop into a project.',
            primary: true,
          },
          {
            href: '/text-to-speech',
            label: 'All languages',
            description: 'Switch between English, Bengali, Spanish, Portuguese, French, Italian, and Hindi voices.',
          },
        ]}
      />

      {/* ── Explore language siblings ── */}
      <Section aria-labelledby="explore-lang-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl" id="explore-lang-heading">
              Explore Other Languages
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Konthora&apos;s multilingual text-to-speech also covers these languages in the same workspace.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/text-to-speech/hindi', label: 'Hindi TTS', description: 'Naturalistic Hindi voices for content tailored to Indian audiences.' },
              { href: '/text-to-speech/spanish', label: 'Spanish TTS', description: 'Native Spanish voices for narration and e-learning.' },
              { href: '/text-to-speech/french', label: 'French TTS', description: 'A native French voice for classy voiceovers and tutorials.' },
              { href: '/text-to-speech/italian', label: 'Italian TTS', description: 'Italian female and male voices for video and podcast.' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="group rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{l.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read guide
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
          <div className="text-center mb-12" id="bn-tts-faq-heading">
            <h2 className="text-2xl font-bold text-foreground">Bengali Text to Speech FAQs</h2>
            <p className="mt-2 text-muted-foreground">Answers to common questions about the Bengali voices.</p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}
