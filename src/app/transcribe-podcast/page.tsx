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
  title: "How to Transcribe a Podcast | Konthora",
  description:
    "Learn how to transcribe podcast audio into readable text. Understand file limits, timestamp modes, and how to export your transcript.",
  path: '/transcribe-podcast',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TranscribePodcastPage() {
  const pageUrl = `${siteConfig.url}/transcribe-podcast`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: `${siteConfig.url}/speech-to-text` },
      { '@type': 'ListItem', position: 3, name: 'Transcribe a Podcast', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe a Podcast with Konthora',
    description: 'A 5-step workflow to convert short podcast segments into text.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare a supported podcast audio file within the current limits',
        text: 'Ensure your audio or video file is under 100 MB and under 10 minutes in duration. Split longer episodes into shorter files before proceeding.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload the file',
        text: 'Select your prepared media file and upload it to the tool. No account is required.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose sentence, paragraph, or word-level timestamps',
        text: 'Select how you want your text broken down to match your editing or publishing needs.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Start transcription',
        text: 'Click the button to process your media. Wait for the browser to finish extracting the text.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Export the result as TXT, SRT, VTT, or JSON',
        text: 'Download the final transcript in your preferred format before your 60-minute session expires.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I transcribe an entire 60-minute podcast episode at once?",
      answer: "No. Konthora currently accepts media up to 10 minutes in duration. Longer podcast episodes must be divided into shorter files before upload.",
    },
    {
      question: "What file formats do you support?",
      answer: "We support both audio and video transcription. Supported audio inputs include MP3, WAV, M4A, and AAC. Supported video inputs include MP4, WebM, and MOV.",
    },
    {
      question: "Is my podcast audio stored permanently?",
      answer: "No. Uploaded media and generated transcript data follow a temporary 60-minute lifecycle and are not permanently stored.",
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
        aria-labelledby="transcribe-podcast-h1"
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
                <span className="text-foreground font-medium">Transcribe a Podcast</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="transcribe-podcast-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            How to Transcribe a <span className="text-gradient">Podcast</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Providing written text alongside your podcast audio can help audiences who prefer reading or need accessibility options. Learn how to prepare your podcast files, choose timestamp modes, and export your transcript.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Podcast transcription guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Transcribe a Podcast? ── */}
            <section aria-labelledby="why-transcribe">
              <h2
                id="why-transcribe"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Transcribe a Podcast?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Creators use <Link href="/speech-to-text" className="text-primary hover:underline">speech-to-text</Link> tools to generate readable transcripts of their recorded episodes. A written transcript makes it easier to repurpose podcast discussions into articles, pull out notable quotes, or verify what was said.
                </p>
                <p>
                  Transcribing your episodes also helps provide accessible content for users who are deaf, hard of hearing, or those who simply prefer to read <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> rather than listen to media.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing Your Podcast File ── */}
            <section aria-labelledby="preparing-file">
              <h2
                id="preparing-file"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing Your Podcast File
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Before you can <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> using Konthora, you must prepare your media. Konthora currently accepts media up to 100 MB and up to 10 minutes in duration. 
                </p>
                <p>
                  Longer podcast episodes must be divided into shorter files before upload. We support audio inputs (MP3, WAV, M4A, AAC) as well as video inputs (MP4, WebM, MOV) if you record video podcasts.
                </p>
                <p>
                  Keep in mind that overall <Link href="/speech-to-text/audio-transcription-accuracy" className="text-primary hover:underline">audio transcription accuracy</Link> relies heavily on the quality of the recording. Clear speech with minimal background noise yields better results.
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
                  Konthora allows you to choose from three <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">timestamp modes</Link>: sentence, paragraph, and word-level.
                </p>
                <p>
                  Selecting paragraph mode groups large blocks of spoken text together, which is often useful for reading long discussions. Sentence mode provides a closer timing reference for finding specific quotes, and word-level timing offers exact alignment for creating captions.
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
                  After generating the transcript, you can select from four different export <Link href="/formats" className="text-primary hover:underline">formats</Link>.
                </p>
                <p>
                  A plain <Link href="/formats/txt" className="text-primary hover:underline">TXT</Link> file is best for reading the transcript as a standard document. If you plan to add the text as closed captions to a video podcast, use <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link>. The <Link href="/formats/json" className="text-primary hover:underline">JSON</Link> format is available if you need to extract the raw transcript and timing data for structured data workflows.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcribing a Podcast with Konthora ── */}
            <section aria-labelledby="transcribing-podcast">
              <h2
                id="transcribing-podcast"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcribing a Podcast with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  Konthora provides a browser-based workflow with no account required. Remember that uploaded media and generated transcript data follow a temporary 60-minute lifecycle, so you must export your results before the session expires.
                </p>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: 'Prepare a supported podcast audio file within the current limits',
                    body: 'Ensure your audio or video file is under 100 MB and under 10 minutes in duration. Split longer episodes into shorter files before proceeding.',
                  },
                  {
                    n: 2,
                    title: 'Upload the file',
                    body: 'Select your prepared media file and upload it to the tool. No account is required.',
                  },
                  {
                    n: 3,
                    title: 'Choose sentence, paragraph, or word-level timestamps',
                    body: 'Select how you want your text broken down to match your editing or publishing needs.',
                  },
                  {
                    n: 4,
                    title: 'Start transcription',
                    body: 'Click the button to process your media. Wait for the browser to finish extracting the text.',
                  },
                  {
                    n: 5,
                    title: 'Export the result as TXT, SRT, VTT, or JSON',
                    body: 'Download the final transcript in your preferred format before your 60-minute session expires.',
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
      <Section className="bg-secondary/10" id="transcribe-podcast-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="transcribe-podcast-faq-heading"
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
