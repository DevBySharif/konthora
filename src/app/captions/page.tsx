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
  title: 'Captions and Subtitles: What They Are and Why They Matter | Konthora',
  description:
    'Learn the difference between captions and subtitles, what closed captions are, and how to create SRT or VTT caption files for free with Konthora.',
  path: '/captions',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function CaptionsPage() {
  const pageUrl = `${siteConfig.url}/captions`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Captions', item: pageUrl },
    ],
  };

  /* ── Schema: Article ── */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Captions and Subtitles: What They Are and Why They Matter',
    description:
      'Learn the difference between captions and subtitles, what closed captions are, what SRT and VTT files are, and how to generate captions for free.',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Konthora',
      url: siteConfig.url,
    },
    mainEntityOfPage: pageUrl,
  };

  /* ── Schema: HowTo — "How to Create Captions for Your Video" ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Captions for Your Video',
    description:
      'Generate SRT or VTT captions from your audio or video file in four steps using Konthora — free, no account required.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload your video or audio file',
        text: "Go to Konthora’s audio-to-text tool. Upload your MP4, WebM, MOV, or audio file. Konthora extracts the audio track automatically.",
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select a timestamp mode',
        text: 'Choose sentence-level or paragraph-level timestamps, as caption files require these timings to display text on screen correctly.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Transcribe',
        text: 'Click Transcribe Audio. Konthora uses speech recognition to convert the spoken audio into text with timestamps.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Export as SRT or VTT',
        text: 'Download your transcript in SRT or VTT format. You can then upload this file alongside your video on platforms like YouTube or your own video player.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "What is the difference between captions and subtitles?",
      answer:
        "Captions are a transcription of the spoken dialogue and non-speech audio (like sound effects) in the same language, intended for viewers who cannot hear the audio. Subtitles are a translation of the spoken dialogue into another language, intended for viewers who can hear the audio but don't understand the language spoken.",
    },
    {
      question: "What are closed captions?",
      answer:
        "Closed captions (CC) are captions that the viewer can turn on or off via their video player. They exist as a separate file (like an SRT or VTT file) alongside the video. Open captions, in contrast, are permanently burned into the video image and cannot be turned off.",
    },
    {
      question: "What file format are captions in?",
      answer:
        "The most common caption formats on the web are SRT (SubRip Subtitle) and VTT (WebVTT). Both are plain text files that contain the text to be displayed along with exact start and end timestamps.",
    },
    {
      question: "Do I need software to create captions?",
      answer:
        "No. You can generate captions in your browser for free using Konthora. By uploading your video or audio file, Konthora uses automatic speech recognition to transcribe the audio and provides downloadable SRT or VTT files, with no account required.",
    },
    {
      question: "Can I add captions to a YouTube video?",
      answer:
        "Yes. YouTube allows you to upload an SRT or VTT caption file for your videos. You can use Konthora to generate an SRT file from your video's audio, download it, and then upload it to your YouTube Studio under the Subtitles section.",
    },
    {
      question: "Are captions required for accessibility?",
      answer:
        "Yes, in many jurisdictions and under standards like the Web Content Accessibility Guidelines (WCAG), providing closed captions for pre-recorded video is a requirement to make content accessible to people who are deaf or hard of hearing.",
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
        aria-labelledby="captions-h1"
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
                <span className="text-foreground font-medium">Captions</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="captions-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Captions and Subtitles:{' '}
            <span className="text-gradient">What They Are and Why They Matter</span>
          </h1>

          {/* Search promise — delivered before first scroll */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Captions display the spoken words in a video as on-screen text, while
            subtitles translate speech from one language to another. Closed captions also
            include non-speech audio descriptions — such as [music playing] or [door slams]
            — making them essential for accessibility. Both are typically delivered as SRT
            or VTT files that a video player reads alongside the video.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/audio-to-text"
              id="captions-hero-cta"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Captions className="h-4 w-4" aria-hidden="true" />
              Generate Captions Free — Export as SRT or VTT
            </Link>
          </div>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Captions and Subtitles guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Are Captions? ── */}
            <section aria-labelledby="what-are-captions">
              <h2
                id="what-are-captions"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are Captions?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Captions provide a text display of spoken words in a video, presented
                  in the same language that is being spoken. Their primary purpose is to
                  provide an alternative for viewers who cannot hear the audio track.
                </p>
                <p>
                  Crucially, captions do not just transcribe speech. They also include
                  textual descriptions of non-speech audio elements that are important to
                  understanding the video. This includes speaker identification (e.g.,
                  &quot;John: Hello&quot;), sound effects (e.g., &quot;[doorbell rings]&quot;), and musical
                  cues (e.g., &quot;[upbeat music playing]&quot;).
                </p>
              </div>
            </section>

            {/* Divider */}
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
                  Subtitles provide a text translation of spoken words in a video into a
                  different language. They assume the viewer can hear the audio but does
                  not understand the language being spoken.
                </p>
                <p>
                  Because subtitles assume the viewer can hear, they typically do not
                  include descriptions of sound effects, musical cues, or speaker
                  identifications unless the speaker is off-screen and it is unclear
                  who is speaking.
                </p>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-border/40" />

            {/* ── H2: Captions vs. Subtitles: The Key Differences ── */}
            <section aria-labelledby="captions-vs-subtitles">
              <h2
                id="captions-vs-subtitles"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                <Link href="/captions/closed-captions-vs-subtitles" className="hover:underline text-foreground">Captions vs. Subtitles</Link>: The Key Differences
              </h2>
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Feature</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Captions</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Subtitles</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Primary Audience</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Viewers who cannot hear the audio</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Viewers who do not understand the language</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Language</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Same language as the spoken audio</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Translated into another language</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Non-Speech Audio</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Included (e.g., sound effects, music)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Not typically included</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Speaker IDs</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Included</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Usually omitted</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Open Captions vs. Closed Captions ── */}
            <section aria-labelledby="open-vs-closed-captions">
              <h2
                id="open-vs-closed-captions"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Open Captions vs. Closed Captions
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Closed captions (CC)</strong> are
                  separate from the video file itself. They can be turned on or off by the
                  viewer using their video player. They are usually delivered as a separate
                  text file, such as an SRT or VTT file, which is uploaded alongside the video.
                </p>
                <p>
                  <strong className="text-foreground">Open captions</strong> (also known as
                  &quot;burned-in&quot; or &quot;hardcoded&quot; captions) are permanently encoded into the
                  video image. They cannot be turned off by the viewer. Open captions are
                  useful when a video player does not support closed captioning or when
                  you want to ensure the captions are always visible, such as on social
                  media platforms where videos often autoplay without sound.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Caption File Formats: SRT and VTT ── */}
            <section aria-labelledby="caption-file-formats">
              <h2
                id="caption-file-formats"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                <Link href="/captions/subtitle-formats" className="hover:underline text-foreground">Caption File Formats</Link>: SRT and VTT
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  To display closed captions or subtitles, video players require a text
                  file that contains the dialogue alongside precise timing information.
                  The two most common <span className="font-medium text-foreground">SRT and VTT file formats</span> used on the web are SRT and WebVTT.
                </p>
              </div>

              {/* H3: SRT Files */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-3">SRT Files</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  SRT (SubRip Subtitle) is the most widely supported caption format. It is a
                  simple, plain-text format containing a sequence number, a start and end
                  timestamp, and the caption text.
                </p>
                <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800/80 shadow-inner overflow-hidden">
                  <pre className="text-sm font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {`1
00:00:01,500 --> 00:00:04,200
Welcome to our video on captions.

2
00:00:04,500 --> 00:00:07,800
Today, we will learn about SRT and VTT files.`}
                  </pre>
                </div>
              </div>

              {/* H3: VTT Files */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">VTT Files</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  VTT (WebVTT) is the modern standard for HTML5 web video. It is similar
                  to SRT but supports additional styling and positioning data, allowing
                  captions to be moved around the screen to avoid obscuring important video
                  content.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How to Create Captions for Your Video ── */}
            <section aria-labelledby="how-to-create-captions" id="how-to-create-captions-section">
              <h2
                id="how-to-create-captions"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                <Link href="/captions/how-to-add-captions-to-video" className="hover:underline text-foreground">How to Create Captions for Your Video</Link>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                You can generate SRT or VTT files automatically using Konthora&apos;s free{' '}
                <Link
                  href="/speech-to-text"
                  className="text-primary underline-offset-4 hover:underline transition-colors"
                >
                  speech-to-text transcription
                </Link>{' '}
                tool.
              </p>

              {/* Numbered steps grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    n: 1,
                    title: 'Upload your file',
                    body: 'Go to Konthora’s audio-to-text tool. Upload your MP4, WebM, MOV, or audio file. Konthora extracts the audio track automatically.',
                  },
                  {
                    n: 2,
                    title: 'Select a timestamp mode',
                    body: 'Choose sentence-level or paragraph-level timestamps, as caption files require these timings to display text on screen correctly.',
                  },
                  {
                    n: 3,
                    title: 'Transcribe',
                    body: 'Click Transcribe Audio. Konthora uses speech recognition to convert the spoken audio into text with timestamps.',
                  },
                  {
                    n: 4,
                    title: 'Export as SRT or VTT',
                    body: 'Download your transcript in SRT or VTT format. You can then upload this file alongside your video on platforms like YouTube.',
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

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/audio-to-text"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Captions className="h-4 w-4" aria-hidden="true" />
                  Generate Captions Free — Export as SRT or VTT
                </Link>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Why Captions Matter for Accessibility ── */}
            <section aria-labelledby="why-captions-matter">
              <h2
                id="why-captions-matter"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Captions Matter for Accessibility
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Captions are a critical tool for digital inclusion and{' '}
                  <span className="font-medium text-foreground">accessibility</span>. They ensure that video content is available to millions of
                  people who are deaf or hard of hearing.
                </p>
                <p>
                  Beyond primary accessibility, captions benefit everyone. They allow
                  viewers to consume content in noisy environments or quiet spaces where
                  audio cannot be played. They also help viewers understand heavily
                  accented speech or complex technical terminology. Providing captions is
                  not just a best practice&mdash;it is often a legal requirement for public
                  and educational content under standards like WCAG.
                </p>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="captions-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <p className="inline-block mb-3 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Common questions
            </p>
            <h2
              id="captions-faq-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Frequently Asked Questions
            </h2>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>

      {/* ── CLOSING CTA ── */}
      <section
        aria-labelledby="captions-closing-cta-heading"
        className="py-16 md:py-24 border-t border-border/40 bg-radial-faint"
      >
        <Container className="max-w-3xl text-center">
          <h2
            id="captions-closing-cta-heading"
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            Ready to generate captions?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Upload your audio or video file to create SRT or VTT caption files instantly.
            Free, private, and no account required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/audio-to-text"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Captions className="h-5 w-5" aria-hidden="true" />
              Generate Captions Free — Export as SRT or VTT
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
