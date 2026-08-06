import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Mic } from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: "Audio Transcription Accuracy: What Affects the Results? | Konthora",
  description:
    "Learn what affects audio transcription accuracy, including background noise and microphone quality, and discover how to improve your automatic speech-to-text results.",
  path: '/speech-to-text/audio-transcription-accuracy',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function AudioTranscriptionAccuracyPage() {
  const pageUrl = `${siteConfig.url}/speech-to-text/audio-transcription-accuracy`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Speech to Text', item: `${siteConfig.url}/speech-to-text` },
      { '@type': 'ListItem', position: 3, name: 'Transcription Accuracy', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "How can I improve my transcription accuracy?",
      answer: "You can improve results by using a stronger microphone, recording in a quiet environment, and speaking clearly. Minimizing background noise is the most effective way to help the transcription tool understand the speech.",
    },
    {
      question: "Will overlapping voices be transcribed correctly?",
      answer: "When multiple people speak over each other, accuracy generally decreases. It is best to have speakers talk one at a time for clear transcriptions.",
    },
    {
      question: "Does the transcription tool work entirely in my browser?",
      answer: "Yes, Konthora's automatic transcription runs entirely in your browser. There are no accounts required, and your audio files are processed directly on your device.",
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
        aria-labelledby="accuracy-h1"
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
                <Link href="/speech-to-text" className="hover:text-foreground transition-colors">
                  Speech to Text
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">Accuracy</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="accuracy-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Audio Transcription Accuracy:{' '}
            <span className="text-gradient">What Affects the Results?</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            When you convert audio or video files into text, the quality of the final transcript heavily depends on the original recording. Understand what affects transcription accuracy and how to prepare your audio for the best possible results.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Transcription accuracy guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Does Transcription Accuracy Mean? ── */}
            <section aria-labelledby="what-does-accuracy-mean">
              <h2
                id="what-does-accuracy-mean"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Does Transcription Accuracy Mean?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  In automatic <Link href="/speech-to-text" className="text-primary hover:underline">speech-to-text</Link> workflows, accuracy refers to how closely the generated text matches the actual spoken words in the audio file. A highly accurate transcript requires minimal editing after generation.
                </p>
                <p>
                  Because the transcription process relies on recognizing audio patterns, anything that obscures the voice—such as poor microphone quality or environmental noise—will impact the final text.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Factors That Affect Accuracy ── */}
            <section aria-labelledby="factors-that-affect-accuracy">
              <h2
                id="factors-that-affect-accuracy"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Factors That Affect Accuracy
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Several common recording variables influence how well speech can be recognized and converted to text:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground">Audio Clarity:</strong> Clear, distinct speech is easier to process than mumbled or rushed dialogue.
                  </li>
                  <li>
                    <strong className="text-foreground">Background Noise:</strong> Traffic, wind, keyboard typing, or music can mask spoken words and reduce accuracy.
                  </li>
                  <li>
                    <strong className="text-foreground">Overlapping Speakers:</strong> When multiple people talk at the exact same time, the audio becomes crowded, making it difficult to separate individual words.
                  </li>
                  <li>
                    <strong className="text-foreground">Microphone Quality:</strong> A stronger, dedicated microphone generally captures cleaner audio than a built-in laptop or phone microphone held at a distance.
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How to Improve Your Results ── */}
            <section aria-labelledby="how-to-improve-results">
              <h2
                id="how-to-improve-results"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How to Improve Your Results
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  If you are planning to record new audio or <Link href="/speech-to-text/how-to-transcribe-audio" className="text-primary hover:underline">transcribe audio</Link> files you already have, a few practical steps can significantly enhance the output quality.
                </p>
              </div>

              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Factor</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Helps Accuracy?</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Quiet environment</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Minimizes background noise that obscures speech.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Stronger microphone</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Captures a cleaner, clearer voice signal.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Overlapping speakers</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Speakers should take turns talking.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Clear pronunciation</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Makes individual words easier to recognize.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Test your audio quality</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your audio or video file directly in your browser. Konthora offers various <Link href="/formats" className="text-primary hover:underline">formats</Link> and <Link href="/speech-to-text/timestamps" className="text-primary hover:underline">timestamp modes</Link> for your transcript.
                  </p>
                </div>
                <Link
                  href="/audio-to-text"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <Mic className="h-4 w-4" aria-hidden="true" />
                  Transcribe File
                </Link>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Common Limitations ── */}
            <section aria-labelledby="common-limitations">
              <h2
                id="common-limitations"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Common Limitations
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  While automatic transcription provides an incredibly fast way to convert speech to text, it is important to have realistic expectations. When an audio file has excessive background noise or multiple people speaking at once, the transcript may contain errors or omit words.
                </p>
                <p>
                  For critical applications—like publishing professional <Link href="/captions" className="text-primary hover:underline">captions</Link> or official transcripts—you should always review and lightly edit the generated text before final use.
                </p>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="accuracy-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="accuracy-faq-heading"
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
