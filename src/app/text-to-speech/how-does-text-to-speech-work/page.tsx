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
  FileText,
  Brain,
  Volume2,
  FileAudio,
  AudioLines,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'How Does Text-to-Speech Work? | Konthora',
  description:
    'Learn how text-to-speech works. Understand the major steps from text preparation and pronunciation mapping to voice generation and audio output.',
  path: '/text-to-speech/how-does-text-to-speech-work',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function HowTtsWorksPage() {
  const pageUrl = `${siteConfig.url}/text-to-speech/how-does-text-to-speech-work`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Text to Speech', item: `${siteConfig.url}/text-to-speech` },
      { '@type': 'ListItem', position: 3, name: 'How Does Text-to-Speech Work?', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How Text-to-Speech Works',
    description: 'The major stages a text-to-speech system takes to convert written text into spoken audio.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Step 1: Text Preparation and Normalization',
        text: 'The system cleans the raw input text, expanding abbreviations, numbers, and symbols into their full spoken words.',
      },
      {
        '@type': 'HowToStep',
        name: 'Step 2: Pronunciation and Speech Representation',
        text: 'The system determines how each word should sound based on linguistic rules and context.',
      },
      {
        '@type': 'HowToStep',
        name: 'Step 3: Voice Generation',
        text: 'A neural network or acoustic model converts the linguistic data into a continuous acoustic waveform.',
      },
      {
        '@type': 'HowToStep',
        name: 'Step 4: Audio Output',
        text: 'The waveform is synthesized into a downloadable audio file (like MP3 or WAV).',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "How long does text-to-speech take to generate?",
      answer: "Modern text-to-speech systems usually generate audio faster than real-time. For short sentences, it takes only seconds. On Konthora, generation time depends on the text length up to the 2,000-character limit.",
    },
    {
      question: "Can I adjust how fast the voice speaks?",
      answer: "Yes. Most systems allow you to alter the playback rate. On Konthora, you can adjust the speaking speed between 0.75× and 1.25× before generation.",
    },
    {
      question: "Do I need an account to generate speech on Konthora?",
      answer: "No. You can generate speech directly in your browser without creating an account. Because no account is required, generated audio is only stored temporarily and must be downloaded during your active session.",
    },
    {
      question: "What audio formats can I export?",
      answer: "You can download the final spoken audio in either MP3 (compressed for easy sharing) or WAV (uncompressed for high quality editing) formats.",
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
      <JsonLd schema={howToSchema} />
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
                <Link href="/text-to-speech" className="hover:text-foreground transition-colors">
                  Text to Speech
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">How It Works</span>
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
            How Does Text-to-Speech Work?
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Text-to-speech technology turns written words into natural-sounding audio through a complex process of text normalization, linguistic analysis, and neural audio generation. 
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="How text to speech works guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is Text-to-Speech? ── */}
            <section aria-labelledby="what-is-tts">
              <h2
                id="what-is-tts"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is Text-to-Speech?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Text-to-speech (TTS)</strong> is an assistive technology that reads digital text aloud. It takes written words on a computer or mobile device and converts them into spoken audio. TTS complements rather than replaces dedicated tools —{' '}
                  <Link href="/accessibility/tts-vs-screen-reader" className="text-primary hover:underline">
                    see how TTS compares to screen readers
                  </Link>
                  .
                </p>
                <p>
                  While early text-to-speech systems sounded robotic and disjointed, modern systems use advanced artificial intelligence to produce voices that closely mimic natural human speech rhythms, intonation, and pronunciation.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How Text Becomes Spoken Audio ── */}
            <section aria-labelledby="how-it-works">
              <h2
                id="how-it-works"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How Text Becomes Spoken Audio
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Creating spoken audio from text is not just a matter of matching words to pre-recorded sounds. It requires understanding context, grammar, and pronunciation. A modern <Link href="/text-to-speech" className="text-primary hover:underline">text to speech</Link> system completes this process in four major steps.
                </p>

                <div className="grid gap-6 mt-8">
                  {/* Step 1 */}
                  <div className="flex flex-col sm:flex-row gap-5 bg-card border border-border/70 rounded-xl p-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Step 1: Text Preparation and Normalization
                      </h3>
                      <p className="text-sm">
                        The system cleans the raw input text, expanding abbreviations, numbers, and symbols into their full spoken words. For example, &quot;Dr. Smith paid $10&quot; is translated to &quot;Doctor Smith paid ten dollars.&quot;
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col sm:flex-row gap-5 bg-card border border-border/70 rounded-xl p-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Step 2: Pronunciation and Speech Representation
                      </h3>
                      <p className="text-sm">
                        The system determines how each word should sound based on linguistic rules and context. It breaks words down into phonemes (the distinct sounds of a language) and figures out the correct stress and intonation (prosody). For example, knowing the difference between &quot;I <em>read</em> a book&quot; (present tense) and &quot;I have <em>read</em> a book&quot; (past tense).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col sm:flex-row gap-5 bg-card border border-border/70 rounded-xl p-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                        <AudioLines className="h-5 w-5 text-primary" />
                        Step 3: Voice Generation
                      </h3>
                      <p className="text-sm">
                        A neural network or acoustic model takes the linguistic data and converts it into a continuous acoustic waveform. This is where the specific characteristics of the chosen voice—like tone, accent, and timbre—are applied to the sound. Konthora uses an open-weight neural engine called{' '}
                        <Link href="/entity/kokoro" className="text-primary hover:underline">
                          Kokoro
                        </Link>
                        , an 82-million-parameter model that synthesizes voices efficiently.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col sm:flex-row gap-5 bg-card border border-border/70 rounded-xl p-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                        <Volume2 className="h-5 w-5 text-primary" />
                        Step 4: Audio Output
                      </h3>
                      <p className="text-sm">
                        Finally, the synthesized waveform is packaged into a standardized, playable <Link href="/formats" className="text-primary hover:underline">audio format</Link> file, which is returned to the user for listening or downloading.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: What Affects Text-to-Speech Quality? ── */}
            <section aria-labelledby="quality-factors">
              <h2
                id="quality-factors"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Affects Text-to-Speech Quality?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  While modern AI voices are incredibly realistic, the final audio result depends heavily on a few practical factors:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Input quality:</strong> Proper spelling and punctuation (like commas and periods) give the system vital clues on where to pause and how to inflect the sentence.</li>
                  <li><strong>Language and accent models:</strong> A voice trained specifically on an American English dataset will sound far more natural speaking American English text than a British English voice attempting the same vocabulary.</li>
                  <li><strong>Playback speed:</strong> Extremely fast or extremely slow playback speeds can distort the natural rhythm of the AI voice.</li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How to Generate Speech with Konthora ── */}
            <section aria-labelledby="generate-speech">
              <h2
                id="generate-speech"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How to Generate Speech with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Konthora provides a simple, browser-based workflow for generating high-quality speech. You do not need to create an account, and everything runs directly from your browser.
                </p>
                <p>
                  You can choose from 10 distinct English voices (6 American English and 4 British English). Each request allows you to process up to 2,000 characters of text. Before generating, you can adjust the playback speed of the voice. Once processing is complete, you can download your final voiceover as either an <Link href="/formats/mp3-vs-wav" className="text-primary hover:underline">MP3 or WAV</Link> file.
                </p>
                <p className="text-sm border-l-4 border-primary/40 pl-4 italic">
                  Note: Because Konthora operates a no-account workflow, generated audio is only stored temporarily. You must download your audio files during your active session.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to create a voiceover?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paste your script, choose your favorite voice, and generate audio instantly.
                  </p>
                </div>
                <Link
                  href="/text-to-speech"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <FileAudio className="h-4 w-4" aria-hidden="true" />
                  Open Speech Workspace
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="tts-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="tts-faq-heading"
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
