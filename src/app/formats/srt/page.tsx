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
  title: 'What is an SRT File? Understanding SubRip Subtitles | Konthora',
  description:
    'Learn how SRT (SubRip Subtitle) files work, understand their timecode structure, and discover how to export timestamped audio transcripts for your videos.',
  path: '/formats/srt',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function SrtFormatPage() {
  const pageUrl = `${siteConfig.url}/formats/srt`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Supported Formats', item: `${siteConfig.url}/formats` },
      { '@type': 'ListItem', position: 3, name: 'SRT Files', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Does Konthora burn SRT captions directly into my video?",
      answer: "No, Konthora generates and exports the standalone SRT subtitle file. You must import this file into a video editor (like Premiere or Resolve) or upload it as a sidecar file to a platform (like YouTube) to display the captions.",
    },
    {
      question: "Can I open an SRT file without a video editor?",
      answer: "Yes, because an SRT file is simply plain text, you can open, read, and edit it using any standard text editor such as Notepad (Windows) or TextEdit (Mac).",
    },
    {
      question: "What is the difference between SRT and VTT?",
      answer: "While both are text-based caption formats, SRT is older, simpler, and more universally supported by desktop video editors. VTT is a newer format designed specifically for HTML5 web players and supports advanced styling and positioning.",
    },
    {
      question: "Can I choose how the text is grouped in my SRT export?",
      answer: "Yes, when exporting from Konthora, you can choose to group the timestamps by word, sentence, or paragraph to control how the subtitles appear on screen.",
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
                <span className="text-foreground font-medium">SRT Format</span>
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
            What is an SRT File?{' '}
            <span className="text-gradient">Understanding Subtitle Formats</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            SRT is the most universally accepted file format for timed subtitles. Learn how its timecode 
            structure works, when it is most useful, and how to export your audio transcripts as SRT files.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="SRT Format Guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is an SRT File? ── */}
            <section aria-labelledby="what-is-srt">
              <h2
                id="what-is-srt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is an SRT File?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  An SRT file (SubRip Subtitle) is a plain text file that contains dialogue and the exact 
                  timestamps dictating when that dialogue should appear on screen. It is one of the oldest 
                  and most universally supported subtitle formats in video production.
                </p>
                <p>
                  Because it is plain text, an SRT file does not contain any video or audio data itself. 
                  Instead, it acts as a set of instructions. When you load an SRT file into a video player 
                  or an editing program alongside a media file, the software reads the timestamps and displays 
                  the text at the correct moments.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: The Basic SRT Cue Structure ── */}
            <section aria-labelledby="srt-structure">
              <h2
                id="srt-structure"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                The Basic SRT Cue Structure
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Every subtitle in an SRT file is written in a strict, four-part block known as a <em>cue</em>. 
                  The timecode format always follows the structure of <code>Hours:Minutes:Seconds,Milliseconds</code>.
                </p>
                
                <div className="my-6">
                  <div className="rounded-t-lg bg-card border border-border/70 border-b-0 px-4 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Illustrative SRT Example
                  </div>
                  <pre className="overflow-x-auto p-4 sm:p-6 bg-secondary/10 border border-border/70 rounded-b-lg text-sm font-mono text-foreground">
                    <code>
{`1
00:00:01,500 --> 00:00:04,250
This is the first subtitle appearing on screen.

2
00:00:04,300 --> 00:00:06,800
It tells the video player exactly when to appear
and when to disappear.`}
                    </code>
                  </pre>
                </div>

                <p>
                  Each cue contains:
                </p>
                <ul className="list-decimal pl-5 space-y-2">
                  <li><strong>A sequence number:</strong> Indicates the order of the subtitle.</li>
                  <li><strong>The timecode:</strong> A start time and an end time separated by an arrow (<code>--&gt;</code>).</li>
                  <li><strong>The text:</strong> The actual dialogue to be displayed on screen.</li>
                  <li><strong>A blank line:</strong> Indicates the end of the current cue and the start of the next.</li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When Is SRT Useful? ── */}
            <section aria-labelledby="when-to-use-srt">
              <h2
                id="when-to-use-srt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When Is SRT Useful?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  SRT is the default format for almost all <Link href="/speech-to-text" className="text-primary hover:underline">speech to text</Link> transcription workflows that involve video. 
                  It is particularly useful because of its broad compatibility:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <MonitorPlay className="h-5 w-5 text-primary" /> Video Editing
                    </h3>
                    <p className="text-sm">
                      Desktop editing software like Adobe Premiere Pro, Final Cut, and DaVinci Resolve 
                      can natively import SRT files, turning them directly into editable caption tracks.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Video className="h-5 w-5 text-primary" /> Social Platforms
                    </h3>
                    <p className="text-sm">
                      Platforms like YouTube, LinkedIn, and Facebook allow you to upload an SRT file 
                      alongside your video to provide accurate closed <Link href="/captions" className="text-primary hover:underline">captions</Link> for viewers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How SRT Differs from TXT and VTT ── */}
            <section aria-labelledby="srt-vs-txt-vtt">
              <h2
                id="srt-vs-txt-vtt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How SRT Differs from TXT and VTT
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When exporting an audio transcript, you must choose the format that matches your workflow.
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4 items-start">
                    <AlignLeft className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">TXT (Plain Text):</strong> Contains only the spoken words. 
                      It lacks timestamps entirely. If you only want to read the transcript or publish it as an article, 
                      choose TXT. If you need the text synced to video, a TXT file will not work.
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Clock className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">VTT (Web Video Text Tracks):</strong> Like SRT, VTT contains timestamps and dialogue. However, VTT is a newer format designed specifically for HTML5 web players. It supports advanced features like styling, positioning, and metadata, whereas SRT remains strictly structural.
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Exporting Timestamps from Konthora ── */}
            <section aria-labelledby="exporting-srt">
              <h2
                id="exporting-srt"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Exporting SRT Transcripts from Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Konthora generates the raw transcript and structural files, but <strong>it does not burn captions permanently into your video</strong>. 
                  Instead, it exports the standalone SRT file for you to use in your own editing or publishing workflow.
                </p>
                <p>
                  When you <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> on Konthora, the system calculates precise timestamps. 
                  Before downloading the SRT file, you can adjust how the text is grouped—by sentence, paragraph, or 
                  individual word—depending on your visual preference. For more details on these grouping options, 
                  refer to the guide on <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">transcription timestamps</Link>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to create subtitles?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload an audio or video file to generate a timed SRT transcript automatically.
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
      <Section className="bg-secondary/10" id="srt-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="srt-faq-heading"
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
