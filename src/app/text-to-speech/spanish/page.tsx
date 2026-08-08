import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
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
import { Mic2, Volume2, Gauge, Languages, Globe } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Spanish Text to Speech Online Free | Konthora AI Voices',
  description:
    'Convert Spanish text to natural speech online for free. Generate Latin-American and Castilian-friendly AI voiceover in 3 Spanish voices, then download as MP3 or WAV.',
  path: '/text-to-speech/spanish',
});

export default function SpanishTtsPage() {
  const pageUrl = `${siteConfig.url}/text-to-speech/spanish`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konthora Spanish Text to Speech',
    url: pageUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    inLanguage: 'es',
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Text to Speech', item: `${siteConfig.url}/text-to-speech` },
      { '@type': 'ListItem', position: 3, name: 'Spanish', item: pageUrl },
    ],
  };

  const faqs: FAQItem[] = [
    {
      question: 'Does Konthora support Spanish text to speech?',
      answer:
        'Yes. Konthora ships native Spanish neural voices (Dora, Alex, and Santa) that read Spanish text with correct pronunciation, accent, and intonation.',
    },
    {
      question: 'Which Spanish voices are available?',
      answer:
        'There are currently 3 Spanish voices: Dora (female), Alex (male), and Santa (male). Select Spanish in the workspace to browse them.',
    },
    {
      question: 'Can I download Spanish voiceovers as MP3 or WAV?',
      answer:
        'Yes. Once a voiceover is generated you can download it as MP3 for compatibility or high-quality WAV for editing.',
    },
    {
      question: 'Can I adjust the speaking speed for Spanish audio?',
      answer:
        'Yes. The speed control works for every language, including Spanish, from 0.75× up to 1.25× before generating your voiceover.',
    },
    {
      question: 'How long can a Spanish text-to-speech script be?',
      answer:
        'Each job accepts scripts of up to 2,000 characters. Longer content can be processed in separate jobs.',
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
      title: '3 Spanish voices',
      desc: 'Dora, Alex, and Santa — female and male characters tuned for Latin American and Iberian pronunciation.',
    },
    {
      icon: Volume2,
      title: 'MP3 or WAV output',
      desc: 'Download a compact MP3 for sharing or a high-quality WAV for professional Spanish audio editing.',
    },
    {
      icon: Gauge,
      title: 'Adjustable speed',
      desc: 'Fine-tune the tempo of your Spanish narration from 0.75× up to 1.25×.',
    },
    {
      icon: Globe,
      title: 'More languages',
      desc: 'Portuguese, French, Italian, Hindi, and English voices are also available in the same workspace.',
    },
  ];

  const useCaseCards: InfoCard[] = [
    {
      icon: Languages,
      title: 'YouTube & social media',
      desc: 'Narrate Spanish explainer videos, shorts, and ad reads with a consistent voice.',
    },
    {
      icon: Mic2,
      title: 'Podcasts & audio drafts',
      desc: 'Hear Spanish scripts read aloud to check tone, timing, and pronunciation before you record.',
    },
    {
      icon: Volume2,
      title: 'E-learning & courses',
      desc: 'Turn Spanish lesson scripts into listenable audio for students learning on the go.',
    },
    {
      icon: Globe,
      title: 'Audiobooks & narration',
      desc: 'Preview long-form Spanish narration and export clean audio for further editing.',
    },
  ];

  const steps = [
    {
      title: 'Switch to Spanish',
      desc: 'Select Spanish (Español) in the workspace language picker to load the Spanish voice set.',
    },
    {
      title: 'Paste your script',
      desc: 'Enter up to 2,000 characters of Spanish text and pick a voice plus speed.',
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
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Text to Speech', href: '/text-to-speech' }, { name: 'Spanish' }]} />
          <PageHeader
            title="Spanish Text to Speech Online"
            description="Type Spanish text and turn it into natural AI speech instantly, free, in your browser — with 3 native voices, adjustable speed, and a one-click MP3 or WAV download."
            badge="Speech Workbench · Español"
          />
          <TtsWorkspace />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow="Capabilities"
        title="What the Spanish speech workspace supports"
        description="Konthora renders Spanish text into lifelike audio using the open Kokoro voice engine. Here is exactly what is supported."
        cards={capabilityCards}
      />

      <StepsSection
        id="how-to-generate-spanish-speech"
        eyebrow="How it works"
        title="Generate Spanish voiceover in three steps"
        description="No account and no install needed — generate natural Spanish audio from text in seconds."
        steps={steps}
      />

      <InfoSection
        id="use-cases"
        eyebrow="Who it is for"
        title="How people use Konthora Spanish TTS"
        description="Spanish AI voiceover for content creators, educators, and localization teams."
        cards={useCaseCards}
        twoCol
      />

      <CrossLinks
        title="Related tools"
        description="Take Spanish speech further with the rest of the Konthora workspace."
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
            description: 'Switch between English, Spanish, Portuguese, French, Italian, and Hindi voices.',
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
              { href: '/text-to-speech/portuguese', label: 'Portuguese TTS', description: 'Brazilian Portuguese neural voices for narration and e-learning.' },
              { href: '/text-to-speech/french', label: 'French TTS', description: 'A native French voice for classy voiceovers and tutorials.' },
              { href: '/text-to-speech/italian', label: 'Italian TTS', description: 'Italian female and male voices for video and podcast.' },
              { href: '/text-to-speech/hindi', label: 'Hindi TTS', description: 'Naturalistic Hindi voices for content tailored to Indian audiences.' },
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
          <div className="text-center mb-12" id="es-tts-faq-heading">
            <h2 className="text-2xl font-bold text-foreground">Spanish Text to Speech FAQs</h2>
            <p className="mt-2 text-muted-foreground">Answers to common questions about the Spanish voices.</p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}