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
  title: "How to Transcribe a Lecture | Konthora",
  description:
    "Learn how to convert lecture recordings into readable text. Understand how to manage media limits, apply timestamps, and export your transcript.",
  path: '/transcribe-lecture',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TranscribeLecturePage() {
  const pageUrl = `${siteConfig.url}/transcribe-lecture`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: `${siteConfig.url}/speech-to-text` },
      { '@type': 'ListItem', position: 3, name: 'Transcribe a Lecture', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe a Lecture with Konthora',
    description: 'A 5-step workflow to convert short lecture recordings into text.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare a supported lecture recording within the current limits',
        text: 'Ensure your file is under 100 MB and 10 minutes in length. Divide longer lectures into shorter files before uploading.',
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
        text: 'Select a timestamp mode to help you navigate the resulting text during your review.',
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
        name: 'Export as TXT, SRT, VTT, or JSON',
        text: 'Download your final transcript to your device before your active session expires.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I transcribe a full 90-minute lecture at once?",
      answer: "No. Konthora accepts media up to 10 minutes in duration. Longer lectures must be manually divided into shorter files before upload.",
    },
    {
      question: "Will the tool generate automatic study notes?",
      answer: "No. The transcription tool provides an exact readable transcript of the spoken audio but does not automatically summarize the text or generate study guides.",
    },
    {
      question: "Are my uploaded lecture recordings secure?",
      answer: "Yes. Uploaded media and generated transcript data follow a temporary 60-minute lifecycle and are not permanently stored.",
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
        aria-labelledby="transcribe-lecture-h1"
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
                <span className="text-foreground font-medium">Transcribe a Lecture</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="transcribe-lecture-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            How to Transcribe a <span className="text-gradient">Lecture</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Having a written record of educational material allows you to quickly locate complex topics and verify information. Learn how to prepare your lecture recordings, choose the right timestamp mode, and export your transcript.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Lecture transcription guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Transcribe a Lecture? ── */}
            <section aria-labelledby="why-transcribe">
              <h2
                id="why-transcribe"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Transcribe a Lecture?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Educators and students use <Link href="/speech-to-text" className="text-primary hover:underline">speech-to-text</Link> tools to create readable transcripts of academic presentations. A transcript makes it simple to search for specific terms or review dense material without rewatching the entire recording.
                </p>
                <p>
                  Converting <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> also provides a valuable accessibility resource for individuals who rely on written formats or prefer reading to listening.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing Your Lecture Recording ── */}
            <section aria-labelledby="preparing-file">
              <h2
                id="preparing-file"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing Your Lecture Recording
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Before you can <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> with Konthora, you must ensure your file meets the platform limits. Konthora currently accepts media up to 100 MB and up to 10 minutes in duration.
                </p>
                <p>
                  Longer lectures must be manually divided into shorter files before upload. We support audio inputs (MP3, WAV, M4A, AAC) as well as video inputs (MP4, WebM, MOV) commonly used for recorded presentations.
                </p>
                <p>
                  Note that <Link href="/speech-to-text/audio-transcription-accuracy" className="text-primary hover:underline">audio transcription accuracy</Link> is highly dependent on the quality of the recording. Audio captured close to the speaker will result in a much cleaner transcript than audio recorded from the back of a large hall.
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
                  When reviewing a lecture, paragraph mode is often the best choice for reading long sections of speech. Sentence mode offers precise timecode references when you need to match a statement to a specific slide or visual aid. Word-level timestamps provide exact alignment but are generally unnecessary unless you are editing the video file.
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
                  After the text is generated, select an export <Link href="/formats" className="text-primary hover:underline">format</Link> that fits your workflow.
                </p>
                <p>
                  If you want to read the transcript as a document, <Link href="/formats/txt" className="text-primary hover:underline">TXT</Link> is the most convenient option. If you plan to add closed captions to a recorded video lecture, export as <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link>. A <Link href="/formats/json" className="text-primary hover:underline">JSON</Link> export is available for programmatic access to the transcript and timestamps.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcribing a Lecture with Konthora ── */}
            <section aria-labelledby="transcribing-lecture">
              <h2
                id="transcribing-lecture"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcribing a Lecture with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  You can transcribe your media directly in the browser. Uploaded media and generated transcript data follow a temporary 60-minute lifecycle. You must export your results during your active session. No account is required.
                </p>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: 'Prepare a supported lecture recording within the current limits',
                    body: 'Ensure your file is under 100 MB and 10 minutes in length. Divide longer lectures into shorter files before uploading.',
                  },
                  {
                    n: 2,
                    title: 'Upload the audio or video file',
                    body: 'Select your media and upload it to the tool. You do not need to create an account.',
                  },
                  {
                    n: 3,
                    title: 'Choose sentence, paragraph, or word-level timestamps',
                    body: 'Select a timestamp mode to help you navigate the resulting text during your review.',
                  },
                  {
                    n: 4,
                    title: 'Start transcription',
                    body: 'Click the button to process your media and wait for the extraction to finish.',
                  },
                  {
                    n: 5,
                    title: 'Export as TXT, SRT, VTT, or JSON',
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
      <Section className="bg-secondary/10" id="transcribe-lecture-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="transcribe-lecture-faq-heading"
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
