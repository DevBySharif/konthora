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
  FileAudio,
  FileVideo,
  FileText,
  HardDrive,
  Download,
  Volume2,
  AudioLines,
  CheckCircle2,
  AlignLeft,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'Supported Audio, Video & Transcript Formats | Konthora',
  description:
    'Complete reference for Konthora supported formats: MP3 and WAV audio outputs, accepted audio/video inputs for transcription, and TXT, SRT, VTT, and JSON exports.',
  path: '/formats',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function FormatsPage() {
  const pageUrl = `${siteConfig.url}/formats`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Supported Formats', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I upload video files for transcription?",
      answer: "Yes, you can upload MP4, WebM, and MOV files. The system will automatically extract the audio track from the video and process the transcription.",
    },
    {
      question: "What is the maximum file size for uploads?",
      answer: "The transcription tool accepts files up to 100 MB in size and up to 10 minutes in duration.",
    },
    {
      question: "Which format should I use for YouTube subtitles?",
      answer: "Both SRT and VTT are widely supported for subtitles and web captions. SRT is the most universally accepted format for video editors and platforms like YouTube.",
    },
    {
      question: "Are my uploaded files stored permanently?",
      answer: "No. All uploaded media files and generated transcripts are automatically deleted from the server after 60 minutes.",
    },
    {
      question: "Is there a limit on text-to-speech generation?",
      answer: "Yes, each text-to-speech generation is currently limited to 2,000 characters per request.",
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
      <JsonLd schema={faqSchema} />

      {/* ── HERO / INTRO ── */}
      <section
        aria-labelledby="pillar-h1"
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
                <span className="text-foreground font-medium">Formats</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="pillar-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Audio, Video, and Transcript Formats{' '}
            <span className="text-gradient">Supported by Konthora</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            This guide details the media input, generated-audio output, and transcript export formats 
            currently supported by the platform, including limits and practical workflows.
          </p>

        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Supported formats reference" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Audio Outputs for Text-to-Speech ── */}
            <section aria-labelledby="audio-outputs">
              <h2
                id="audio-outputs"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Audio Outputs for Text-to-Speech
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When you convert written text into spoken audio, the resulting file can be downloaded 
                  in two standard formats. Each generation is currently subject to a verified limit of 
                  <strong> 2,000 characters</strong> per request to ensure optimal performance.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <FileAudio className="h-5 w-5 text-primary" /> MP3
                    </h3>
                    <p className="text-sm">
                      A compressed audio format that balances sound quality with smaller file sizes. 
                      Ideal for sharing online, embedding in web pages, or keeping storage requirements low.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <FileAudio className="h-5 w-5 text-primary" /> WAV
                    </h3>
                    <p className="text-sm">
                      An uncompressed audio format that preserves maximum acoustic fidelity. 
                      Ideal for professional editing workflows, video production, or podcast mastering.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/text-to-speech"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                    Open Text-to-Speech Tool
                  </Link>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Supported Audio and Video Inputs ── */}
            <section aria-labelledby="supported-inputs">
              <h2
                id="supported-inputs"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Supported Audio and Video Inputs for Transcription
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  If you are exploring <Link href="/speech-to-text" className="text-primary hover:underline">speech to text</Link> solutions, 
                  you can upload pre-recorded media files directly for processing. The system automatically extracts 
                  the audio track from video files, meaning you do not need to convert video to audio beforehand.
                </p>
                
                <div className="flex flex-col md:flex-row gap-6 mt-6">
                  <div className="flex-1 rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
                      <FileAudio className="h-5 w-5 text-primary" /> Supported Audio
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex gap-2 items-center text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> MP3</li>
                      <li className="flex gap-2 items-center text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> WAV</li>
                      <li className="flex gap-2 items-center text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> M4A</li>
                      <li className="flex gap-2 items-center text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> AAC</li>
                    </ul>
                  </div>
                  
                  <div className="flex-1 rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
                      <FileVideo className="h-5 w-5 text-primary" /> Supported Video
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex gap-2 items-center text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> MP4</li>
                      <li className="flex gap-2 items-center text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> WebM</li>
                      <li className="flex gap-2 items-center text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> MOV</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-secondary/20 border border-secondary/30 flex gap-4 items-start">
                  <HardDrive className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Processing Limits</h4>
                    <p className="text-sm mt-1 text-muted-foreground">
                      Uploaded media files must not exceed <strong>100 MB</strong> in size, and the maximum allowed media duration is <strong>10 minutes</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/audio-to-text"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <AudioLines className="h-4 w-4" aria-hidden="true" />
                    Open Audio-to-Text Tool
                  </Link>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Transcript Export Formats ── */}
            <section aria-labelledby="export-formats">
              <h2
                id="export-formats"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Transcript Export Formats
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  After an audio or video file is processed, you can download the transcription in one of 
                  four formats. Each format serves a specific practical purpose depending on your workflow.
                </p>
                <div className="grid gap-4 mt-6">
                  <div className="rounded-xl border border-border/70 bg-card p-5 flex items-start gap-4">
                    <AlignLeft className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">TXT (Plain Text)</h3>
                      <p className="text-sm mt-1">A simple, readable document containing only the transcribed words without any timestamps or formatting tags.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-5 flex items-start gap-4">
                    <FileText className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">SRT (SubRip Subtitle)</h3>
                      <p className="text-sm mt-1">The most widely accepted format for timed subtitles. Ideal for video editors (Premiere, Resolve) and social platforms.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-5 flex items-start gap-4">
                    <FileText className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">VTT (Web Video Text Tracks)</h3>
                      <p className="text-sm mt-1">A modern caption format designed for HTML5 web video players, supporting precise alignment and styling.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-5 flex items-start gap-4">
                    <Download className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">JSON</h3>
                      <p className="text-sm mt-1">A structured data format that developers use to ingest the transcript and raw timestamp data programmatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How to Choose the Right Format ── */}
            <section aria-labelledby="choosing-formats">
              <h2
                id="choosing-formats"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How to Choose the Right Format
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Selecting the correct file type depends entirely on what you intend to do with the result:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Choose <strong>MP3</strong> for compact audio sharing or web embedding.</li>
                  <li>Choose <strong>WAV</strong> for higher-quality audio editing workflows.</li>
                  <li>Choose <strong>TXT</strong> for a readable plain transcript to review or publish as an article.</li>
                  <li>Choose <strong>SRT</strong> for broadly supported timed subtitles in video editors or YouTube.</li>
                  <li>Choose <strong>VTT</strong> for detailed <Link href="/captions" className="text-primary hover:underline">captions</Link> workflows in HTML5 web players.</li>
                  <li>Choose <strong>JSON</strong> for structured transcript and timestamp data in custom applications.</li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Timestamp Modes and Export Behaviour ── */}
            <section aria-labelledby="timestamp-modes">
              <h2
                id="timestamp-modes"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Timestamp Modes and Export Behaviour
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When exporting to a timed format like SRT or VTT, the pacing of the subtitles is determined 
                  by how the text is grouped. You can adjust the visual density of the export by selecting 
                  different grouping modes:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Sentence timestamps:</strong> Groups text logically by sentence structure, making captions easy to read.</li>
                  <li><strong>Paragraph timestamps:</strong> Creates larger blocks of text on screen, useful for long monologues or transcripts.</li>
                  <li><strong>Word-level timestamps:</strong> Aligns every individual word to its exact timecode, primarily used for dynamic social media captions (e.g., TikTok/Reels text effects).</li>
                </ul>
                <p className="mt-4">
                  For a deeper explanation of how these modes affect readability, read the guide on <Link href="/speech-to-text/timestamps" className="text-primary hover:underline font-medium">transcription timestamps</Link>.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How Uploaded Files and Generated Audio Are Handled ── */}
            <section aria-labelledby="handling-files">
              <h2
                id="handling-files"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How Uploaded Files and Generated Audio Are Handled
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora operates without a user-account system, which directly informs how files are processed 
                  and stored on the server.
                </p>
                <p>
                  For transcription jobs, <strong>uploaded media files</strong> and their corresponding generated transcripts are 
                  held in temporary storage to allow you to preview and download the results. These files are subject to 
                  an automatic 60-minute deletion lifecycle, after which they are permanently removed from the server.
                </p>
                <p>
                  For text-to-speech jobs, the input text is processed entirely in memory, and the <strong>generated TTS audio</strong> 
                  must be downloaded during your active browser session. 
                </p>
                <p>
                  Because there is no long-term file retention, it is important to download your preferred formats 
                  immediately after processing. For more details on data handling, refer to the <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="formats-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="formats-faq-heading"
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
