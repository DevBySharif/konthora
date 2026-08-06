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
  title: "How to Add Captions to a Video | Konthora",
  description:
    "Learn the 3-step workflow to generate a transcript, export an SRT or VTT subtitle file, and add it to a compatible video platform or editor.",
  path: '/captions/how-to-add-captions-to-video',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function HowToAddCaptionsPage() {
  const pageUrl = `${siteConfig.url}/captions/how-to-add-captions-to-video`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Captions', item: `${siteConfig.url}/captions` },
      { '@type': 'ListItem', position: 3, name: 'How to Add Captions to a Video', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Add Captions to a Video',
    description: 'Learn how to generate a transcript, export a subtitle file, and add it to your video player or editor.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Generate a Transcript',
        text: 'Upload your video or audio file to generate an automatic, timestamped transcription.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Export a Subtitle File',
        text: 'Export the transcription as a standalone SRT or VTT subtitle file.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Add the Subtitle File to Your Video Platform or Editor',
        text: 'Upload or import the exported SRT or VTT file into a compatible video platform or editor.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Does Konthora burn the captions directly into my video?",
      answer: "No. Konthora generates standalone subtitle files (like SRT or VTT) that you must upload to your video player or editor alongside your video.",
    },
    {
      question: "Can I use Konthora as a video editor?",
      answer: "No. Konthora is specifically designed to handle the transcription and subtitle export steps. You must use a separate video editing software to edit your video or embed open captions.",
    },
    {
      question: "Do I need to create an account to get a caption file?",
      answer: "No account is required. The transcription is processed in your browser, and you can download your standalone subtitle file immediately.",
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
                <Link href="/captions" className="hover:text-foreground transition-colors">
                  Captions
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">How-to Guide</span>
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
            How to Add <span className="text-gradient">Captions to a Video</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Adding text to your video content doesn&apos;t require complex editing software. Learn the simple workflow to generate a transcript and export a standalone subtitle file for any platform.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="How to add captions to video guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Captions Matter ── */}
            <section aria-labelledby="why-captions-matter">
              <h2
                id="why-captions-matter"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Captions Matter
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Providing <Link href="/captions/closed-captions-vs-subtitles" className="text-primary hover:underline">closed captions</Link> ensures that your content is accessible to viewers who are deaf or hard of hearing. It also benefits viewers watching in loud environments or those who prefer to consume social media content with their sound muted.
                </p>
                <p>
                  Instead of manually typing out dialogue and trying to sync it to the video timeline in an editing program, the modern workflow relies on automatically generated text files that video players read alongside the video.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Step 1: Generate a Transcript ── */}
            <section aria-labelledby="step-1">
              <h2
                id="step-1"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Step 1: Generate a Transcript
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The first step is to turn the spoken words in your video into written text.
                </p>
                <p>
                  You can use Konthora&apos;s <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> tool for this. Simply upload your video or audio file directly into the browser. The system will automatically extract the audio and process a <Link href="/speech-to-text" className="text-primary hover:underline">speech to text</Link> transcription.
                </p>
                <p>
                  Before transcribing, you can choose a timestamp mode—such as sentence or paragraph grouping—which dictates how the text will be paced when it finally appears on screen.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Step 2: Export a Subtitle File ── */}
            <section aria-labelledby="step-2">
              <h2
                id="step-2"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Step 2: Export a Subtitle File
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Once the transcription is complete, you need to download the text. Video platforms do not accept plain documents like TXT or JSON for closed captions. They require specialized formats that contain precise timing data.
                </p>
                <p>
                  From the export options, select either <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link>. Konthora will instantly generate and download a standalone subtitle file to your computer.
                </p>
                <p>
                  This file acts as a script that tells the video player exactly when to display each line of text.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Step 3: Add the Subtitle File to Your Video Platform or Editor ── */}
            <section aria-labelledby="step-3">
              <h2
                id="step-3"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Step 3: Add the Subtitle File to Your Video Platform or Editor
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora does not edit your original video file or permanently burn the text into the image. Instead, you use the subtitle file you just downloaded.
                </p>
                <p>
                  The exported SRT or VTT file can be uploaded or imported into a compatible video platform or editor.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Which Export Format Should You Choose? ── */}
            <section aria-labelledby="export-format">
              <h2
                id="export-format"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Which Export Format Should You Choose?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  If you are uploading to a major social media platform or dropping the file into a video editor, <strong>SRT</strong> is the most universally accepted format. 
                </p>
                <p>
                  If you are building a custom HTML5 web player for a website, <strong>VTT</strong> is the modern standard designed specifically for the web.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to start?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your media and export a caption file.
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
      <Section className="bg-secondary/10" id="captions-workflow-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="captions-workflow-faq-heading"
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
