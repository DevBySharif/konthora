import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: "Text-to-Speech vs Screen Readers: What Is the Difference?",
  description:
    "Learn the difference between text-to-speech tools and screen readers. Understand their distinct capabilities and when each assistive technology is appropriate.",
  path: '/accessibility/tts-vs-screen-reader',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TtsVsScreenReaderPage() {
  const pageUrl = `${siteConfig.url}/accessibility/tts-vs-screen-reader`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Accessibility', item: `${siteConfig.url}/accessibility` },
      { '@type': 'ListItem', position: 3, name: 'TTS vs Screen Reader', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Does Konthora replace my screen reader?",
      answer: "No. Konthora generates spoken audio from entered text but does not navigate interfaces, announce controls, or identify page structure. It cannot replace a dedicated screen reader.",
    },
    {
      question: "Can Konthora read arbitrary webpages automatically?",
      answer: "No. Konthora is designed to convert text that you manually supply into an audio file. It does not automatically parse websites or documents.",
    },
    {
      question: "Is Konthora certified for WCAG or ADA compliance?",
      answer: "No. Konthora is a browser-based tool for converting entered English text into spoken audio. We do not claim universal accessibility certification or specific compliance with accessibility laws.",
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
        aria-labelledby="tts-vs-screen-reader-h1"
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
                <span className="text-foreground font-medium">Text-to-Speech vs Screen Readers</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Accessibility Guide
          </p>

          {/* H1 */}
          <h1
            id="tts-vs-screen-reader-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Text-to-Speech vs Screen Readers: <span className="text-gradient">What Is the Difference?</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            While both tools involve spoken audio, they serve fundamentally different purposes. Learn how to distinguish between text-to-speech generators and full assistive screen readers.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Comparison guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is Text-to-Speech? ── */}
            <section aria-labelledby="what-is-tts">
              <h2
                id="what-is-tts"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is Text-to-Speech?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <Link href="/text-to-speech" className="text-primary hover:underline">Text-to-speech</Link> converts supplied text into spoken audio. The primary function of these tools is to process words and generate human-like synthetic voices.
                </p>
                <p>
                  For an explanation of the underlying technology, see <Link href="/text-to-speech/how-does-text-to-speech-work" className="text-primary hover:underline">how does text-to-speech work</Link>. In practical use, a user inputs text and the tool outputs an audio stream or file. However, text-to-speech alone does not interact with the structure of a webpage, nor does it make a website or application fully accessible.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: What Is a Screen Reader? ── */}
            <section aria-labelledby="what-is-screen-reader">
              <h2
                id="what-is-screen-reader"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is a Screen Reader?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A screen reader is assistive software designed to help users navigate and interact with interfaces and digital content. Unlike a simple text-to-audio converter, a screen reader intercepts the underlying code of an operating system or browser.
                </p>
                <p>
                  It announces buttons, form fields, headings, and landmarks. It allows a user to fully control their computer or smartphone using keyboard commands or touch gestures, turning complex visual layouts into structured audio feedback.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Text-to-Speech vs Screen Readers ── */}
            <section aria-labelledby="tts-vs-sr">
              <h2
                id="tts-vs-sr"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Text-to-Speech vs Screen Readers
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  While a screen reader may use text-to-speech technology to generate its voice, the software itself does much more than simply read words. The table below outlines the typical distinctions depending on the tool.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="bg-muted/50 text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold border-b border-border/70">Capability</th>
                      <th className="px-4 py-3 font-semibold border-b border-border/70">Text-to-Speech</th>
                      <th className="px-4 py-3 font-semibold border-b border-border/70">Screen Reader</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Reads supplied text aloud</td>
                      <td className="px-4 py-3">Yes</td>
                      <td className="px-4 py-3">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Navigates interface controls</td>
                      <td className="px-4 py-3">No</td>
                      <td className="px-4 py-3">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Announces headings and landmarks</td>
                      <td className="px-4 py-3">No</td>
                      <td className="px-4 py-3">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Supports application interaction</td>
                      <td className="px-4 py-3">No</td>
                      <td className="px-4 py-3">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Exports generated audio</td>
                      <td className="px-4 py-3">Yes</td>
                      <td className="px-4 py-3">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Primary purpose</td>
                      <td className="px-4 py-3">Audio content creation</td>
                      <td className="px-4 py-3">Digital accessibility</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When Is Text-to-Speech Useful? ── */}
            <section aria-labelledby="when-tts-useful">
              <h2
                id="when-tts-useful"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When Is Text-to-Speech Useful?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Text-to-speech may support listening and read-aloud workflows for users who prefer to consume content audibly but do not need full interface navigation. It is also highly useful for content creators generating voiceovers, narrations, or accessible media alternatives.
                </p>
                <p>
                  However, because it lacks the ability to identify page structure or interact with form fields, text-to-speech does not replace full screen-reader accessibility for individuals who rely on assistive technology to use a computer.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: What Konthora Can and Cannot Do ── */}
            <section aria-labelledby="konthora-boundary">
              <h2
                id="konthora-boundary"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Konthora Can and Cannot Do
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora is designed to be a straightforward, browser-based <Link href="/about" className="text-primary hover:underline">audio generator</Link>. It is important to understand its capabilities and limitations.
                </p>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Konthora can:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Convert entered English text into spoken audio, up to a 2,000-character limit per generation.</li>
                  <li>Let users choose from 10 verified <Link href="/voices" className="text-primary hover:underline">voices</Link> (6 <Link href="/voices/american-english-voices" className="text-primary hover:underline">American English voices</Link> and 4 <Link href="/voices/british-english-voices" className="text-primary hover:underline">British English voices</Link>).</li>
                  <li>Adjust playback speed from 0.75× to 1.25×.</li>
                  <li>Export generated audio in MP3 or WAV <Link href="/formats" className="text-primary hover:underline">format</Link>.</li>
                  <li>Provide a workflow where no account is required (see our <Link href="/privacy-policy" className="text-primary hover:underline">privacy policy</Link> for data handling).</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Konthora cannot:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Navigate websites or applications.</li>
                  <li>Announce buttons, form fields, headings, or landmarks.</li>
                  <li>Replace assistive screen-reader software.</li>
                  <li>Guarantee accessibility compliance.</li>
                  <li>Read arbitrary webpages automatically.</li>
                </ul>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="accessibility-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="accessibility-faq-heading"
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
