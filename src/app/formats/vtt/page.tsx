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
  Clock,
  Video,
  MonitorPlay,
  AlignLeft,
  AudioLines,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'What is a VTT File? Understanding WebVTT Captions | Konthora',
  description:
    'Learn how VTT (Web Video Text Tracks) files work, understand their timecode structure, and discover how to export WebVTT transcripts for your web videos.',
  path: '/formats/vtt',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function VttFormatPage() {
  const pageUrl = `${siteConfig.url}/formats/vtt`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Supported Formats', item: `${siteConfig.url}/formats` },
      { '@type': 'ListItem', position: 3, name: 'VTT Files', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Does Konthora burn VTT captions directly into my video?",
      answer: "No, Konthora generates and exports the standalone VTT caption file. You must attach this file to your HTML5 video player or upload it alongside your video to a supported platform.",
    },
    {
      question: "Can I open a VTT file without a video player?",
      answer: "Yes, because a VTT file is a plain text file, you can open, read, and edit it using any standard text editor such as Notepad (Windows) or TextEdit (Mac).",
    },
    {
      question: "What is the difference between VTT and SRT?",
      answer: "While both contain timestamps and text, VTT includes a mandatory WEBVTT header and uses a period for milliseconds, whereas SRT uses a comma. VTT also supports advanced styling specifically for web players.",
    },
    {
      question: "Does Konthora provide a full video editor to edit my VTT captions visually?",
      answer: "No, Konthora does not provide a full video editor. It focuses strictly on generating accurate, standalone audio transcripts and caption files.",
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
                <span className="text-foreground font-medium">VTT Format</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="guide-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            What Is a VTT File?{' '}
            <span className="text-gradient">Understanding WebVTT Captions</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            A WebVTT (Web Video Text Tracks) file, commonly known as a VTT file, is a timed text format 
            specifically designed for displaying <Link href="/captions" className="text-primary hover:underline">captions</Link> or subtitles on web media.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="VTT Format Guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is a VTT File? ── */}
            <section aria-labelledby="what-is-vtt">
              <h2
                id="what-is-vtt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is a VTT File?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A VTT file is a plain text file format used to synchronize text with audio or video content, 
                  most notably within HTML5 video players on the web. It dictates exactly when specific dialogue, 
                  sounds, or descriptions should appear on screen.
                </p>
                <p>
                  Because it is plain text, a VTT file does not contain actual video or audio data. Instead, 
                  it acts as a companion document that web players read in real-time alongside your media. 
                  This makes VTT an essential standard for modern web <Link href="/speech-to-text" className="text-primary hover:underline">speech to text</Link> integration.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: The Basic WebVTT Cue Structure ── */}
            <section aria-labelledby="vtt-structure">
              <h2
                id="vtt-structure"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                The Basic WebVTT Cue Structure
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  VTT files have a specific structure to ensure web browsers can read them correctly. 
                  Every VTT file must begin with a <code>WEBVTT</code> header. Following the header, the 
                  subtitles are divided into individual blocks known as <em>cues</em>.
                </p>
                <p>
                  The timecode format for a VTT cue follows <code>Hours:Minutes:Seconds.Milliseconds</code>, 
                  always using a period (<code>.</code>) to separate seconds from milliseconds.
                </p>
                
                <div className="my-6">
                  <div className="rounded-t-lg bg-card border border-border/70 border-b-0 px-4 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Illustrative VTT Example
                  </div>
                  <pre className="overflow-x-auto p-4 sm:p-6 bg-secondary/10 border border-border/70 rounded-b-lg text-sm font-mono text-foreground">
                    <code>
{`WEBVTT

00:00:01.500 --> 00:00:04.250
This is the first subtitle appearing on a web player.

00:00:04.300 --> 00:00:06.800
Notice the period used before the milliseconds
in the timecode.`}
                    </code>
                  </pre>
                </div>

                <p>
                  Each cue block typically includes:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>The timecode:</strong> A start time and an end time separated by an arrow (<code>--&gt;</code>).</li>
                  <li><strong>The cue text:</strong> The actual dialogue to be displayed on screen.</li>
                  <li><strong>A blank line:</strong> Indicates the end of the current cue and the start of the next.</li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When Is VTT Useful? ── */}
            <section aria-labelledby="when-to-use-vtt">
              <h2
                id="when-to-use-vtt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When Is VTT Useful?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  VTT is specifically designed for the modern web. It is the ideal format when you need to 
                  display subtitles directly in a web browser using standard HTML5 tags.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <MonitorPlay className="h-5 w-5 text-primary" /> Web Development
                    </h3>
                    <p className="text-sm">
                      If you are a developer embedding video into a website, you can use the native HTML <code>&lt;track&gt;</code> element to easily load a VTT file alongside your video source.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Video className="h-5 w-5 text-primary" /> Web Platforms
                    </h3>
                    <p className="text-sm">
                      Many modern online video platforms, e-learning management systems, and media players prefer or require the VTT format for accessible web captioning.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How VTT Differs from SRT and TXT ── */}
            <section aria-labelledby="vtt-vs-srt-txt">
              <h2
                id="vtt-vs-srt-txt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How VTT Differs from SRT and TXT
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  While all three formats are text-based, they serve distinct purposes in media workflows.
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4 items-start">
                    <Clock className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">SRT (SubRip):</strong> <Link href="/formats/srt" className="text-primary hover:underline">SRT files</Link> are the older, more traditional format. They are extremely simple, lack the <code>WEBVTT</code> header, and use a comma for milliseconds. SRT is highly supported by desktop video editors.
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <AlignLeft className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">TXT (Plain Text):</strong> Contains only raw spoken words with absolutely no timestamps. TXT is meant for reading or publishing as an article, but cannot be synced to a video player.
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Exporting VTT Transcripts from Konthora ── */}
            <section aria-labelledby="exporting-vtt">
              <h2
                id="exporting-vtt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Exporting VTT Transcripts from Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Konthora creates the standalone caption/transcript files, but <strong>it does not burn captions permanently into video</strong>. 
                  It provides the raw VTT file for you to upload to your web player or publishing platform.
                </p>
                <p>
                  When you <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> on Konthora, our system generates precise timed data. 
                  You can easily export this data as a WebVTT file. You can also customize how the text is grouped—by sentence or paragraph—using our options for <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">transcription timestamps</Link>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to create WebVTT captions?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload an audio or video file to generate a timed VTT transcript automatically.
                  </p>
                </div>
                <Link
                  href="/audio-to-text"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  Try Audio-to-Text
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="vtt-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="vtt-faq-heading"
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
