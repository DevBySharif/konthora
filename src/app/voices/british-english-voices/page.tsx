import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import {
  Globe2,
  AudioLines,
  User,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'British English AI Voices Available in Konthora | Konthora',
  description:
    'Explore the 4 British English AI voices available in Konthora. Learn when to choose a British accent and how to preview and generate natural speech.',
  path: '/voices/british-english-voices',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function BritishEnglishVoicesPage() {
  const pageUrl = `${siteConfig.url}/voices/british-english-voices`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'AI Voices', item: `${siteConfig.url}/voices` },
      { '@type': 'ListItem', position: 3, name: 'British English Voices', item: pageUrl },
    ],
  };

  /* ── Voice Data ── */
  const britishVoices = [
    { name: 'Emma', gender: 'Female' },
    { name: 'Isabella', gender: 'Female' },
    { name: 'George', gender: 'Male' },
    { name: 'Lewis', gender: 'Male' },
  ];

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "How many British English voices does Konthora have?",
      answer: "Konthora provides 4 British English voices: Emma, Isabella, George, and Lewis.",
    },
    {
      question: "Can I adjust the speed of the British voices?",
      answer: "Yes, you can adjust the playback speed of all voices between 0.75× and 1.25× before generating your speech.",
    },
    {
      question: "Are these voices free to use?",
      answer: "Yes, all voices are available to use for free in your browser without creating an account.",
    },
    {
      question: "What audio formats can I export to?",
      answer: "You can download your generated speech as either an MP3 or WAV file during your active browser session.",
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

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />

      {/* ── HERO / INTRO ── */}
      <section
        aria-labelledby="guide-h1"
        className="relative overflow-hidden bg-radial-faint py-16 md:py-24 border-b border-border/40"
      >
        <div
          aria-hidden="true"
          className="orb w-[520px] h-[520px] -top-64 -right-32 bg-primary/10 dark:bg-primary/5"
        />
        <div
          aria-hidden="true"
          className="orb w-[320px] h-[320px] bottom-0 left-0 bg-primary-soft/10"
        />

        <Container className="relative z-10 max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <Link href="/voices" className="hover:text-foreground transition-colors">
                  Voices
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">British English</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="guide-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            British English AI Voices{' '}
            <span className="text-gradient">Available in Konthora</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Explore the 4 British English AI voices available on the platform. Discover when to use a British accent and how to generate natural-sounding speech for your projects.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="British English Voices Guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Are British English AI Voices? ── */}
            <section aria-labelledby="what-are-british-voices">
              <h2
                id="what-are-british-voices"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are British English AI Voices?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  British English AI voices are digital speech profiles specifically trained on datasets of speakers from the United Kingdom. These voices naturally render traditional British pronunciation, rhythm, and common phonetic distinctives.
                </p>
                <p>
                  For a deeper look into the general synthesis process behind these models, read our guide on <Link href="/text-to-speech/how-does-text-to-speech-work" className="text-primary hover:underline">how text-to-speech works</Link>.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: British English Voices Available ── */}
            <section aria-labelledby="available-voices">
              <h2
                id="available-voices"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                British English Voices Available
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Konthora currently offers 4 distinct British English <Link href="/voices" className="text-primary hover:underline">voices</Link>. They are available immediately within the browser workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {britishVoices.map((voice) => (
                  <div key={voice.name} className="flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border/70 text-center hover:border-primary/50 transition-colors">
                    <User className="h-6 w-6 text-primary mb-3" />
                    <strong className="text-foreground text-base font-semibold">{voice.name}</strong>
                    <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{voice.gender}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When to Choose a British English Voice ── */}
            <section aria-labelledby="when-to-choose">
              <h2
                id="when-to-choose"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When to Choose a British English Voice
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Selecting a British accent instead of an American one should primarily be guided by your intended audience and the context of your script.
                </p>
                <ul className="space-y-4 mt-6">
                  <li className="flex gap-4 items-start">
                    <Globe2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">UK and European Audiences:</strong> 
                      If your content is aimed primarily at listeners in the UK or across Europe, a British voice will often sound the most familiar and appropriate.
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Globe2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">British Spelling and Terminology:</strong> 
                      These voices accurately interpret British spellings (e.g., &quot;colour&quot; or &quot;centre&quot;) and local idioms more naturally than their American counterparts.
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Choosing the Right Voice ── */}
            <section aria-labelledby="choosing-right-voice">
              <h2
                id="choosing-right-voice"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Choosing the Right Voice
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Among the 4 British options, you will find variations in cadence and pitch. We recommend previewing a few different voices using a sample sentence from your actual script to see which one delivers the best result for your content.
                </p>
                <p>
                  You can also fine-tune the delivery by adjusting the playback speed between 0.75× and 1.25×, allowing you to match the exact pace required for your project.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preview and Generate Speech ── */}
            <section aria-labelledby="generate-speech">
              <h2
                id="generate-speech"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preview and Generate Speech
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  You can preview all 4 British English voices directly in the <Link href="/text-to-speech" className="text-primary hover:underline">text to speech</Link> workspace. Simply enter up to 2,000 characters of text, select your preferred voice, and generate your audio.
                </p>
                <p>
                  Because the platform uses a temporary, session-based approach, you must download your generated voiceover during your active session as an <Link href="/formats/mp3-vs-wav" className="text-primary hover:underline">MP3 or WAV</Link> file.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to create a voiceover?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try the British English voices now.
                  </p>
                </div>
                <Link
                  href="/text-to-speech"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  Generate Speech
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="british-voices-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="british-voices-faq-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Frequently Asked Questions
            </h2>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}
