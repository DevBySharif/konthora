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
  Mic,
  Clock,
  FileDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Upload,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata — canonical, unique title & description
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'How to Transcribe Audio to Text (Free, with Timestamps) | Konthora',
  description:
    'Step-by-step guide to transcribing audio to text for free with sentence, paragraph, or word timestamps. Accepts MP3, WAV, M4A, AAC, MP4, WebM, and MOV.',
  path: '/speech-to-text/how-to-transcribe-audio',
});

export default function HowToTranscribeAudioPage() {
  const pageUrl = `${siteConfig.url}/speech-to-text/how-to-transcribe-audio`;

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
        name: 'How to Transcribe Audio',
        item: pageUrl,
      },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe Audio to Text for Free',
    description:
      'Transcribe an audio or video file to text with timestamps in five steps using Konthora.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open Konthora\u2019s audio-to-text tool',
        text: 'Navigate to Konthora\u2019s free browser-based audio-to-text workspace in any modern web browser.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload your audio or video file',
        text: 'Select or drag and drop your file (MP3, WAV, M4A, AAC, MP4, WebM, or MOV — up to 100 MB and 10 minutes in duration).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose language and timestamp mode',
        text: 'Select your audio language (English) and choose sentence-level, paragraph-level, or word-level timestamp grouping.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Click Transcribe Audio and wait for processing',
        text: 'Click Transcribe Audio. Konthora processes the file using the Whisper speech recognition model.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Download or copy your transcript',
        text: 'Review your transcript with timestamps, copy it to clipboard, or export as TXT, SRT, VTT, or JSON.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: 'How long does audio transcription take?',
      answer:
        'Processing time depends on audio length and file size. A 1-minute audio clip typically transcribes in a few seconds, while a 10-minute recording may take 15 to 30 seconds. All processing completes directly in your browser session.',
    },
    {
      question: 'What is the maximum file size for transcription?',
      answer:
        'Konthora allows file uploads up to 100 MB in size and up to 10 minutes in recording duration per job.',
    },
    {
      question: 'Can I transcribe a video file, not just audio?',
      answer:
        'Yes. Konthora accepts video files in MP4, WebM, and MOV formats. FFmpeg extracts the audio track automatically before passing it to the Whisper model.',
    },
    {
      question: 'Is my audio file stored after transcription?',
      answer:
        'No. Uploaded media files and generated transcripts are temporary and automatically deleted from the server after 60 minutes.',
    },
    {
      question: 'Does transcription work for phone call recordings?',
      answer:
        'Yes, provided the audio is saved in a supported format (such as MP3, WAV, or M4A) and the voices are clear. Speech recorded with heavy background noise or phone compression may have reduced accuracy.',
    },
    {
      question: 'What export format should I choose?',
      answer:
        'Choose TXT for clean reading notes, SRT or VTT for video subtitles and closed captions, or JSON if you need raw segment timestamps for software integration.',
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

      {/* ── HERO ── */}
      <section
        aria-labelledby="how-to-h1"
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
                <span className="text-foreground font-medium">How to Transcribe Audio</span>
              </li>
            </ol>
          </nav>

          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Task Guide
          </p>

          <h1
            id="how-to-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            How to Transcribe Audio to Text{' '}
            <span className="text-gradient">(Free, with Timestamps)</span>
          </h1>

          {/* Search Promise — pre-first scroll */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            To transcribe audio to text for free: (1) go to Konthora&rsquo;s audio-to-text tool,
            (2) upload your audio file (MP3, WAV, M4A, AAC, MP4, WebM, or MOV — up to 100 MB and
            10 minutes), (3) choose your timestamp grouping, and (4) download or copy your
            transcript in TXT, SRT, VTT, or JSON format. No account required.
          </p>

          {/* CTA placement 1: Quick Steps Box */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/audio-to-text"
              id="how-to-hero-cta"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              Transcribe Audio Free Now
            </Link>
          </div>
        </Container>
      </section>

      {/* ── MAIN CONTENT ── */}
      <article aria-label="Audio transcription guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">
            {/* ── H2: Quick Steps: Transcribe Audio in 4 Steps ── */}
            <section aria-labelledby="quick-steps">
              <h2
                id="quick-steps"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Quick Steps: Transcribe Audio in 4 Steps
              </h2>
              <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-card">
                <ol className="space-y-4">
                  {[
                    'Go to Konthora\u2019s free Audio-to-Text tool in your web browser.',
                    'Upload your audio or video file (MP3, WAV, M4A, AAC, MP4, WebM, or MOV — up to 100 MB / 10 mins).',
                    'Select your preferred timestamp grouping: sentence-level, paragraph-level, or word-level.',
                    'Click Transcribe Audio and export your result as TXT, SRT, VTT, or JSON format.',
                  ].map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3.5">
                      <span className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-foreground leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Step-by-Step: How to Transcribe Audio on Konthora ── */}
            <section aria-labelledby="step-by-step">
              <h2
                id="step-by-step"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Step-by-Step: How to Transcribe Audio on Konthora
              </h2>

              <div className="space-y-10 text-muted-foreground leading-relaxed">
                {/* Step 1 */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
                    Step 1 — Upload Your Audio or Video File
                  </h3>
                  <p>
                    Open the Konthora Audio to Text workspace. Drag and drop your media file
                    directly onto the upload area, or click to select a file from your computer.
                  </p>
                  <p>
                    Konthora supports MP3, WAV, M4A, AAC audio files and MP4, WebM, MOV video
                    files. Files must be within 100 MB in size and 10 minutes in duration.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                    Step 2 — Choose Your Language and Timestamp Mode
                  </h3>
                  <p>
                    Verify that your audio language is set to English. Next, choose how you
                    want your timestamps formatted:
                  </p>
                  <ul className="space-y-2 pl-4 list-disc">
                    <li>
                      <strong className="text-foreground">Sentence-level:</strong> Groups text into
                      complete sentences with start and end timestamps. Ideal for reading.
                    </li>
                    <li>
                      <strong className="text-foreground">Paragraph-level:</strong> Groups text by
                      natural speech pauses. Ideal for meeting notes.
                    </li>
                    <li>
                      <strong className="text-foreground">Word-level:</strong> Provides precise start and
                      end timings for every individual word. Ideal for audio indexing.
                    </li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                    Step 3 — Start Transcription
                  </h3>
                  <p>
                    Click <strong className="text-foreground">Transcribe Audio</strong>. Konthora
                    uses the{' '}
                    <span className="font-medium text-foreground">Whisper</span>{' '}
                    speech recognition model to convert your audio into accurate text with precise
                    timestamps.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <FileDown className="h-5 w-5 text-primary" aria-hidden="true" />
                    Step 4 — Download or Copy Your Transcript
                  </h3>
                  <p>
                    Once transcription is complete, review your transcript in the browser. You
                    can copy the text directly to your clipboard or download it in your format of
                    choice: TXT, SRT, VTT, or JSON.
                  </p>
                </div>
              </div>

              {/* CTA Placement 2 */}
              <div className="mt-8">
                <Link
                  href="/audio-to-text"
                  id="how-to-steps-cta"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Transcribe Audio Free Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Supported Audio and Video Formats ── */}
            <section aria-labelledby="supported-formats">
              <h2
                id="supported-formats"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Supported Audio and Video Formats
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora accepts 7 common media formats:
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <h4 className="font-semibold text-foreground mb-1">Audio Formats</h4>
                    <p className="text-sm">MP3, WAV, M4A, AAC</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <h4 className="font-semibold text-foreground mb-1">Video Formats</h4>
                    <p className="text-sm">MP4, WebM, MOV (audio track extracted)</p>
                  </div>
                </div>
                <p>
                  For all formats, the maximum allowable file size is 100 MB and the maximum
                  audio duration is 10 minutes.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Understanding Timestamp Options ── */}
            <section aria-labelledby="timestamp-options">
              <h2
                id="timestamp-options"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Understanding Timestamp Options
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  For a detailed breakdown of timestamp modes and format compatibility, see our guide on{' '}
                  <Link
                    href="/speech-to-text/timestamps"
                    className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                  >
                    transcription timestamps
                  </Link>
                  .
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Sentence Timestamps
                  </h3>
                  <p>
                    Sentence-level timestamps assign a start and end time to each full sentence.
                    This produces clean, natural paragraphs suitable for reading articles or
                    creating show notes.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Paragraph Timestamps
                  </h3>
                  <p>
                    Paragraph timestamps group speech segments by natural pauses in conversation,
                    ideal for long-form speeches and interview transcripts.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Word-Level Timestamps
                  </h3>
                  <p>
                    Word-level timestamps record the exact start and end millisecond of every
                    spoken word, useful for precise audio editing and video synchronization.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Exporting Your Transcript ── */}
            <section aria-labelledby="exporting-transcript">
              <h2
                id="exporting-transcript"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Exporting Your Transcript
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">TXT Format</h3>
                  <p>Plain text format containing speech segments without timestamp headers.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">SRT Format</h3>
                  <p>SubRip Subtitle format with sequential numbers, timestamps, and lines.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">VTT Format</h3>
                  <p>WebVTT caption format supported natively by HTML5 video players.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">JSON Format</h3>
                  <p>Structured JSON containing segment objects with word-level timing data.</p>
                </div>

                {/* Worked example code block */}
                <div className="mt-6 rounded-2xl border border-border/70 bg-card p-5">
                  <h4 className="font-semibold text-foreground mb-3">Example SRT Output</h4>
                  <pre className="overflow-x-auto rounded-lg bg-secondary/50 p-4 font-mono text-xs text-foreground leading-relaxed">
{`1
00:00:00,000 --> 00:00:03,500
Welcome to Konthora's audio transcription workspace.

2
00:00:03,800 --> 00:00:07,200
Upload your audio or video file to get accurate timestamps.`}
                  </pre>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Tips for Better Transcription Results ── */}
            <section aria-labelledby="better-results-tips">
              <h2
                id="better-results-tips"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Tips for Better Transcription Results
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <ul className="space-y-2.5">
                  {[
                    'Record with a dedicated microphone in a quiet room to reduce background noise.',
                    'Maintain a steady speaking distance from your microphone to keep volume levels consistent.',
                    'Avoid overlapping voices — single-speaker speech transcribes with highest accuracy.',
                    'Use high-bitrate MP3 or WAV files instead of heavily compressed voice memos.',
                  ].map((tip, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <CheckCircle2
                        className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="how-to-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <p className="inline-block mb-3 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Frequently Asked Questions
            </p>
            <h2
              id="how-to-faq-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Transcription Questions Answered
            </h2>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>

      {/* ── CLOSING CTA — placement 3 ── */}
      <section
        aria-labelledby="how-to-closing-cta-heading"
        className="py-16 md:py-24 border-t border-border/40 bg-radial-faint"
      >
        <Container className="max-w-3xl text-center">
          <h2
            id="how-to-closing-cta-heading"
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            Ready to transcribe your audio file?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Upload your audio or video file and get your transcript in seconds. Free,
            private, and automatically deleted after 60 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/audio-to-text"
              id="how-to-closing-cta"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic className="h-5 w-5" aria-hidden="true" />
              Transcribe Audio Free Now
            </Link>
            <Link
              href="/speech-to-text"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-semibold text-foreground hover:bg-secondary/50 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back to Speech-to-Text
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
