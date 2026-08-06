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
  title: "How to Transcribe a Video | Konthora",
  description:
    "Learn how to extract speech from video files and convert it into readable text. Understand video formats, timestamp modes, and export options.",
  path: '/transcribe-video',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TranscribeVideoPage() {
  const pageUrl = `${siteConfig.url}/transcribe-video`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: `${siteConfig.url}/speech-to-text` },
      { '@type': 'ListItem', position: 3, name: 'Transcribe a Video', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe a Video with Konthora',
    description: 'A 5-step workflow to extract text from a short video file.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare a supported video file within the current limits',
        text: 'Ensure your MP4, WebM, or MOV file is under 100 MB and 10 minutes in length. Divide longer videos into shorter files before uploading.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload the MP4, WebM, or MOV file',
        text: 'Select your video and upload it to the tool. Konthora will process the available audio track.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose sentence, paragraph, or word-level timestamps',
        text: 'Select a timestamp mode to help you navigate the resulting text or align subtitles.',
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
      question: "Does Konthora edit my video to add captions?",
      answer: "No. Konthora generates a standalone transcript or subtitle file. It does not edit the source video or permanently burn captions into it.",
    },
    {
      question: "Can I transcribe a 20-minute video?",
      answer: "No. Konthora accepts media up to 10 minutes in duration. Longer videos must be manually divided into shorter files before upload.",
    },
    {
      question: "Are my uploaded videos stored permanently?",
      answer: "No. Uploaded media and generated transcript data follow a temporary 60-minute lifecycle and are automatically removed.",
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
        aria-labelledby="transcribe-video-h1"
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
                <span className="text-foreground font-medium">Transcribe a Video</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="transcribe-video-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            How to Transcribe a <span className="text-gradient">Video</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Extracting speech from video files allows you to create readable notes and prepare standalone subtitle tracks. Learn how to process your video files, apply timestamps, and choose an export format.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Video transcription guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Transcribe a Video? ── */}
            <section aria-labelledby="why-transcribe">
              <h2
                id="why-transcribe"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Transcribe a Video?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Creators and editors use <Link href="/speech-to-text" className="text-primary hover:underline">speech-to-text</Link> to convert the dialogue inside their video recordings into written documents. Once you convert the <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link>, you can review the content without constantly scrubbing through a video player timeline.
                </p>
                <p>
                  Additionally, transcribing a video is the first required step if you plan to create <Link href="/captions" className="text-primary hover:underline">captions</Link> or subtitles to improve the accessibility of your content.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing Your Video File ── */}
            <section aria-labelledby="preparing-file">
              <h2
                id="preparing-file"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing Your Video File
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora accepts MP4, WebM, and MOV video files (as well as MP3, WAV, M4A, and AAC audio files). When you <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> from a video, Konthora processes the available audio track embedded inside the file.
                </p>
                <p>
                  Before starting, ensure your file fits within the platform limits. The maximum upload size is 100 MB, and the maximum media duration is 10 minutes. Longer videos must be manually divided into shorter files before upload. 
                </p>
                <p>
                  For the best <Link href="/speech-to-text/audio-transcription-accuracy" className="text-primary hover:underline">audio transcription accuracy</Link>, ensure the video's audio track is clear and free from heavy background noise.
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
                  Applying <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">timestamps</Link> makes it easy to match the written text back to the video timeline. Konthora provides sentence, paragraph, and word-level timestamp modes.
                </p>
                <p>
                  Sentence mode is highly recommended if you are creating subtitle tracks, as it breaks the text into manageable chunks. Paragraph mode is better if you just want to read the transcript like a document. Word-level timestamps provide exact frame-level alignment for precise editing workflows.
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
                  Konthora generates a standalone transcript or subtitle file, rather than burning the text directly into the video. You must choose an export <Link href="/formats" className="text-primary hover:underline">format</Link> that fits your goal.
                </p>
                <p>
                  If you need a simple readable document, export as <Link href="/formats/txt" className="text-primary hover:underline">TXT</Link>. If you want to <Link href="/captions/how-to-add-captions-to-video" className="text-primary hover:underline">add captions to video</Link> using a player or editing software, you should export as <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link>. Developers and technical users can also export <Link href="/formats/json" className="text-primary hover:underline">JSON</Link> for programmatic access to the data.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcribing a Video with Konthora ── */}
            <section aria-labelledby="transcribing-video">
              <h2
                id="transcribing-video"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcribing a Video with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  You can perform this process securely in your browser. Uploaded media and generated transcript data follow a temporary 60-minute lifecycle, so you must download the final output during your active session. No account is required.
                </p>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: 'Prepare a supported video file within the current limits',
                    body: 'Ensure your MP4, WebM, or MOV file is under 100 MB and 10 minutes in length. Divide longer videos into shorter files before uploading.',
                  },
                  {
                    n: 2,
                    title: 'Upload the MP4, WebM, or MOV file',
                    body: 'Select your video and upload it to the tool. Konthora will process the available audio track.',
                  },
                  {
                    n: 3,
                    title: 'Choose sentence, paragraph, or word-level timestamps',
                    body: 'Select a timestamp mode to help you navigate the resulting text or align subtitles.',
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
      <Section className="bg-secondary/10" id="transcribe-video-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="transcribe-video-faq-heading"
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
