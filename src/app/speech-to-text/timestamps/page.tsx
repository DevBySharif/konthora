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
  Clock,
  Mic,
  ArrowRight,
  CheckCircle2,
  FileText,
  AlignLeft,
  ListFilter,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata — canonical, unique title & description
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'Transcription Timestamps: Sentence, Paragraph, and Word-Level Explained | Konthora',
  description:
    'Learn how sentence-level, paragraph-level, and word-level audio transcription timestamps work, when to use each mode, and how to export timestamped transcripts.',
  path: '/speech-to-text/timestamps',
});

export default function TranscriptionTimestampsPage() {
  const pageUrl = `${siteConfig.url}/speech-to-text/timestamps`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Speech to Text',
        item: `${siteConfig.url}/speech-to-text`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Transcription Timestamps',
        item: pageUrl,
      },
    ],
  };

  /* ── Schema: Article ── */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Transcription Timestamps: Sentence, Paragraph, and Word-Level Explained',
    description:
      'A comprehensive guide explaining sentence-level, paragraph-level, and word-level audio transcription timestamps, their differences, use cases, and export options.',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Konthora',
      url: siteConfig.url,
    },
    mainEntityOfPage: pageUrl,
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: 'What is the difference between sentence and word-level timestamps?',
      answer:
        'Sentence-level timestamps group full sentences with a single start and end time, producing readable blocks. Word-level timestamps record exact start and end timing down to the millisecond for every individual spoken word.',
    },
    {
      question: 'Which timestamp mode is best for subtitles?',
      answer:
        'Sentence-level timestamps are best for SRT and VTT subtitle files because subtitle timing must align with complete, readable lines of dialogue on screen.',
    },
    {
      question: 'Do all export formats include timestamps?',
      answer:
        'No. Plain TXT exports omit timestamp markers for clean reading. SRT, VTT, and JSON exports include formatted timeline timestamps based on your selected grouping mode.',
    },
    {
      question: 'Can I change the timestamp mode after transcribing?',
      answer:
        'You select your timestamp mode before starting transcription. If you need a different timestamp grouping, select the new mode and run the transcription again.',
    },
    {
      question: 'How accurate are word-level timestamps?',
      answer:
        'Accuracy depends on audio clarity, microphone quality, background noise, and speaking pace. Konthora uses the Whisper speech recognition model to align timing data with audio frames.',
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
      <JsonLd schema={articleSchema} />
      <JsonLd schema={faqSchema} />

      {/* ── HERO ── */}
      <section
        aria-labelledby="timestamps-h1"
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
          {/* Breadcrumbs */}
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
                <Link
                  href="/speech-to-text"
                  className="hover:text-foreground transition-colors"
                >
                  Speech to Text
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">Timestamps Explained</span>
              </li>
            </ol>
          </nav>

          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Feature Reference
          </p>

          <h1
            id="timestamps-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Transcription Timestamps:{' '}
            <span className="text-gradient">
              Sentence, Paragraph, and Word-Level Explained
            </span>
          </h1>

          {/* Search Promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Transcription timestamps mark the exact time in an audio file when each word or phrase
            was spoken. Konthora&rsquo;s audio-to-text tool offers three timestamp modes:
            sentence-level (one timestamp per sentence), paragraph-level (grouped by speech pauses),
            and word-level (individual timestamp for every word). The right mode depends on your
            intended use: SRT captions, research notes, or word-search archives.
          </p>

          {/* Primary CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/audio-to-text"
              id="timestamps-hero-cta"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              Try Transcription with Timestamps — Free
            </Link>
          </div>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Transcription timestamps guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">
            {/* ── H2: What Are Transcription Timestamps? ── */}
            <section aria-labelledby="what-are-timestamps">
              <h2
                id="what-are-timestamps"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are Transcription Timestamps?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Transcription timestamps are timecode markers linked to specific text segments
                  in an audio or video transcript. They indicate when a spoken line begins and
                  ends relative to the start of the recording.
                </p>
                <p>
                  If you are learning{' '}
                  <Link
                    href="/speech-to-text/how-to-transcribe-audio"
                    className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                  >
                    how to transcribe audio
                  </Link>
                  , choosing the correct timestamp granularity is one of the most important steps.
                  Timestamps turn raw text into an interactive index that lets readers match
                  written quotes back to exact audio moments.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Sentence-Level Timestamps ── */}
            <section aria-labelledby="sentence-timestamps">
              <h2
                id="sentence-timestamps"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
              >
                Sentence-Level Timestamps
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Sentence-level timestamps group text into complete grammatical sentences, assigning
                a single start time and end time to each sentence.
              </p>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  When to Use Sentence Timestamps
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>
                      Video subtitles and video editing: perfect for SRT and VTT exports where
                      text lines must stay readable on screen.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>
                      Podcast episode transcripts and show notes for content creators creating{' '}
                      <span className="font-medium text-foreground">subtitles and captions</span>.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>
                      Reading documents where grammatical flow is more important than millisecond-level word timing.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Paragraph-Level Timestamps ── */}
            <section aria-labelledby="paragraph-timestamps">
              <h2
                id="paragraph-timestamps"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
              >
                Paragraph-Level Timestamps
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Paragraph-level timestamps aggregate speech segments between longer natural speech
                pauses, creating broader blocks of text with start and end timestamps for whole paragraphs.
              </p>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <AlignLeft className="h-5 w-5 text-primary" aria-hidden="true" />
                  When to Use Paragraph Timestamps
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Meeting notes, executive summaries, and long lectures.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Legal depositions and oral history documentation.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Continuous reading experiences with minimal visual clutter.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Word-Level Timestamps ── */}
            <section aria-labelledby="word-timestamps">
              <h2
                id="word-timestamps"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
              >
                Word-Level Timestamps
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Word-level timestamps track the exact start time and end time of every single
                spoken word down to the millisecond.
              </p>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ListFilter className="h-5 w-5 text-primary" aria-hidden="true" />
                  When to Use Word-Level Timestamps
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Academic research, phonetic analysis, and audio indexing.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Precision audio cutting and automated video highlight clipping.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>JSON data exports for developer integrations and custom media players.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Which Timestamp Mode Should You Use? ── */}
            <section aria-labelledby="mode-comparison">
              <h2
                id="mode-comparison"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Which Timestamp Mode Should You Use?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Compare Konthora&rsquo;s three timestamp modes across granularity, readability,
                editing convenience, and export suitability.
              </p>

              {/* Responsive Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-border/70 shadow-card">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="bg-secondary/50 text-xs uppercase font-semibold text-foreground border-b border-border/70">
                    <tr>
                      <th scope="col" className="p-4">Timestamp Mode</th>
                      <th scope="col" className="p-4">Granularity</th>
                      <th scope="col" className="p-4">Readability</th>
                      <th scope="col" className="p-4">Editing Convenience</th>
                      <th scope="col" className="p-4">Typical Use Case</th>
                      <th scope="col" className="p-4">Export Suitability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-card">
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <th scope="row" className="p-4 font-semibold text-foreground whitespace-nowrap">
                        Sentence-Level
                      </th>
                      <td className="p-4">Medium (per sentence)</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">High</td>
                      <td className="p-4">High</td>
                      <td className="p-4">Subtitles, show notes</td>
                      <td className="p-4 font-mono text-xs">SRT, VTT, TXT</td>
                    </tr>
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <th scope="row" className="p-4 font-semibold text-foreground whitespace-nowrap">
                        Paragraph-Level
                      </th>
                      <td className="p-4">Low (per speech block)</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">Very High</td>
                      <td className="p-4">Medium</td>
                      <td className="p-4">Lectures, meeting notes</td>
                      <td className="p-4 font-mono text-xs">TXT, VTT</td>
                    </tr>
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <th scope="row" className="p-4 font-semibold text-foreground whitespace-nowrap">
                        Word-Level
                      </th>
                      <td className="p-4">High (per word)</td>
                      <td className="p-4 text-amber-600 dark:text-amber-400 font-medium">Low (Dense)</td>
                      <td className="p-4">Very High (Precision)</td>
                      <td className="p-4">Research, audio editing</td>
                      <td className="p-4 font-mono text-xs">JSON</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How Timestamps Appear in Each Export Format ── */}
            <section aria-labelledby="export-formats">
              <h2
                id="export-formats"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How Timestamps Appear in Each Export Format
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Understand how timestamps are formatted across different export files generated by
                Konthora. You can also turn text into speech using our free{' '}
                <Link
                  href="/text-to-speech"
                  className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  text-to-speech tool
                </Link>
                .
              </p>

              <div className="space-y-8">
                {/* H3: SRT Format */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">SRT Format</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    SubRip files use sequential line numbers followed by start and end timestamps in
                    <code className="mx-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">
                      HH:MM:SS,mmm
                    </code>{' '}
                    format.
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-secondary/50 p-4 font-mono text-xs text-foreground leading-relaxed border border-border/50">
{`1
00:00:01,200 --> 00:00:04,500
Welcome to Konthora's audio transcription workspace.

2
00:00:04,800 --> 00:00:08,100
Choose sentence or word timestamps for your file.`}
                  </pre>
                </div>

                {/* H3: VTT Format */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">VTT Format</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    WebVTT headers begin with <code className="font-mono text-xs">WEBVTT</code> and use period delimiters for milliseconds:
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-secondary/50 p-4 font-mono text-xs text-foreground leading-relaxed border border-border/50">
{`WEBVTT

00:00:01.200 --> 00:00:04.500
Welcome to Konthora's audio transcription workspace.

00:00:04.800 --> 00:00:08.100
Choose sentence or word timestamps for your file.`}
                  </pre>
                </div>

                {/* H3: TXT Format */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">TXT Format</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Plain text exports strip all timecode headers, providing clean prose for reading documents.
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-secondary/50 p-4 font-mono text-xs text-foreground leading-relaxed border border-border/50">
{`Welcome to Konthora's audio transcription workspace.
Choose sentence or word timestamps for your file.`}
                  </pre>
                </div>

                {/* H3: JSON Format */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">JSON Format</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Structured JSON provides segment objects containing raw floating-point second offsets and individual word objects.
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-secondary/50 p-4 font-mono text-xs text-foreground leading-relaxed border border-border/50">
{`[
  {
    "id": 0,
    "start": 1.20,
    "end": 4.50,
    "text": "Welcome to Konthora's audio transcription workspace."
  }
]`}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="timestamps-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <p className="inline-block mb-3 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Common questions
            </p>
            <h2
              id="timestamps-faq-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Frequently Asked Questions
            </h2>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>

      {/* ── CLOSING CTA ── */}
      <section
        aria-labelledby="timestamps-closing-cta-heading"
        className="py-16 md:py-24 border-t border-border/40 bg-radial-faint"
      >
        <Container className="max-w-3xl text-center">
          <h2
            id="timestamps-closing-cta-heading"
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            Ready to generate timestamped transcripts?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Upload an audio or video file and choose sentence, paragraph, or word timestamps. Free,
            private, and automatically deleted after 60 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/audio-to-text"
              id="timestamps-closing-cta"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Clock className="h-5 w-5" aria-hidden="true" />
              Try Transcription with Timestamps — Free
            </Link>
            <Link
              href="/speech-to-text"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-semibold text-foreground hover:bg-secondary/50 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Speech to Text Overview
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
