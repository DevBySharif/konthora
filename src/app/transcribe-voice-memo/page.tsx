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
  title: "How to Transcribe a Voice Memo | Konthora",
  description:
    "Learn how to convert recorded voice memos into readable text. Understand audio formats, file limits, and export options.",
  path: '/transcribe-voice-memo',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TranscribeVoiceMemoPage() {
  const pageUrl = `${siteConfig.url}/transcribe-voice-memo`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: `${siteConfig.url}/speech-to-text` },
      { '@type': 'ListItem', position: 3, name: 'Transcribe a Voice Memo', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe a Voice Memo with Konthora',
    description: 'A 5-step workflow to extract text from a short voice memo recording.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare a supported voice memo file within the current limits',
        text: 'Ensure your audio file is under 100 MB and 10 minutes in length. Divide longer recordings into shorter files before uploading.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload the MP3, WAV, M4A, or AAC file',
        text: 'Select your saved voice memo and upload it to the tool.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose sentence, paragraph, or word-level timestamps',
        text: 'Select a timestamp mode to help format the resulting text for easy reading.',
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
        text: 'Download your transcript file to your device before your active session expires.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I record a voice memo directly on the website?",
      answer: "No. Konthora processes audio files that you have already recorded and saved to your device. You must upload an existing file.",
    },
    {
      question: "What is the maximum length for a voice memo?",
      answer: "Konthora accepts media up to 10 minutes in duration. Longer recordings must be manually divided into shorter files before upload.",
    },
    {
      question: "Will the tool summarize my voice notes automatically?",
      answer: "No. The tool provides an exact readable transcript of the spoken audio but does not generate automatic summaries or task lists.",
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
        aria-labelledby="transcribe-voice-memo-h1"
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
                <span className="text-foreground font-medium">Transcribe a Voice Memo</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="transcribe-voice-memo-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            How to Transcribe a <span className="text-gradient">Voice Memo</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Turn your spoken ideas into written documents. Learn how to upload your voice recordings, apply timestamps, and choose an export format.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Voice memo transcription guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Transcribe a Voice Memo? ── */}
            <section aria-labelledby="why-transcribe">
              <h2
                id="why-transcribe"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Transcribe a Voice Memo?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Recording a voice memo is a quick way to capture thoughts on the go. However, reviewing audio notes later can be tedious. Using <Link href="/speech-to-text" className="text-primary hover:underline">speech-to-text</Link> allows you to convert those thoughts into a readable text document that you can easily scan, edit, and share.
                </p>
                <p>
                  Once you turn your <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link>, you no longer have to listen to the entire recording just to find one specific detail.
                </p>
                <p>
                  If you instead want to generate spoken narration from written text for short-form content, you should review our guide on <Link href="/text-to-speech-for-social-media" className="text-primary hover:underline">text-to-speech for social media</Link>.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing Your Voice Memo ── */}
            <section aria-labelledby="preparing-file">
              <h2
                id="preparing-file"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing Your Voice Memo
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Before you <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> with Konthora, you must save the recording as a file on your device. Konthora accepts standard MP3, WAV, M4A, and AAC audio files, which covers the default outputs of most phone recording apps.
                </p>
                <p>
                  Ensure your file fits within the platform limits. The maximum upload size is 100 MB, and the maximum media duration is 10 minutes. Longer recordings must be manually divided into shorter files before upload. 
                </p>
                <p>
                  Keep in mind that <Link href="/speech-to-text/audio-transcription-accuracy" className="text-primary hover:underline">audio transcription accuracy</Link> relies on the clarity of your voice. Audio recorded in a quiet environment will produce a more accurate transcript than audio recorded in a loud, busy space.
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
                  Applying <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">timestamps</Link> affects how the text is structured on the page. Konthora provides sentence, paragraph, and word-level timestamp modes.
                </p>
                <p>
                  For voice memos, paragraph mode is typically the best choice because it groups your thoughts into readable blocks. Sentence mode places a timestamp on every line, which can make a document look cluttered unless you specifically need to cross-reference the text with the exact second in the audio file.
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
                  After the text is generated, you need to select an export <Link href="/formats" className="text-primary hover:underline">format</Link>.
                </p>
                <p>
                  For most voice memo workflows, <Link href="/formats/txt" className="text-primary hover:underline">TXT</Link> is the best format because it provides a plain text document that is easy to copy, paste, and format. If you need timed captions for a project, you can export as <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link>. A <Link href="/formats/json" className="text-primary hover:underline">JSON</Link> file is also available for structured programmatic access.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcribing a Voice Memo with Konthora ── */}
            <section aria-labelledby="transcribing-memo">
              <h2
                id="transcribing-memo"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcribing a Voice Memo with Konthora
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
                    title: 'Prepare a supported voice memo file within the current limits',
                    body: 'Ensure your audio file is under 100 MB and 10 minutes in length. Divide longer recordings into shorter files before uploading.',
                  },
                  {
                    n: 2,
                    title: 'Upload the MP3, WAV, M4A, or AAC file',
                    body: 'Select your saved voice memo and upload it to the tool.',
                  },
                  {
                    n: 3,
                    title: 'Choose sentence, paragraph, or word-level timestamps',
                    body: 'Select a timestamp mode to help format the resulting text for easy reading.',
                  },
                  {
                    n: 4,
                    title: 'Start transcription',
                    body: 'Click the button to process your media and wait for the extraction to finish.',
                  },
                  {
                    n: 5,
                    title: 'Export as TXT, SRT, VTT, or JSON',
                    body: 'Download your transcript file to your device before your active session expires.',
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
      <Section className="bg-secondary/10" id="transcribe-voice-memo-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="transcribe-voice-memo-faq-heading"
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
