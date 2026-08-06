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
  title: "How to Transcribe a Webinar | Konthora",
  description:
    "Learn how to convert saved webinar recordings into readable text. Understand media formats, file limits, timestamp modes, and export options.",
  path: '/transcribe-webinar',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TranscribeWebinarPage() {
  const pageUrl = `${siteConfig.url}/transcribe-webinar`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: `${siteConfig.url}/speech-to-text` },
      { '@type': 'ListItem', position: 3, name: 'Transcribe a Webinar', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe a Webinar with Konthora',
    description: 'A 5-step workflow to extract text from a short saved webinar recording.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare a supported webinar recording within the current limits',
        text: 'Ensure your file is under 100 MB and 10 minutes in length. Divide longer webinars into shorter segments before uploading.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload the audio or video file',
        text: 'Select your saved media and upload it to the tool.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose sentence, paragraph, or word-level timestamps',
        text: 'Select a timestamp mode to help format the resulting text for easy reading or subtitle creation.',
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
        text: 'Download your standalone transcript or subtitle file to your device before your active session expires.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I use Konthora to transcribe a live webinar?",
      answer: "No. Konthora transcribes an existing saved recording. It does not capture or transcribe live webinars or integrate with streaming platforms.",
    },
    {
      question: "What is the maximum length for a webinar file?",
      answer: "Konthora accepts media up to 10 minutes in duration. Longer webinar recordings must be manually divided into shorter files before upload.",
    },
    {
      question: "Will the tool generate an automatic summary of the webinar?",
      answer: "No. The transcription tool provides an exact readable transcript of the spoken audio but does not generate automatic summaries or extract action items.",
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
        aria-labelledby="transcribe-webinar-h1"
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
                <span className="text-foreground font-medium">Transcribe a Webinar</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="transcribe-webinar-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            How to Transcribe a <span className="text-gradient">Webinar</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Turn your recorded presentations into written documents. Learn how to upload your saved webinars, apply timestamps, and choose an export format.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Webinar transcription guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Transcribe a Webinar? ── */}
            <section aria-labelledby="why-transcribe">
              <h2
                id="why-transcribe"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Transcribe a Webinar?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Event organizers and attendees use <Link href="/speech-to-text" className="text-primary hover:underline">speech-to-text</Link> to generate readable transcripts of past presentations. Having a written document makes it easy to search for specific insights, review Q&amp;A sessions, and share the content with people who could not attend.
                </p>
                <p>
                  Converting <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> eliminates the need to watch an entire presentation just to locate a single quote or data point.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing Your Webinar Recording ── */}
            <section aria-labelledby="preparing-file">
              <h2
                id="preparing-file"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing Your Webinar Recording
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora is designed to process existing saved files; it does not capture or transcribe a live webinar. Before you <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link>, you must ensure your file fits within the platform limits. Konthora accepts supported media files up to 100 MB and up to 10 minutes in duration. 
                </p>
                <p>
                  Longer webinar recordings must be manually divided into shorter files before upload. Konthora supports standard audio inputs (MP3, WAV, M4A, AAC) as well as video inputs (MP4, WebM, MOV). If you upload a video, the system automatically processes the available audio track. For more details on supported inputs, see our <Link href="/transcribe-video" className="text-primary hover:underline">video transcription</Link> guide.
                </p>
                <p>
                  Please note that <Link href="/speech-to-text/audio-transcription-accuracy" className="text-primary hover:underline">audio transcription accuracy</Link> relies heavily on the clarity of the recording. Audio captured directly from the presenter&apos;s microphone will yield the most accurate results.
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
                  Applying <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">timestamps</Link> affects how the text is structured and makes the final document easier to navigate. Konthora provides sentence, paragraph, and word-level timestamp modes.
                </p>
                <p>
                  For most webinar review purposes, paragraph mode is ideal because it groups the speaker&apos;s thoughts into readable blocks. Sentence mode is highly recommended if you intend to create subtitles, as it offers precise timecode references. Word-level timestamps provide exact alignment but are less necessary for standard review workflows.
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
                  After the text is generated, you need to select an export <Link href="/formats" className="text-primary hover:underline">format</Link>. Konthora outputs a standalone transcript or subtitle file.
                </p>
                <p>
                  If you want to read or distribute the transcript as a plain document, <Link href="/formats/txt" className="text-primary hover:underline">TXT</Link> is the best format. If you need to caption a recorded webinar for later viewing, you can export as <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link>. A <Link href="/formats/json" className="text-primary hover:underline">JSON</Link> file is also available for developers requiring structured programmatic access.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcribing a Webinar with Konthora ── */}
            <section aria-labelledby="transcribing-webinar">
              <h2
                id="transcribing-webinar"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcribing a Webinar with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  You can transcribe your file securely in your browser without creating an account. Uploaded media and generated transcript data follow a temporary 60-minute lifecycle, so you must download the final output during your active session.
                </p>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: 'Prepare a supported webinar recording within the current limits',
                    body: 'Ensure your file is under 100 MB and 10 minutes in length. Divide longer webinars into shorter segments before uploading.',
                  },
                  {
                    n: 2,
                    title: 'Upload the audio or video file',
                    body: 'Select your saved media and upload it to the tool.',
                  },
                  {
                    n: 3,
                    title: 'Choose sentence, paragraph, or word-level timestamps',
                    body: 'Select a timestamp mode to help format the resulting text for easy reading or subtitle creation.',
                  },
                  {
                    n: 4,
                    title: 'Start transcription',
                    body: 'Click the button to process your media and wait for the extraction to finish.',
                  },
                  {
                    n: 5,
                    title: 'Export as TXT, SRT, VTT, or JSON',
                    body: 'Download your standalone transcript or subtitle file to your device before your active session expires.',
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
      <Section className="bg-secondary/10" id="transcribe-webinar-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="transcribe-webinar-faq-heading"
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
