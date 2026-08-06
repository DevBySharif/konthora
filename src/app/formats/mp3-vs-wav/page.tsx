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
  FileAudio,
  Volume2,
  HardDrive,
  Share2,
  Scissors,
  CheckCircle2,
  Music,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'MP3 vs WAV: Which Audio Format Should You Choose? | Konthora',
  description:
    'Understand the practical differences between MP3 and WAV for AI-generated speech. Compare compression, file size, audio quality, and editing suitability.',
  path: '/formats/mp3-vs-wav',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function Mp3VsWavPage() {
  const pageUrl = `${siteConfig.url}/formats/mp3-vs-wav`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Supported Formats', item: `${siteConfig.url}/formats` },
      { '@type': 'ListItem', position: 3, name: 'MP3 vs WAV', item: pageUrl },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Will I hear a difference between MP3 and WAV for spoken text?",
      answer: "For general spoken audio, such as a casual voiceover, the difference is usually negligible to the human ear. However, if you are mixing the audio with music or applying professional effects, WAV preserves the necessary fidelity.",
    },
    {
      question: "Which format is better for sending over email?",
      answer: "MP3 is significantly better for sharing via email or messaging apps because its compressed file size easily fits within standard attachment limits.",
    },
    {
      question: "Does Konthora restrict character length based on the format chosen?",
      answer: "No, both MP3 and WAV exports are subject to the same verified 2,000-character generation limit per text-to-speech request.",
    },
    {
      question: "Can I use WAV files on social media?",
      answer: "While many video editors accept WAV files for creating your video, most social platforms (like YouTube or Instagram) will ultimately compress your uploaded video, making the final audio more akin to MP3 quality.",
    },
    {
      question: "Which format is standard for podcasting?",
      answer: "Podcasters typically record and edit in WAV to maintain quality, but the final published episode distributed via RSS feeds is almost always compressed to MP3.",
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
                <span className="text-foreground font-medium">MP3 vs WAV</span>
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
            MP3 vs WAV:{' '}
            <span className="text-gradient">Which Format Should You Choose?</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            When generating speech from text, selecting the correct output format depends entirely on 
            how you intend to use the file. Learn the practical differences in compression, quality, 
            and workflows for MP3 and WAV files.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="MP3 vs WAV comparison" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: The Core Difference: Compression ── */}
            <section aria-labelledby="core-difference-compression">
              <h2
                id="core-difference-compression"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                The Core Difference: Compression
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The most significant difference between MP3 and WAV is how they handle data compression.
                </p>
                <p>
                  <strong>WAV (Waveform Audio File Format)</strong> is an uncompressed format. It captures 
                  and stores audio exactly as it was generated, retaining maximum acoustic detail. Because 
                  no data is discarded, WAV files are the gold standard for audio fidelity.
                </p>
                <p>
                  <strong>MP3</strong> is a compressed format. It uses complex algorithms to discard audio 
                  frequencies that are generally imperceptible to the human ear. This compression makes the 
                  file dramatically smaller, at the cost of a slight, often unnoticeable, reduction in absolute quality.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: File Size and Sharing Convenience ── */}
            <section aria-labelledby="file-size-sharing">
              <h2
                id="file-size-sharing"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                File Size and Sharing Convenience
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Because WAV files are uncompressed, they are significantly larger than MP3 files. A minute 
                  of generated speech exported as a WAV file will take up more storage space than the exact 
                  same audio exported as an MP3.
                </p>
                <p>
                  If your workflow involves sending files via email, uploading them to constrained web environments, 
                  or sharing them quickly via messaging apps, MP3 is the overwhelmingly superior choice. 
                  The massive reduction in file size makes it the universal standard for convenient audio sharing.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Audio Quality and Editing Suitability ── */}
            <section aria-labelledby="audio-quality-editing">
              <h2
                id="audio-quality-editing"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Audio Quality and Editing Suitability
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  For casual listening, the audio quality difference between a high-quality MP3 and a WAV file 
                  is negligible, especially for simple spoken voiceovers. However, the difference becomes 
                  critical during the editing process.
                </p>
                <p>
                  Professional video and audio editors (such as Adobe Premiere, DaVinci Resolve, or Audacity) 
                  prefer WAV files. When you apply effects—like equalization, compression, or reverb—to an MP3, 
                  the existing data compression artifacts can become magnified, degrading the sound. Because WAV 
                  is uncompressed, it provides a clean, raw foundation that holds up perfectly under heavy editing.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When to Choose MP3 ── */}
            <section aria-labelledby="when-to-choose-mp3">
              <h2
                id="when-to-choose-mp3"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When to Choose MP3
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  You should select MP3 when exporting generated audio if:
                </p>
                <div className="rounded-xl border border-border/70 bg-card p-5">
                  <ul className="space-y-3">
                    <li className="flex gap-3 items-start text-sm">
                      <Share2 className="h-5 w-5 text-primary shrink-0" />
                      <span>You plan to email the file or send it via a messaging app.</span>
                    </li>
                    <li className="flex gap-3 items-start text-sm">
                      <HardDrive className="h-5 w-5 text-primary shrink-0" />
                      <span>You need to conserve storage space on your device.</span>
                    </li>
                    <li className="flex gap-3 items-start text-sm">
                      <Music className="h-5 w-5 text-primary shrink-0" />
                      <span>You are embedding the audio directly into a simple web page or presentation.</span>
                    </li>
                    <li className="flex gap-3 items-start text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span>The audio is for personal reference and does not require professional editing.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When to Choose WAV ── */}
            <section aria-labelledby="when-to-choose-wav">
              <h2
                id="when-to-choose-wav"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When to Choose WAV
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  You should select WAV when exporting generated audio if:
                </p>
                <div className="rounded-xl border border-border/70 bg-card p-5">
                  <ul className="space-y-3">
                    <li className="flex gap-3 items-start text-sm">
                      <Scissors className="h-5 w-5 text-primary shrink-0" />
                      <span>You are dropping the audio into a non-linear editor for video production.</span>
                    </li>
                    <li className="flex gap-3 items-start text-sm">
                      <FileAudio className="h-5 w-5 text-primary shrink-0" />
                      <span>You are mixing the voiceover with background music or sound effects.</span>
                    </li>
                    <li className="flex gap-3 items-start text-sm">
                      <Volume2 className="h-5 w-5 text-primary shrink-0" />
                      <span>You need to apply acoustic filters, EQ, or volume normalization.</span>
                    </li>
                    <li className="flex gap-3 items-start text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span>Fidelity is your absolute highest priority, regardless of file size.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to generate audio?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Convert your text into natural speech and export it in either MP3 or WAV format.
                  </p>
                </div>
                <Link
                  href="/text-to-speech"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Try Text-to-Speech
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="mp3-vs-wav-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="mp3-vs-wav-faq-heading"
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
