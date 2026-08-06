import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Captions } from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: "Subtitle and Transcript Formats: SRT, VTT, TXT, and JSON | Konthora",
  description:
    "Learn the practical differences between SRT, VTT, TXT, and JSON formats, and discover how to choose the right format for your subtitle and transcription workflows.",
  path: '/captions/subtitle-formats',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function SubtitleFormatsPage() {
  const pageUrl = `${siteConfig.url}/captions/subtitle-formats`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Captions', item: `${siteConfig.url}/captions` },
      { '@type': 'ListItem', position: 3, name: 'Subtitle Formats', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Which format should I use for YouTube?",
      answer: "SRT is the most commonly recommended format for major video platforms because it is simple and widely supported.",
    },
    {
      question: "Does Konthora burn these formats into my video?",
      answer: "No. Konthora generates standalone subtitle and transcript files (SRT, VTT, TXT, or JSON). It does not burn captions into the video or provide a full video editor.",
    },
    {
      question: "What is the difference between SRT and VTT?",
      answer: "Both are timed subtitle formats, but VTT was developed specifically for HTML5 web video.",
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
        aria-labelledby="formats-h1"
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
                <Link href="/captions" className="hover:text-foreground transition-colors">
                  Captions
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
            id="formats-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Subtitle and Transcript Formats:{' '}
            <span className="text-gradient">SRT, VTT, TXT, and JSON</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            When you generate a transcript, choosing the right file format is essential for your workflow. Learn when to use timed subtitle formats like SRT and VTT versus readable transcripts like TXT or structured data like JSON.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Subtitle formats guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Are Subtitle and Transcript Formats? ── */}
            <section aria-labelledby="what-are-formats">
              <h2
                id="what-are-formats"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are Subtitle and Transcript Formats?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When you extract spoken text from audio or video, the output needs to be saved in a file format. The format you choose determines how the text can be used later. Konthora supports exporting transcripts in four standalone <Link href="/formats" className="text-primary hover:underline">formats</Link>: SRT, VTT, TXT, and JSON.
                </p>
                <p>
                  Some formats (like SRT and VTT) contain embedded <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">timestamps</Link>, making them ideal for displaying timed <Link href="/captions/closed-captions-vs-subtitles" className="text-primary hover:underline">closed captions</Link> alongside a video. Other formats (like TXT) are simply readable text, while formats like JSON are designed to be parsed by software applications.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: SRT for Timed Subtitles ── */}
            <section aria-labelledby="srt-format">
              <h2
                id="srt-format"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                SRT for Timed Subtitles
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> (SubRip Subtitle) is the most widely supported timed subtitle format. It consists of sequential numbers, start and end timestamps, and the text that should appear on screen. 
                </p>
                <p>
                  Because of its simplicity, SRT is highly recommended when <Link href="/captions/how-to-add-captions-to-video" className="text-primary hover:underline">adding captions to a video</Link> platform or importing captions into a standard video editor. It provides the essential timing data required to align text with speech.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: VTT for Web Captions ── */}
            <section aria-labelledby="vtt-format">
              <h2
                id="vtt-format"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                VTT for Web Captions
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link> (WebVTT) is a more modern timed subtitle format designed specifically for the HTML5 <code>&lt;track&gt;</code> element used in web video players. Like SRT, it includes exact start and end timestamps.
                </p>
                <p>
                  VTT is often the preferred choice for developers building custom web video experiences, as it is the native format for web browsers.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: TXT for Plain Transcripts ── */}
            <section aria-labelledby="txt-format">
              <h2
                id="txt-format"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                TXT for Plain Transcripts
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <Link href="/formats/txt" className="text-primary hover:underline">TXT</Link> is a standard plain text file format. When you export a transcript as a TXT file, you receive only the readable words, without any embedded timestamps or structural data.
                </p>
                <p>
                  TXT is the best format if you want to read the transcript like a document, copy and paste the text into an article, or review the content without the distraction of subtitle timing codes.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: JSON for Structured Transcript Data ── */}
            <section aria-labelledby="json-format">
              <h2
                id="json-format"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                JSON for Structured Transcript Data
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <Link href="/formats/json" className="text-primary hover:underline">JSON</Link> is a lightweight data-interchange format designed to be easily parsed by software. A JSON transcript file contains highly structured data, often breaking down the transcript word-by-word alongside detailed timing information.
                </p>
                <p>
                  JSON is primarily used when you need to process transcript data programmatically, such as building custom search interfaces or organizing transcript text and timestamp data for structured workflows.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Which Format Should You Choose? ── */}
            <section aria-labelledby="which-format-to-choose">
              <h2
                id="which-format-to-choose"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Which Format Should You Choose?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Selecting the right format depends entirely on what you intend to do with the generated text. The table below summarizes the key differences.
                </p>
              </div>

              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Format</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Best For</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Includes Timing</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Typical Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">SRT</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">General video platforms and editors</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Uploading captions to video hosting sites</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">VTT</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">HTML5 web video players</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Custom web development</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">TXT</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Reading and archiving</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Plain text documents and articles</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">JSON</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Structured transcript data</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Organizing transcript text and timestamp data for structured workflows</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to export your file?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your media to transcribe and download standalone SRT, VTT, TXT, or JSON files instantly.
                  </p>
                </div>
                <Link
                  href="/audio-to-text"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <Captions className="h-4 w-4" aria-hidden="true" />
                  Generate Subtitles
                </Link>
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
