import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FAQ } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { VoicePreviewPlayer } from '@/components/tools/VoicePreviewPlayer';
import { siteConfig } from '@/config/site';
import {
  getAllVoices,
  getVoiceBySlug,
  getRelatedVoices,
  getLanguagePage,
  getVoiceUrl,
} from '@/config/voices';
import {
  Volume2,
  Mic2,
  Gauge,
  CheckCircle2,
  ArrowRight,
  Languages,
} from 'lucide-react';

interface VoicePageProps {
  params: Promise<{ voiceId: string }>;
}

export const dynamic = 'force-static';

export function generateStaticParams() {
  return getAllVoices().map((voice) => ({ voiceId: voice.slug }));
}

export async function generateMetadata({ params }: VoicePageProps): Promise<Metadata> {
  const { voiceId } = await params;
  const voice = getVoiceBySlug(voiceId);
  if (!voice) return {};

  return constructMetadata({
    title: voice.title,
    description: voice.description,
    path: getVoiceUrl(voice.slug),
  });
}

export default async function VoicePage({ params }: VoicePageProps) {
  const { voiceId } = await params;
  const voice = getVoiceBySlug(voiceId);

  if (!voice) {
    notFound();
  }

  const pageUrl = `${siteConfig.url}${getVoiceUrl(voice.slug)}`;
  const related = getRelatedVoices(voice);
  const languagePage = getLanguagePage(voice.language);
  const generateSlug = `${languagePage}?voice=${voice.id}`;
  const homeUrl = siteConfig.url;
  const voicesUrl = `${siteConfig.url}/voices`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
      { '@type': 'ListItem', position: 2, name: 'AI Voices', item: voicesUrl },
      { '@type': 'ListItem', position: 3, name: voice.heading, item: pageUrl },
    ],
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: voice.title,
    url: pageUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: voice.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={faqSchema} />

      {/* ── HERO ── */}
      <section
        aria-labelledby="voice-page-heading"
        className="relative overflow-hidden bg-radial-faint py-14 md:py-20 border-b border-border/40"
      >
        <div
          aria-hidden="true"
          className="orb w-[520px] h-[520px] -top-64 -right-32 bg-primary/10 dark:bg-primary/5"
        />
        <Container className="relative z-10 max-w-4xl">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'AI Voices', href: '/voices' },
              { name: voice.heading },
            ]}
          />

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <Mic2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="inline-block mb-3 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                {voice.language} · {voice.accent}
              </p>
              <h1
                id="voice-page-heading"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight"
              >
                {voice.heading}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {voice.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <VoicePreviewPlayer
              voiceId={voice.id}
              voiceName={voice.shortName}
              accent={voice.accent}
              gender={voice.gender}
              recommended={voice.recommended}
            />
            <Link
              href={generateSlug}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              Generate with this voice
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ── VOICE DETAILS ── */}
      <article aria-label="Voice details" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-14">
            <section aria-labelledby="voice-intro-heading" className="space-y-4 text-muted-foreground leading-relaxed">
              <h2 id="voice-intro-heading" className="text-2xl font-bold text-foreground">
                About the {voice.shortName} voice
              </h2>
              <p>{voice.intro}</p>
              <p>
                To use {voice.shortName}, open the <Link href={languagePage} className="text-primary hover:underline">{languageLabel(voice.language)} text-to-speech</Link> workspace, select {languageLabel(voice.language)} as the language, pick {voice.shortName} from the voice picker, and generate your audio as MP3 or WAV.
              </p>
            </section>

            <hr className="border-border/40" />

            {/* ── Spec table ── */}
            <section aria-labelledby="voice-specs-heading">
              <h2 id="voice-specs-heading" className="text-2xl font-bold text-foreground mb-6">
                {voice.shortName} voice specifications
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: 'Voice name', value: voice.shortName },
                      { label: 'Voice ID', value: voice.id },
                      { label: 'Language', value: languageLabel(voice.language) },
                      { label: 'Accent', value: voice.accent },
                      { label: 'Gender', value: voice.gender === 'female' ? 'Female' : 'Male' },
                      {
                        label: 'Recommendation status',
                        value: voice.recommended
                          ? 'Recommended (default pick in the voice picker)'
                          : 'Available (not marked as recommended)',
                      },
                      {
                        label: 'Default speed',
                        value: `${voice.defaultSpeed}×`,
                      },
                      {
                        label: 'Speed range',
                        value: `${voice.minimumSpeed}× – ${voice.maximumSpeed}×`,
                      },
                      { label: 'Output formats', value: 'MP3, WAV' },
                    ].map((row, index) => (
                      <tr
                        key={row.label}
                        className={index % 2 === 0 ? 'bg-background' : 'bg-secondary/10'}
                      >
                        <th
                          scope="row"
                          className="px-5 py-3 text-left font-medium text-muted-foreground align-top w-1/3"
                        >
                          {row.label}
                        </th>
                        <td className="px-5 py-3 text-foreground">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── Use cases ── */}
            <section aria-labelledby="voice-use-cases-heading">
              <h2 id="voice-use-cases-heading" className="text-2xl font-bold text-foreground mb-5">
                Good uses for {voice.shortName}
              </h2>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                {voice.useCases.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="border-border/40" />

            {/* ── Speed note ── */}
            <section aria-labelledby="voice-speed-heading" className="flex gap-4 items-start bg-secondary/10 p-5 rounded-lg border border-border/70">
              <Gauge className="h-6 w-6 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 id="voice-speed-heading" className="font-semibold text-foreground">
                  Playback speed
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {voice.shortName} reads at a default speed of {voice.defaultSpeed}×. You can slow it down to {voice.minimumSpeed}× for clearer pacing or speed it up to {voice.maximumSpeed}× for a faster read, without changing the pitch.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── Related voices ── */}
            {related.length > 0 && (
              <section aria-labelledby="voice-related-heading">
                <h2 id="voice-related-heading" className="text-2xl font-bold text-foreground mb-6">
                  Other voices to compare
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((rel) => (
                    <Link
                      key={rel.id}
                      href={getVoiceUrl(rel.slug)}
                      className="group rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Mic2 className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {rel.shortName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {rel.gender === 'female' ? 'Female' : 'Male'} · {rel.accent}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {rel.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        View voice
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <hr className="border-border/40" />

            {/* ── CTA ── */}
            <section aria-labelledby="voice-cta-heading">
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                <div className="flex-1">
                  <h2 id="voice-cta-heading" className="font-semibold text-foreground">
                    Ready to try {voice.shortName}?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Open the workspace with {voice.shortName} pre-selected, type your script, and download the audio as MP3 or WAV.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <Languages className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    Konthora supports six languages in the workspace — or explore
                    all <Link href="/voices" className="text-primary hover:underline">voices in Konthora</Link>.
                  </p>
                </div>
                <Link
                  href={generateSlug}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Generate speech with {voice.shortName}
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </article>

      {/* ── FAQ ── */}
      <Section className="bg-secondary/10" id={`${voice.slug}-faq-section`}>
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2 id={`${voice.slug}-faq-heading`} className="text-2xl sm:text-3xl font-bold text-foreground">
              {voice.shortName} voice FAQs
            </h2>
            <p className="mt-2 text-muted-foreground">
              Answers to common questions about {voice.shortName} and {languageLabel(voice.language)} text to speech.
            </p>
          </div>
          <FAQ items={voice.faqs} />
        </Container>
      </Section>
    </>
  );
}

function languageLabel(language: string): string {
  switch (language) {
    case 'hi-IN':
      return 'Hindi';
    case 'es':
      return 'Spanish';
    case 'fr-FR':
      return 'French';
    case 'it':
      return 'Italian';
    case 'pt-BR':
      return 'Portuguese';
    default:
      return 'English';
  }
}
