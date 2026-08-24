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
  FileText,
  AlignLeft,
  AudioLines,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'What Is a TXT Transcript File? | Konthora Formats',
  description:
    'Learn what a plain-text TXT transcript is, what information it preserves, and how to export readable transcriptions from Konthora.',
  path: '/formats/txt',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TxtFormatPage() {
  const pageUrl = `${siteConfig.url}/formats/txt`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Supported Formats', item: `${siteConfig.url}/formats` },
      { '@type': 'ListItem', position: 3, name: 'TXT Transcript', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I use a TXT file as video subtitles?",
      answer: "A standard TXT file lacks the required timecodes to sync with video playback. If you need timed subtitles, you should export your transcription as SRT or VTT instead.",
    },
    {
      question: "Are timestamps included in the TXT export?",
      answer: "Yes. Konthora&apos;s TXT export places a readable display timestamp, such as [00:00], before each transcript block. It does not use the start-and-end cue structure required by SRT or VTT subtitle files.",
    },
    {
      question: "Is there a limit on how long the transcript can be?",
      answer: "Transcriptions are subject to the same upload limits as all audio processing: files up to 100 MB and up to 10 minutes in duration.",
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
        aria-labelledby="guide-h1"
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
                <Link href="/formats" className="hover:text-foreground transition-colors">
                  Formats
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">TXT</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Format Reference
          </p>

          {/* H1 */}
          <h1
            id="guide-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            What Is a <span className="text-gradient">TXT Transcript File?</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            A practical guide to understanding the plain-text transcript export format, including what information it preserves and when it is the best choice for your workflow.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="TXT format guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is a TXT Transcript File? ── */}
            <section aria-labelledby="what-is-txt">
              <h2
                id="what-is-txt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is a TXT Transcript File?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A TXT (Plain Text) file is one of the simplest digital document formats. When you export a transcription from Konthora as a TXT file, you receive readable transcript blocks with a display timestamp before each block.
                </p>
                <p>
                  Unlike specialized subtitle formats, a TXT export does not include cue end times, sequential cue numbers, or the player-specific syntax used by SRT and VTT.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: What a TXT Transcript Contains ── */}
            <section aria-labelledby="what-it-contains">
              <h2
                id="what-it-contains"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What a TXT Transcript Contains
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When you export your transcription to TXT, the output preserves the recognized text and places a display timestamp before each block. The selected timestamp grouping determines how the text is organized into readable blocks.
                </p>
                <div className="my-8 rounded-xl bg-zinc-950 border border-border/70 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
                    <AlignLeft className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-300 font-mono">transcript_example.txt</span>
                  </div>
                  <div className="p-4 sm:p-6 overflow-x-auto">
                    <pre className="text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
{`[00:00]
This is an example of a plain text transcript export.

[00:04]
The text remains easy to read, copy, and paste without subtitle cue syntax.`}
                    </pre>
                  </div>
                </div>
                <p>
                  <strong>What TXT does not preserve:</strong> A TXT export does not include subtitle cue end times, sequential cue numbers, or the nested data structure used for programmatic processing.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When Is TXT Useful? ── */}
            <section aria-labelledby="when-to-use">
              <h2
                id="when-to-use"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When Is TXT Useful?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Because it is completely unformatted, the TXT format is universally supported across virtually all operating systems and word processors. You should choose the TXT format when your primary goal is <em>readability</em> rather than synchronization.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Review and Archiving:</strong> Reading a plain text document is much easier than reading a subtitle file filled with timecodes.</li>
                  <li><strong>Content Repurposing:</strong> If you are converting a podcast or video into a blog post, a TXT file gives you a clean foundation to start editing.</li>
                  <li><strong>Searchability:</strong> TXT files are easily indexed and searched by your local computer or document management system.</li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How TXT Differs from SRT, VTT, and JSON ── */}
            <section aria-labelledby="how-it-differs">
              <h2
                id="how-it-differs"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How TXT Differs from SRT, VTT, and JSON
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  While a TXT file is perfect for reading, it is missing the metadata required for specific workflows. Here is how it compares to the other <Link href="/formats" className="text-primary hover:underline">formats</Link> available in Konthora:
                </p>
                <ul className="space-y-4 mt-6">
                  <li className="flex gap-4 items-start">
                    <FileText className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground"><Link href="/formats/srt" className="text-foreground hover:underline">SRT</Link> and <Link href="/formats/vtt" className="text-foreground hover:underline">VTT</Link>:</strong> 
                      These are timed subtitle formats. They include exact start and end timestamps (for example, <code>00:01:15.500</code>) for every cue. TXT display timestamps are useful for reading but do not make a file suitable for video synchronization.
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <FileText className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">JSON:</strong> 
                      This is a structured data format containing segments and, when word mode is selected, <Link href="/speech-to-text/timestamps" className="text-primary hover:underline font-medium">word-level timestamps</Link>. It is intended for software workflows, whereas TXT is designed for human reading.
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Exporting a TXT Transcript from Konthora ── */}
            <section aria-labelledby="exporting-txt">
              <h2
                id="exporting-txt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Exporting a TXT Transcript from Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  You can generate a plain-text transcript directly within the <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> workspace. 
                </p>
                <p>
                  Upload your media file (up to 100 MB and 10 minutes), select your pacing mode, and run the transcription. Once complete, select <strong>TXT</strong> from the export options to download your readable document.
                </p>
                <p className="text-sm border-l-4 border-primary/40 pl-4 italic">
                  Note: Uploaded media files and their resulting transcripts are temporarily held to allow you to preview and download the results. They are deleted automatically after 60 minutes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to create a transcript?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your audio or video file and export a clean TXT document instantly.
                  </p>
                </div>
                <Link
                  href="/audio-to-text"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  Open Transcription Tool
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="txt-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="txt-faq-heading"
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
