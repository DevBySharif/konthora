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
  Gauge,
  AudioLines,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'AI Text-to-Speech Voices Available in Konthora | Konthora',
  description:
    'Explore the American English and British English AI voices available in Konthora. Learn how to choose the right voice for your text-to-speech projects.',
  path: '/voices',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function VoicesPage() {
  const pageUrl = `${siteConfig.url}/voices`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'AI Voices', item: pageUrl },
    ],
  };

  /* ── Voice Data ── */
  const americanVoices = [
    { name: 'Heart', gender: 'Female' },
    { name: 'Bella', gender: 'Female' },
    { name: 'Nicole', gender: 'Female' },
    { name: 'Nova', gender: 'Female' },
    { name: 'Adam', gender: 'Male' },
    { name: 'Michael', gender: 'Male' },
  ];

  const britishVoices = [
    { name: 'Emma', gender: 'Female' },
    { name: 'Isabella', gender: 'Female' },
    { name: 'George', gender: 'Male' },
    { name: 'Lewis', gender: 'Male' },
  ];

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "How many voices are available in Konthora?",
      answer: "Konthora currently exposes 10 distinct English voices: 6 American English voices and 4 British English voices.",
    },
    {
      question: "Are these the only voices available in AI?",
      answer: "No. These are strictly the voices natively supported and exposed by Konthora's current speech workspace. The wider AI industry offers thousands of voices across many languages.",
    },
    {
      question: "Does Konthora support voice cloning?",
      answer: "No. Konthora focuses on high-quality preset voices and does not offer custom voice cloning features.",
    },
    {
      question: "Do I need to pay to use these voices?",
      answer: "No, the voices are available to use for free in your browser without creating an account.",
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
        aria-labelledby="pillar-h1"
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
                <span className="text-foreground font-medium">Voices</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="pillar-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            AI Text-to-Speech Voices{' '}
            <span className="text-gradient">Available in Konthora</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Konthora provides a curated catalogue of 10 English voices for generating natural speech. 
            Learn about the available American and British accents, and how to choose the right voice for your content.
          </p>

        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Voices reference" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Are AI Text-to-Speech Voices? ── */}
            <section aria-labelledby="what-are-voices">
              <h2
                id="what-are-voices"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are AI Text-to-Speech Voices?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  AI text-to-speech voices are digital profiles built to convert written text into spoken audio. 
                  Rather than stringing together individually recorded words, neural voices understand phonetics, 
                  rhythm, and pronunciation, allowing them to read full sentences naturally.
                </p>
                <p>
                  To learn more about the technical process behind this synthesis, read our guide on <Link href="/text-to-speech/how-does-text-to-speech-work" className="text-primary hover:underline">how text-to-speech works</Link>.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: English Voices Available in Konthora ── */}
            <section aria-labelledby="available-voices">
              <h2
                id="available-voices"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                English Voices Available in Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  Konthora currently exposes 10 verified English voices to support a variety of audio workflows. 
                  These are split into two major accent groups: American English and British English.
                </p>
              </div>

              {/* H3: American English Voices */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <Globe2 className="h-5 w-5 text-primary" />
                  <Link href="/voices/american-english-voices" className="hover:underline text-foreground">
                    American English Voices
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There are 6 American English voices available, providing a standard North American pronunciation style.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {americanVoices.map((voice) => (
                    <div key={voice.name} className="flex flex-col p-4 rounded-lg bg-card border border-border/70 text-center">
                      <strong className="text-foreground text-sm font-semibold">{voice.name}</strong>
                      <span className="text-xs text-muted-foreground mt-1">{voice.gender}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* H3: British English Voices */}
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <Globe2 className="h-5 w-5 text-primary" />
                  <Link href="/voices/british-english-voices" className="hover:underline text-foreground">
                    British English Voices
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There are 4 British English voices available, offering a traditional UK pronunciation style.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {britishVoices.map((voice) => (
                    <div key={voice.name} className="flex flex-col p-4 rounded-lg bg-card border border-border/70 text-center">
                      <strong className="text-foreground text-sm font-semibold">{voice.name}</strong>
                      <span className="text-xs text-muted-foreground mt-1">{voice.gender}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How to Choose the Right Voice ── */}
            <section aria-labelledby="choosing-voice">
              <h2
                id="choosing-voice"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How to Choose the Right Voice
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Choosing the right voice depends on the context of your project. Because neural models generate audio based on how they were trained, certain voices naturally fit different styles of content:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Target Audience:</strong> Select an accent (American or British) that aligns with your primary listeners. An American voice reading British slang or spellings may sound slightly unnatural.</li>
                  <li><strong>Content Tone:</strong> Some voices have a brighter, faster delivery suited for social media or marketing videos, while others have a steady, measured pacing better suited for e-learning, audiobooks, or documentaries.</li>
                  <li><strong>Clarity:</strong> When generating technical scripts or complex terminology, you may need to preview several voices to see which one handles the specific jargon most clearly.</li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How Playback Speed Changes the Result ── */}
            <section aria-labelledby="playback-speed">
              <h2
                id="playback-speed"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How Playback Speed Changes the Result
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  In addition to picking a voice, you can heavily influence the final result by adjusting the playback speed. Konthora allows you to modify the speed from <strong>0.75×</strong> (slower) up to <strong>1.25×</strong> (faster).
                </p>
                <div className="flex gap-4 items-start bg-secondary/10 p-5 rounded-lg border border-border/70 mt-4">
                  <Gauge className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      Slowing a voice down can make complex instructions easier to follow, while speeding a voice up can create a sense of urgency or energy. Because the AI is actively rendering the speech, these adjustments preserve pitch and clarity much better than simply speeding up a traditional recording.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How to Preview and Generate Speech ── */}
            <section aria-labelledby="generate-speech">
              <h2
                id="generate-speech"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How to Preview and Generate Speech
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  All 10 voices are available to test in the <Link href="/text-to-speech" className="text-primary hover:underline">text to speech</Link> workspace. 
                  The platform uses a browser-based workflow, meaning you can generate audio immediately without creating an account.
                </p>
                <p>
                  When using the workspace, remember that generations are limited to <strong>2,000 characters</strong> per request to ensure optimal performance. You can export your final voiceover as an <Link href="/formats/mp3-vs-wav" className="text-primary hover:underline">MP3 or WAV</Link> file.
                </p>
                <p className="text-sm border-l-4 border-primary/40 pl-4 italic">
                  Note: Audio files are generated dynamically and stored temporarily. For <Link href="/privacy-policy" className="text-primary hover:underline">privacy</Link> and security, they are not kept permanently on the server. You must download your generated audio during your active browser session.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to try these voices?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your text, select an American or British voice, and generate your audio.
                  </p>
                </div>
                <Link
                  href="/text-to-speech"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  Preview English Voices
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="voices-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="voices-faq-heading"
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
