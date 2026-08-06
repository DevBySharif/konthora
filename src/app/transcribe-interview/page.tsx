import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { FileText } from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: "How to Transcribe an Interview | Konthora",
  description:
    "Learn how to convert interview recordings into readable text. Understand how to manage media limits, apply timestamps, and export your transcript.",
  path: '/transcribe-interview',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TranscribeInterviewPage() {
  const pageUrl = `${siteConfig.url}/transcribe-interview`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: `${siteConfig.url}/speech-to-text` },
      { '@type': 'ListItem', position: 3, name: 'Transcribe an Interview', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe an Interview with Konthora',
    description: 'A 5-step workflow to convert short interview recordings into text.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare a supported interview recording within the current limits',
        text: 'Ensure your file is under 100 MB and 10 minutes in length. Divide longer interviews into multiple files before beginning.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload the audio or video file',
        text: 'Select your media and upload it to the tool. You do not need to create an account.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose sentence, paragraph, or word-level timestamps',
        text: 'Select how the text should be grouped to aid your review process.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Start transcription',
        text: 'Click the button to process your media and wait for the extraction to finish.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Export the result as TXT, SRT, VTT, or JSON',
        text: 'Download your final transcript to your device before your active session expires.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I upload a 45-minute interview?",
      answer: "No. Konthora accepts media up to 10 minutes in duration. Longer interviews must be divided into shorter files before upload.",
    },
    {
      question: "Are video interviews supported?",
      answer: "Yes. We support audio and video transcription. Supported video inputs include MP4, WebM, and MOV, and supported audio inputs include MP3, WAV, M4A, and AAC.",
    },
    {
      question: "Is my interview recording kept private?",
      answer: "Uploaded media and generated transcript data follow a temporary 60-minute lifecycle. They are not stored permanently.",
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
        aria-labelledby="transcribe-interview-h1"
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
                <Link href="/speech-to-text" className="hover:text-foreground transition-colors">
                  Speech to Text
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">Transcribe an Interview</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="transcribe-interview-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            How to Transcribe an <span className="text-gradient">Interview</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Reviewing long conversations is faster when you can read the text instead of replaying the audio. Learn how to prepare your interview recording, choose the right timestamp mode, and export your final document.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Interview transcription guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Transcribe an Interview? ── */}
            <section aria-labelledby="why-transcribe">
              <h2
                id="why-transcribe"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Transcribe an Interview?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Researchers, journalists, and content creators use <Link href="/speech-to-text" className="text-primary hover:underline">speech-to-text</Link> to convert interview recordings into readable text. Having a written record makes it easy to search for specific quotes, verify facts, and pull highlights for articles or reports.
                </p>
                <p>
                  Turning <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> streamlines the review process, allowing you to visually scan a document rather than scrubbing through a media timeline to find what a person said.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing Your Interview Recording ── */}
            <section aria-labelledby="preparing-file">
              <h2
                id="preparing-file"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing Your Interview Recording
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Before you <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> with Konthora, you must prepare the recording to meet the platform limits. Konthora accepts media up to 100 MB and up to 10 minutes in duration.
                </p>
                <p>
                  Longer interviews must be divided into shorter files before upload. Konthora supports standard audio inputs (MP3, WAV, M4A, AAC) as well as video inputs (MP4, WebM, MOV). 
                </p>
                <p>
                  Note that <Link href="/speech-to-text/audio-transcription-accuracy" className="text-primary hover:underline">audio transcription accuracy</Link> depends heavily on the clarity of the recording. Clear audio with minimal overlapping speech will produce a more accurate transcript.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Choosing a Timestamp Mode ── */}
            <section aria-labelledby="choosing-timestamps">
              <h2
                id="choosing-timestamps"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Choosing a Timestamp Mode
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora provides three <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">timestamp modes</Link>: sentence, paragraph, and word-level.
                </p>
                <p>
                  When reviewing an interview, paragraph mode is often the best choice for readability as it groups longer thoughts together. Sentence mode provides precise timecode references if you need to trace a specific quote back to the original media. Word-level timestamps are primarily used when syncing text to video edits.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Choosing an Export Format ── */}
            <section aria-labelledby="choosing-export-format">
              <h2
                id="choosing-export-format"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Choosing an Export Format
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Once the transcript is ready, you must choose an export <Link href="/formats" className="text-primary hover:underline">format</Link> that fits your workflow.
                </p>
                <p>
                  For most review and archiving purposes, <Link href="/formats/txt" className="text-primary hover:underline">TXT</Link> is the easiest format to open and read. If you plan to caption a video interview, you can export as <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link>. A <Link href="/formats/json" className="text-primary hover:underline">JSON</Link> file is also available for structured programmatic access to the timestamp data.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcribing an Interview with Konthora ── */}
            <section aria-labelledby="transcribing-interview">
              <h2
                id="transcribing-interview"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcribing an Interview with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  You can transcribe your media directly in the browser. Uploaded media and generated transcript data follow a verified temporary 60-minute lifecycle, so you must export the results during your active session. No account is required.
                </p>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: 'Prepare a supported interview recording within the current limits',
                    body: 'Ensure your file is under 100 MB and 10 minutes in length. Divide longer interviews into multiple files before beginning.',
                  },
                  {
                    n: 2,
                    title: 'Upload the audio or video file',
                    body: 'Select your media and upload it to the tool. You do not need to create an account.',
                  },
                  {
                    n: 3,
                    title: 'Choose sentence, paragraph, or word-level timestamps',
                    body: 'Select how the text should be grouped to aid your review process.',
                  },
                  {
                    n: 4,
                    title: 'Start transcription',
                    body: 'Click the button to process your media and wait for the extraction to finish.',
                  },
                  {
                    n: 5,
                    title: 'Export the result as TXT, SRT, VTT, or JSON',
                    body: 'Download your final transcript to your device before your active session expires.',
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="flex gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm"
                  >
                    <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-sm font-bold text-white">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/speech-to-text"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Try Speech-to-Text
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="transcribe-interview-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="transcribe-interview-faq-heading"
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
