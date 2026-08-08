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
  title: 'French Text to Speech Online Free | Konthora AI Voices',
  description:
    'Convert French text to natural speech online for free. Generate French AI voiceover with a native French voice and download as MP3 or WAV.',
  path: '/text-to-speech/french',
});

export default function FrenchTtsPage() {
  const pageUrl = `${siteConfig.url}/text-to-speech/french`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konthora French Text to Speech',
    url: pageUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    inLanguage: 'fr-FR',
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Text to Speech', item: `${siteConfig.url}/text-to-speech` },
      { '@type': 'ListItem', position: 3, name: 'French', item: pageUrl },
    ],
  };

  const faqs: FAQItem[] = [
    {
      question: 'Does Konthora support French text to speech?',
      answer:
        'Yes. Konthora ships a native French neural voice (Siwis) that reads French text with correct pronunciation, liaison, and intonation.',
    },
    {
      question: 'Which French voices are available?',
      answer:
        'There is currently 1 French voice, Siwis (female). Select French in the workspace to use it.',
    },
    {
      question: 'Can I download French voiceovers as MP3 or WAV?',
      answer:
        'Yes. Once a voiceover is generated you can download it as MP3 for compatibility or high-quality WAV for editing.',
    },
    {
      question: 'Can I adjust the speaking speed for French audio?',
      answer:
        'Yes. The speed control works for every language, including French, from 0.75× up to 1.25× before generating your voiceover.',
    },
    {
      question: 'How long can a French text-to-speech script be?',
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
      title: '1 French voice',
      desc: 'Siwis, a female voice tuned for natural French pronunciation and flow.',
    },
    {
      icon: Volume2,
      title: 'MP3 or WAV output',
      desc: 'Download a compact MP3 for sharing or a high-quality WAV for professional French audio editing.',
    },
    {
      icon: Gauge,
      title: 'Adjustable speed',
      desc: 'Fine-tune the tempo of your French narration from 0.75× up to 1.25×.',
    },
    {
      icon: Globe,
      title: 'More languages',
      desc: 'Spanish, Portuguese, Italian, Hindi, and English voices are also available in the same workspace.',
    },
  ];

  const useCaseCards: InfoCard[] = [
    {
      icon: Languages,
      title: 'YouTube & tutorials',
      desc: 'Narrate French explainer videos and walkthroughs with a consistent voice.',
    },
    {
      icon: Mic2,
      title: 'Podcasts & audio drafts',
      desc: 'Hear French scripts read aloud to check tone, timing, and pronunciation before you record.',
    },
    {
      icon: Volume2,
      title: 'E-learning & courses',
      desc: 'Turn French lesson scripts into listenable audio for learners.',
    },
    {
      icon: Globe,
      title: 'Localization & marketing',
      desc: 'Produce quick French voiceovers for product promos and brand messaging.',
    },
  ];

  const steps = [
    {
      title: 'Switch to French',
      desc: 'Select French (Français) in the workspace language picker to load the French voice set.',
    },
    {
      title: 'Paste your script',
      desc: 'Enter up to 2,000 characters of French text and pick a voice plus speed.',
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
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Text to Speech', href: '/text-to-speech' }, { name: 'French' }]} />
          <PageHeader
            title="French Text to Speech Online"
            description="Type French text and turn it into natural AI speech instantly, free, in your browser — with a native French voice, adjustable speed, and a one-click MP3 or WAV download."
            badge="Speech Workbench · Français"
          />
          <TtsWorkspace />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow="Capabilities"
        title="What the French speech workspace supports"
        description="Konthora renders French text into lifelike audio using the open Kokoro voice engine. Here is exactly what is supported."
        cards={capabilityCards}
      />

      <StepsSection
        id="how-to-generate-french-speech"
        eyebrow="How it works"
        title="Generate French voiceover in three steps"
        description="No account and no install needed — generate natural French audio from text in seconds."
        steps={steps}
      />

      <InfoSection
        id="use-cases"
        eyebrow="Who it is for"
        title="How people use Konthora French TTS"
        description="French AI voiceover for content creators, educators, and localization teams."
        cards={useCaseCards}
        twoCol
      />

      <CrossLinks
        title="Related tools"
        description="Take French speech further with the rest of the Konthora workspace."
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
              { href: '/text-to-speech/spanish', label: 'Spanish TTS', description: 'Native Spanish voices for videos, podcasts, and e-learning.' },
              { href: '/text-to-speech/italian', label: 'Italian TTS', description: 'Italian female and male voices for video and podcast.' },
              { href: '/text-to-speech/portuguese', label: 'Portuguese TTS', description: 'Brazilian Portuguese neural voices for narration and lessons.' },
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
          <div className="text-center mb-12" id="fr-tts-faq-heading">
            <h2 className="text-2xl font-bold text-foreground">French Text to Speech FAQs</h2>
            <p className="mt-2 text-muted-foreground">Answers to common questions about the French voice.</p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}