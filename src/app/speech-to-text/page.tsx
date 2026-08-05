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
  FileText,
  Clock,
  Users,
  Captions,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata — title unique across site, canonical set
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'Speech to Text: How Audio Transcription Works | Konthora',
  description:
    'Speech-to-text converts spoken audio into written text using automatic speech recognition. Learn how it works, what accuracy to expect, and transcribe audio free with Konthora.',
  path: '/speech-to-text',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function SpeechToTextPage() {
  const pageUrl = `${siteConfig.url}/speech-to-text`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: pageUrl },
    ],
  };

  /* ── Schema: Article ── */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Speech to Text: How Audio Transcription Works',
    description:
      'Speech-to-text converts spoken audio into written text using automatic speech recognition software. This guide explains how it works, what accuracy to expect, and how to transcribe audio free.',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Konthora',
      url: siteConfig.url,
    },
    mainEntityOfPage: pageUrl,
  };

  /* ── Schema: HowTo — "How to Transcribe Audio with Konthora" ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe Audio with Konthora',
    description:
      'Transcribe audio or video to text with timestamps in four steps using Konthora — free, no account required.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload your audio or video file',
        text: "Go to Konthora\u2019s audio-to-text tool and upload a file in MP3, WAV, M4A, AAC, MP4, WebM, or MOV format. Files up to 100 MB and 10 minutes long are accepted.",
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select your timestamp grouping',
        text: 'Choose sentence-level, paragraph-level, or word-level timestamp grouping for your transcript.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Transcribe',
        text: 'Click Transcribe Audio. Konthora processes your file using the Whisper speech recognition model and returns a complete transcript.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Download or copy your transcript',
        text: 'Export your transcript as plain TXT, SRT subtitle format, VTT caption format, or structured JSON. No account is required.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Is speech-to-text free?",
      answer:
        "Yes. Konthora\u2019s audio-to-text tool is free to use with no account or subscription required. Upload an audio or video file, transcribe it, and download the result \u2014 at no cost.",
    },
    {
      question: "How accurate is free speech-to-text?",
      answer:
        "Accuracy depends on audio quality, background noise, the speaker\u2019s accent, and speaking clarity. Konthora uses the Whisper speech recognition model, which produces reliable results for clearly recorded English speech. Transcription accuracy is not guaranteed and varies with audio conditions.",
    },
    {
      question: "What audio formats can be transcribed?",
      answer:
        "Konthora accepts MP3, WAV, M4A, AAC, MP4, WebM, and MOV files. The maximum file size is 100 MB and the maximum recording duration is 10 minutes.",
    },
    {
      question: "Can speech-to-text add timestamps?",
      answer:
        "Yes. Konthora offers three timestamp modes: sentence-level (one timestamp per sentence), paragraph-level (grouped by natural speech pauses), and word-level (individual timestamp for every word). You choose the mode before transcribing.",
    },
    {
      question: "Does speech-to-text work for video files?",
      answer:
        "Yes. Konthora accepts MP4, WebM, and MOV video files. The audio track is extracted automatically and transcribed. The same 100 MB file size and 10-minute duration limits apply.",
    },
    {
      question: "What is the difference between speech-to-text and voice recognition?",
      answer:
        "Speech-to-text (also called audio transcription) converts spoken audio into a written text file. Voice recognition is a broader term that also covers speaker identification, voice commands, and authentication. Konthora provides speech-to-text transcription only \u2014 it does not identify speakers or respond to voice commands.",
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
      <JsonLd schema={howToSchema} />
      <JsonLd schema={faqSchema} />

      {/* ── HERO / INTRO ── */}
      <section
        aria-labelledby="stt-h1"
        className="relative overflow-hidden bg-radial-faint py-16 md:py-24 border-b border-border/40"
      >
        {/* Decorative orbs */}
        <div
          aria-hidden="true"
          className="orb w-[520px] h-[520px] -top-64 -right-32 bg-indigo-500/10 dark:bg-indigo-500/8"
        />
        <div
          aria-hidden="true"
          className="orb w-[320px] h-[320px] bottom-0 left-0 bg-cyan-500/8"
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
                <span className="text-foreground font-medium">Speech to Text</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="stt-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Speech to Text:{' '}
            <span className="text-gradient">How Audio Transcription Works</span>
          </h1>

          {/* Search promise — delivered before first scroll */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Speech-to-text converts spoken audio into written text using{' '}
            <span className="font-medium text-foreground">automatic speech recognition</span>{' '}
            (ASR) software. Modern free tools powered by neural models like{' '}
            <span className="font-medium text-foreground">Whisper</span>{' '}
            can transcribe audio files, videos, and voice recordings directly in a
            browser — with no software to install and no account required.
          </p>

          {/* Primary CTA — placement 1 */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/audio-to-text"
              id="stt-hero-cta"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              Transcribe Audio to Text Free — No Account Needed
            </Link>
          </div>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Speech to text guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is Speech to Text? ── */}
            <section aria-labelledby="what-is-stt">
              <h2
                id="what-is-stt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is Speech to Text?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Speech-to-text is a technology that converts spoken words in an audio
                  recording into a written text transcript. The software listens to the
                  audio, identifies phonemes (the smallest units of sound in a language),
                  and maps them to words using statistical models trained on large
                  collections of speech and text data.
                </p>
                <p>
                  The terms <em>speech-to-text</em>, <em>audio transcription</em>,{' '}
                  <em>voice-to-text</em>, and <em>automatic speech recognition</em> are
                  all used to describe the same core process. The result is a text file
                  that represents what was said in the original recording — sometimes with
                  timestamps that show when each word was spoken.
                </p>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-border/40" />

            {/* ── H2: How Speech-to-Text Works ── */}
            <section aria-labelledby="how-stt-works">
              <h2
                id="how-stt-works"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How Speech-to-Text Works
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Modern speech-to-text systems use neural networks trained on hundreds of
                  thousands of hours of audio paired with text transcripts. When you submit
                  an audio file, the software converts the audio waveform into a
                  spectrogram — a visual representation of how sound frequencies change
                  over time — and passes it through a transformer model that predicts the
                  most likely sequence of words.
                </p>
                <p>
                  Konthora uses the{' '}
                  <span className="font-medium text-foreground">Whisper</span>{' '}
                  speech recognition model — an open-source neural network developed by
                  OpenAI and trained on 680,000 hours of multilingual audio. Konthora
                  specifically uses the{' '}
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-sm font-mono text-foreground">
                    small.en
                  </code>{' '}
                  variant, which is optimised for English and runs entirely on Konthora&rsquo;s
                  servers with no data sent to third-party AI services.
                </p>
                <p>
                  The three steps that happen when you transcribe audio on Konthora are:
                </p>

                {/* Inline numbered steps — readable summary */}
                <ol className="mt-2 space-y-2 list-none">
                  {[
                    'Your file is securely uploaded and validated.',
                    'FFmpeg extracts and normalises the audio to a 16 kHz mono WAV — the format Whisper expects.',
                    'Whisper processes the audio and returns a transcript with word-level timing data, which Konthora then groups into the timestamp mode you selected.',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: What Speech-to-Text Is Used For ── */}
            <section aria-labelledby="stt-use-cases">
              <h2
                id="stt-use-cases"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Speech-to-Text Is Used For
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Speech-to-text is used wherever someone needs a written record of spoken
                  content. The most common use cases fall into three audiences.
                </p>
              </div>

              {/* H3 sub-sections rendered as subtle cards */}
              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {/* H3: Podcasters and Creators */}
                <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary mb-4">
                    <Mic className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Podcasters and Creators
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Transcribing episodes creates searchable show notes, blog posts, and
                    social-media clips. SRT or VTT exports let creators add{' '}
                    <span className="font-medium text-foreground">captions and subtitles</span>{' '}
                    to video content.
                  </p>
                </div>

                {/* H3: Students and Researchers */}
                <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary mb-4">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Students and Researchers
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Lectures, interviews, and field recordings can be transcribed and
                    reviewed in text form. Word-level timestamps let researchers jump
                    directly to any moment in the source audio.
                  </p>
                </div>

                {/* H3: Accessibility and Assistive Technology */}
                <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary mb-4">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Accessibility and Assistive Technology
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Accurate transcripts make audio and video content accessible to people
                    who are deaf or hard of hearing. Exported SRT and VTT files meet
                    caption requirements for most video platforms.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Free vs. Paid Speech-to-Text Tools ── */}
            <section aria-labelledby="free-vs-paid">
              <h2
                id="free-vs-paid"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Free vs. Paid Speech-to-Text Tools
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Free speech-to-text tools typically use open-source models such as
                  Whisper and are suitable for individual files and occasional use. Paid
                  services usually offer faster processing, higher file limits, batch
                  transcription, speaker diarization, and API access — features designed
                  for teams or high-volume workflows.
                </p>
                <p>
                  Konthora is a free, browser-based tool with no account or subscription
                  required. It is designed for individual files up to 100 MB and 10 minutes
                  in duration. It does not offer speaker identification, real-time
                  transcription, or batch processing. If your workflow requires those
                  features, you will need a paid service.
                </p>
                <p>
                  What Konthora does offer that most free tools do not: three timestamp
                  modes (sentence, paragraph, word), four export formats (TXT, SRT, VTT,
                  JSON), and automatic file deletion after 60 minutes — so your audio is
                  never stored permanently.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcription Accuracy: What to Expect ── */}
            <section aria-labelledby="stt-accuracy">
              <h2
                id="stt-accuracy"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcription Accuracy: What to Expect
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  No speech-to-text tool is perfectly accurate. Accuracy varies based on:
                </p>
                <ul className="space-y-2 mt-2">
                  {[
                    'Audio quality — clear, close-microphone recordings transcribe more accurately than distant or compressed audio.',
                    'Background noise — music, echo, or crowd noise reduces accuracy.',
                    'Speaking style — clear, moderate-pace speech transcribes more accurately than very fast speech or heavy mumbling.',
                    'Accent — Whisper handles a wide range of English accents but performs best on standard American and British English.',
                    'Technical vocabulary — specialist terms in medicine, law, or engineering may be transcribed incorrectly if they are rare in the training data.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2.5">
                      <CheckCircle2
                        className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  For the best results with Konthora, use a clean MP3 or WAV recording
                  with one speaker at a time, recorded at normal speaking pace in a quiet
                  environment.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How to Transcribe Audio with Konthora ── */}
            <section aria-labelledby="how-to-transcribe" id="how-to-transcribe-section">
              <h2
                id="how-to-transcribe"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How to Transcribe Audio with Konthora
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Transcribing audio on Konthora takes four steps and requires no account.
                Files are automatically deleted after 60 minutes.
              </p>

              {/* Numbered steps grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    n: 1,
                    title: 'Upload your file',
                    body: 'Open the audio-to-text tool and drop in an MP3, WAV, M4A, AAC, MP4, WebM, or MOV file — up to 100 MB and 10 minutes long.',
                  },
                  {
                    n: 2,
                    title: 'Choose timestamp mode',
                    body: 'Select sentence-level, paragraph-level, or word-level grouping depending on how you intend to use the transcript.',
                  },
                  {
                    n: 3,
                    title: 'Transcribe',
                    body: 'Click Transcribe Audio. Konthora processes the file with Whisper and returns a complete, timestamped transcript.',
                  },
                  {
                    n: 4,
                    title: 'Export your result',
                    body: 'Download as plain TXT, SRT, VTT, or JSON — or copy directly to your clipboard.',
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="relative rounded-2xl border border-border/70 bg-card p-6 shadow-card"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                      {step.n}
                    </span>
                    <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA — placement 2 */}
              <div className="mt-8">
                <Link
                  href="/audio-to-text"
                  id="stt-steps-cta"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Transcribe Audio Free Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Explore Speech-to-Text Topics ── */}
            <section aria-labelledby="stt-topics">
              <h2
                id="stt-topics"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
              >
                Explore Speech-to-Text Topics
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Go deeper into specific aspects of audio transcription with these guides.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Child page: how-to-transcribe-audio */}
                <div className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      How to Transcribe Audio Step by Step
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      A detailed walkthrough of{' '}
                      <Link
                        href="/speech-to-text/how-to-transcribe-audio"
                        className="text-primary underline-offset-4 hover:underline transition-colors"
                      >
                        how to transcribe audio step by step
                      </Link>{' '}
                      — including format tips, timestamp options, and export guidance.
                    </p>
                  </div>
                </div>

                {/* Child page: timestamps */}
                <div className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Transcription Timestamps Explained
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Understand the difference between sentence, paragraph, and word-level{' '}
                      <Link
                        href="/speech-to-text/timestamps"
                        className="text-primary underline-offset-4 hover:underline transition-colors"
                      >
                        transcription with timestamps
                      </Link>{' '}
                      — and which mode to use for SRT captions, research, or JSON archives.
                    </p>
                  </div>
                </div>

                {/* Lateral: captions */}
                <div className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary">
                    <Captions className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Captions and Subtitles
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Learn the difference between{' '}
                      <span className="font-medium text-foreground">captions and subtitles</span>
                      , what SRT and VTT files are, and how to create them from your
                      transcript.
                    </p>
                  </div>
                </div>

                {/* Lateral: entity/automatic-speech-recognition */}
                <div className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary">
                    <Mic className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      How Automatic Speech Recognition Works
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      A technical explainer on{' '}
                      <span className="font-medium text-foreground">automatic speech recognition</span>{' '}
                      — acoustic models, language models, and the neural networks that power
                      modern transcription.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="stt-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <p className="inline-block mb-3 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Common questions
            </p>
            <h2
              id="stt-faq-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Questions about speech-to-text, transcription accuracy, supported formats,
              and how Konthora handles your files.
            </p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>

      {/* ── CLOSING CTA — placement 3 ── */}
      <section
        aria-labelledby="stt-closing-cta-heading"
        className="py-16 md:py-24 border-t border-border/40 bg-radial-faint"
      >
        <Container className="max-w-3xl text-center">
          <h2
            id="stt-closing-cta-heading"
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            Ready to transcribe your audio?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Upload any audio or video file and get a timestamped transcript in seconds.
            Free, private, and no account required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/audio-to-text"
              id="stt-closing-cta"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic className="h-5 w-5" aria-hidden="true" />
              Transcribe Audio to Text Free
            </Link>
            <Link
              href="/text-to-speech"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-semibold text-foreground hover:bg-secondary/50 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try Text-to-Speech
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
