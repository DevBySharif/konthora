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
// Intent split with /audio-to-text, which is the transactional tool page.
//
//   /audio-to-text   "convert my file"   -> embeds the workspace, schema
//                                            SoftwareApplication, priced in a
//                                            feature list
//   /speech-to-text  "how does this work" -> explanatory article, schema
//                                            TechArticle, no workspace
//
// These two overlapped heavily (1,118 shared tokens) and Search Console listed
// this page as "Crawled - currently not indexed", because it read as a second
// attempt at the same query. It is now written as an explainer that teaches the
// concept and hands the transaction off to the tool page, and it says so in the
// opening paragraph rather than competing for the same terms.
export const metadata: Metadata = constructMetadata({
  title: 'What Is Speech to Text? How Audio Transcription Works | Konthora',
  description:
    'An explainer on how speech-to-text turns audio into text: what automatic speech recognition does, what affects accuracy, and how to pick a timestamp mode.',
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

  /* ── Schema: TechArticle ──
     Declared as a TechArticle rather than a generic Article because this page
     is an explainer, not a product listing. The tool page carries the
     SoftwareApplication schema. */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'What Is Speech to Text? How Audio Transcription Works',
    description:
      'An explanation of how automatic speech recognition turns audio into text: what the model does, what determines accuracy, and how to choose between sentence, paragraph and word-level timestamps.',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Konthora',
      url: siteConfig.url,
    },
    mainEntityOfPage: pageUrl,
  };

  /* No HowTo schema here on purpose. The same four steps appear on
     /speech-to-text/how-to-transcribe-audio and on the /audio-to-text tool
     page, and three pages competing for one "how to transcribe" query is part
     of why this page was not indexed. The dedicated how-to page owns that
     intent; this page explains the concept. */

  /* ── Schema: FAQPage — concept questions, not product steps ── */
  const faqs: FAQItem[] = [
    {
      question: "What does automatic speech recognition actually do?",
      answer:
        "It converts a waveform into text by inferring which words the sound represents. A trained neural model has learned the relationship between acoustic patterns and language from a very large number of transcribed recordings, so it is predicting plausible words from sound rather than looking them up in a dictionary.",
    },
    {
      question: "Why do some recordings transcribe badly and others do not?",
      answer:
        "The model is guessing from audio, so anything that obscures the speech makes it guess wrong. Background noise, overlapping speakers, low volume, unusual accents, and technical vocabulary are the usual causes. A single microphone near the speaker reliably beats several spread around a room, and trimming silence before upload removes a large share of errors.",
    },
    {
      question: "What is the difference between speech-to-text and voice recognition?",
      answer:
        "Voice recognition is the broader category and covers speaker identification, voice commands and authentication. Speech-to-text is transcription: turning speech into a written document. The distinction matters because many voice recognition tools cannot produce a transcript, and many transcription tools do not identify who spoke.",
    },
    {
      question: "What are the three timestamp modes, and which should I use?",
      answer:
        "Sentence mode gives one timestamp per sentence and suits reading and finding quotes. Paragraph mode groups related speech into blocks and suits notes. Word mode times every individual word and is what you need for subtitles, because sentence-level cues lag behind the speaker. Choosing well is usually a bigger quality difference than the choice of model.",
    },
    {
      question: "Can speech-to-text handle accents and noisy recordings?",
      answer:
        "Modern models such as Whisper are trained on diverse speakers and handle many accents well. Accuracy still depends on how the audio was captured. Under good conditions an accent is rarely a problem; in a noisy recording it compounds whatever else is already difficult.",
    },
    {
      question: "How long does speech-to-text take?",
      answer:
        "Processing time tracks the length of the audio, since the model is working through it rather than looking up a stored result. A ten-minute file is the practical ceiling for most tools, which is why longer recordings are usually split before upload.",
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

      {/* ── HERO / INTRO ── */}
      <section
        aria-labelledby="stt-h1"
        className="relative overflow-hidden bg-radial-faint py-16 md:py-24 border-b border-border/40"
      >
        {/* Decorative orbs */}
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
              What Is Speech to Text?{' '}
              <span className="text-gradient">How It Works</span>
            </h1>

            {/* Search promise — delivered before first scroll */}
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Speech-to-text turns spoken audio into written words using{' '}
              <span className="font-medium text-foreground">automatic speech recognition</span>{' '}
              (ASR) — a model that has learned the relationship between sound and
              language from a very large number of transcribed recordings. This page
              explains what that actually involves and why results differ between
              files.
            </p>

            {/* Intent hand-off. This page teaches; /audio-to-text does the work. */}
            <div className="mt-6 rounded-xl border border-border/70 bg-card p-5 max-w-2xl">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Want to transcribe a file now?
                </span>{' '}
                The{' '}
                <Link
                  href="/audio-to-text"
                  className="text-primary hover:underline"
                >
                  audio-to-text converter
                </Link>{' '}
                is the page that runs the transcription. This one is the explanation
                behind it.
              </p>
            </div>

          {/* Primary CTA — placement 1 */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/audio-to-text"
              id="stt-hero-cta"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              Open the Audio to Text Converter
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
                  <Link
                    href="/entity/whisper"
                    className="font-medium text-foreground hover:underline underline-offset-4 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Whisper
                  </Link>{' '}
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
                <ol className="mt-2 space-y-4">
                  {[
                    'Your file is securely uploaded and validated.',
                    'FFmpeg extracts and normalises the audio to a 16 kHz mono WAV — the format Whisper expects.',
                    'Whisper processes the audio and returns a transcript with word-level timing data, which Konthora then groups into the timestamp mode you selected.',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="mt-0.5 flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-xs font-bold text-white">
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
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary mb-4">
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
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary mb-4">
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
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary mb-4">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Accessibility and Assistive Technology
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Timed transcripts can support accessible audio and video workflows. Exported
                    SRT and VTT files provide timed transcript cues; review and add speaker or
                    non-speech annotations when fully authored closed captions are required.
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
                <Link href="/speech-to-text/audio-transcription-accuracy" className="hover:underline text-foreground">Transcription Accuracy</Link>: What to Expect
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
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-sm font-bold text-white">
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
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary">
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
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary">
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
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary">
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
                  <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary">
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

      {/* ── Explore Use Cases ── */}
      <Section aria-labelledby="explore-stt-use-cases">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl" id="explore-stt-use-cases">
              Explore Speech-to-Text Use Cases
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover how to transcribe different types of audio and video content with our specific guides.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: '/transcribe-podcast',
                label: 'Podcast Transcription',
                description: 'Convert podcast episodes into searchable show notes and blogs.',
              },
              {
                href: '/transcribe-interview',
                label: 'Interview Transcription',
                description: 'Turn recorded interviews into accurate text for research or journalism.',
              },
              {
                href: '/transcribe-meeting',
                label: 'Meeting Transcription',
                description: 'Generate written records of business meetings and conference calls.',
              },
              {
                href: '/transcribe-lecture',
                label: 'Lecture Transcription',
                description: 'Transcribe academic lectures and seminars for easier studying.',
              },
              {
                href: '/transcribe-video',
                label: 'Video Transcription',
                description: 'Extract and transcribe dialogue from MP4, WebM, and MOV files.',
              },
              {
                href: '/transcribe-voice-memo',
                label: 'Voice Memo Transcription',
                description: 'Turn personal voice notes and quick ideas into written text.',
              },
              {
                href: '/transcribe-webinar',
                label: 'Webinar Transcription',
                description: 'Create text transcripts of recorded webinars for accessibility.',
              },
              {
                href: '/speech-to-text/how-to-transcribe-audio',
                label: 'How to Transcribe Audio',
                description: 'A step-by-step walkthrough on turning any audio file into text.',
              },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {l.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read guide
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

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
