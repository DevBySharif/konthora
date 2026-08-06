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
  title: "Closed Captions vs Subtitles: What's the Difference? | Konthora",
  description:
    "Learn the practical differences between closed captions and subtitles, when to use each format, and how to create subtitle files with Konthora.",
  path: '/captions/closed-captions-vs-subtitles',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function ClosedCaptionsVsSubtitlesPage() {
  const pageUrl = `${siteConfig.url}/captions/closed-captions-vs-subtitles`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Captions', item: `${siteConfig.url}/captions` },
      { '@type': 'ListItem', position: 3, name: 'Closed Captions vs Subtitles', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I use Konthora to create closed captions?",
      answer: "Yes. By uploading your audio or video file, you can generate a timestamped transcript and export it as an SRT or VTT file, which are standard closed caption formats.",
    },
    {
      question: "Does Konthora burn open captions directly into my video?",
      answer: "No. Konthora generates standalone text files (SRT or VTT) that you can upload alongside your video on platforms like YouTube, rather than permanently burning the text into the video image.",
    },
    {
      question: "Will Konthora translate my audio into foreign subtitles?",
      answer: "No. Konthora provides a transcription of the spoken audio in the same language it was spoken. It does not automatically translate dialogue into other languages.",
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
                <Link href="/captions" className="hover:text-foreground transition-colors">
                  Captions
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">Differences</span>
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
            Closed Captions vs Subtitles:{' '}
            <span className="text-gradient">What&apos;s the Difference?</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            While often used interchangeably, closed captions and subtitles serve entirely different purposes. Learn how to distinguish between the two and choose the right format for your audience.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Closed Captions vs Subtitles guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Are Closed Captions? ── */}
            <section aria-labelledby="what-are-closed-captions">
              <h2
                id="what-are-closed-captions"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are Closed Captions?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Closed <Link href="/captions" className="text-primary hover:underline">captions</Link> are text representations of the audio track in a video, designed specifically for viewers who cannot hear the audio. They are &quot;closed&quot; because they exist as a separate file that the viewer can toggle on or off in their video player.
                </p>
                <p>
                  Because they assume the viewer cannot hear anything, closed captions transcribe the spoken dialogue in its original language while also describing essential non-speech audio, such as sound effects or musical cues.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: What Are Subtitles? ── */}
            <section aria-labelledby="what-are-subtitles">
              <h2
                id="what-are-subtitles"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are Subtitles?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Subtitles are text representations of the spoken dialogue in a video, designed for viewers who can hear the audio but do not understand the language being spoken. 
                </p>
                <p>
                  Because they assume the viewer can hear the background noise, subtitles focus entirely on translating the dialogue. They typically exclude descriptions of sound effects or music unless it is crucial to understanding the plot.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Closed Captions vs Subtitles ── */}
            <section aria-labelledby="closed-captions-vs-subtitles-table">
              <h2
                id="closed-captions-vs-subtitles-table"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Closed Captions vs Subtitles
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  The fundamental difference lies in the intended audience: closed captions are for those who cannot hear, while subtitles are for those who cannot understand the language.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Feature</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Closed Captions</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Subtitles</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Intended Audience</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Viewers who cannot hear the audio track</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Viewers who do not understand the spoken language</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Dialogue</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Transcribed in the original spoken language</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Translated into the viewer&apos;s language</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Sound Effects</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Included to provide full context</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Excluded, as the viewer can hear them</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Common Use Cases</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Accessibility, silent autoplay on social media</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Foreign films, international audience reach</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When Should You Use Each? ── */}
            <section aria-labelledby="when-to-use-each">
              <h2
                id="when-to-use-each"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When Should You Use Each?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  You should provide <strong>closed captions</strong> if you want to make your content accessible to all viewers, especially for compliance with accessibility standards. They are also incredibly useful for modern social media consumption, where many viewers watch videos with the sound muted on their mobile devices.
                </p>
                <p>
                  You should provide <strong>subtitles</strong> when you want to expand your audience internationally by offering your content in multiple languages.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Creating Subtitle Files with Konthora ── */}
            <section aria-labelledby="creating-files">
              <h2
                id="creating-files"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Creating Subtitle Files with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Regardless of whether you are displaying captions or subtitles, video players require a standalone text file containing the dialogue and precise timing information.
                </p>
                <p>
                  You can create these files automatically using the <Link href="/audio-to-text" className="text-primary hover:underline">audio to text</Link> tool. By uploading your media file, the system will generate a <Link href="/speech-to-text" className="text-primary hover:underline">speech to text</Link> transcription with embedded <Link href="/speech-to-text/timestamps" className="text-primary hover:underline font-medium">timestamps</Link>.
                </p>
                <p>
                  Once processing is complete, you can export the transcript as either an <Link href="/formats/srt" className="text-primary hover:underline">SRT</Link> or <Link href="/formats/vtt" className="text-primary hover:underline">VTT</Link> file. Because Konthora creates standalone subtitle files rather than permanently burning the text into the video, you retain full control over how they are uploaded and displayed on platforms like YouTube.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to generate a caption file?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your audio or video file and export an SRT or VTT file instantly.
                  </p>
                </div>
                <Link
                  href="/audio-to-text"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <Captions className="h-4 w-4" aria-hidden="true" />
                  Generate Subtitle File
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="cc-subtitles-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="cc-subtitles-faq-heading"
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
