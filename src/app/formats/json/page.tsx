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
  Braces,
  FileCode2,
  AudioLines,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'What Is a JSON Transcript File? | Konthora Formats',
  description:
    'Learn what a JSON transcript export is, what structured transcript data means, and when to use JSON for transcription workflows in Konthora.',
  path: '/formats/json',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function JsonFormatPage() {
  const pageUrl = `${siteConfig.url}/formats/json`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Supported Formats', item: `${siteConfig.url}/formats` },
      { '@type': 'ListItem', position: 3, name: 'JSON Transcript', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I use JSON files as video subtitles?",
      answer: "No. While JSON contains all the necessary timing information, video players and platforms like YouTube do not natively read JSON. You should export SRT or VTT for subtitles.",
    },
    {
      question: "Is the JSON format human-readable?",
      answer: "While it is plain text and technically readable by humans, JSON is formatted with strict brackets and commas designed for machines. For a readable document, export a TXT file instead.",
    },
    {
      question: "Are timestamps included in the JSON export?",
      answer: "Yes, JSON exports contain start and end timestamps for the transcribed segments to allow precise alignment.",
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
                <span className="text-foreground font-medium">JSON</span>
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
            What Is a <span className="text-gradient">JSON Transcript File?</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            A practical guide to understanding the JSON transcript export format, what structured transcript data means, and when you should choose it for your workflows.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="JSON format guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is a JSON Transcript File? ── */}
            <section aria-labelledby="what-is-json">
              <h2
                id="what-is-json"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is a JSON Transcript File?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A JSON (JavaScript Object Notation) file is a lightweight, text-based format used to store and transport data. When you export a transcription from Konthora as a JSON file, you receive the spoken words alongside their structural data in a strict, predictable layout.
                </p>
                <p>
                  Unlike standard documents or subtitles designed for media players, JSON is designed to be easily read, parsed, and utilized by software applications and custom scripts.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: What Structured Transcript Data Means ── */}
            <section aria-labelledby="structured-data">
              <h2
                id="structured-data"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Structured Transcript Data Means
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Structured data refers to information that has been organized into a standardized format. In a JSON transcript, the full text of the audio is paired with granular details about when each piece of text was spoken.
                </p>
                <p>
                  Rather than a simple block of text, the JSON output breaks the transcript down into segments, capturing the exact start and end timestamps for each recognized phrase. This allows developers to precisely map the text back to the original audio timeline.
                </p>
                <div className="my-8 rounded-xl bg-zinc-950 border border-border/70 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
                    <Braces className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-300 font-mono">transcript_example.json</span>
                  </div>
                  <div className="p-4 sm:p-6 overflow-x-auto">
                    <pre className="text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
{`{
  "text": "This is an illustrative transcript example.",
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "This is an illustrative transcript example."
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When Is JSON Useful? ── */}
            <section aria-labelledby="when-to-use">
              <h2
                id="when-to-use"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When Is JSON Useful?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  JSON is the ideal format when you intend to process the transcription programmatically. It should be chosen over other formats when building custom tools or integrating the data into a larger pipeline.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Custom Search Tools:</strong> Developers can ingest the JSON data into a database to build applications that search for specific phrases and jump to their exact timestamps in an audio file.</li>
                  <li><strong>Data Analysis:</strong> The structured format makes it easy to write scripts that count words, measure speaking rates, or analyze the overall structure of the transcript.</li>
                  <li><strong>Custom Player Interfaces:</strong> If you are building a custom media player on the web, JSON allows you to render interactive <Link href="/speech-to-text/timestamps" className="text-primary hover:underline font-medium">transcription timestamps</Link> that highlight text as the audio plays.</li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: JSON Compared with TXT, SRT and VTT ── */}
            <section aria-labelledby="json-compared">
              <h2
                id="json-compared"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                JSON Compared with TXT, SRT and VTT
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  While all four <Link href="/formats" className="text-primary hover:underline">formats</Link> contain the same core transcribed words, they serve entirely different purposes:
                </p>
                <ul className="space-y-4 mt-6">
                  <li className="flex gap-4 items-start">
                    <FileCode2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">JSON vs. <Link href="/formats/txt" className="text-foreground hover:underline">TXT</Link>:</strong> 
                      TXT is designed strictly for human readability and strips away all timestamps. JSON retains the timestamps and structures them for machines.
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <FileCode2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">JSON vs. <Link href="/formats/srt" className="text-foreground hover:underline">SRT</Link> & <Link href="/formats/vtt" className="text-foreground hover:underline">VTT</Link>:</strong> 
                      SRT and VTT are specifically formatted to be read by video players to display on-screen subtitles. A video player will not know how to display a JSON file, even though it contains the necessary timing data.
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Exporting JSON from Konthora ── */}
            <section aria-labelledby="exporting-json">
              <h2
                id="exporting-json"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Exporting JSON from Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  You can generate structured JSON data directly within the <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> workspace. 
                </p>
                <p>
                  Upload your media file—subject to the standard 100 MB and 10-minute limits—and process the transcription. Once complete, select <strong>JSON</strong> from the export options to download the structured data to your device.
                </p>
                <p className="text-sm border-l-4 border-primary/40 pl-4 italic">
                  Note: Konthora does not require an account, meaning your uploaded files and the generated JSON data are deleted automatically from the server after 60 minutes. Download your files during your active session.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to export structured data?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your audio or video file and export a detailed JSON file instantly.
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
      <Section className="bg-secondary/10" id="json-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="json-faq-heading"
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
