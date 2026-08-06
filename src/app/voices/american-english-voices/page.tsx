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
  Globe2,
  AudioLines,
  User,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'American English AI Voices Available in Konthora | Konthora',
  description:
    'Explore the 6 American English AI voices available in Konthora. Learn when to choose an American accent and how to preview and generate natural speech.',
  path: '/voices/american-english-voices',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function AmericanEnglishVoicesPage() {
  const pageUrl = `${siteConfig.url}/voices/american-english-voices`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'AI Voices', item: `${siteConfig.url}/voices` },
      { '@type': 'ListItem', position: 3, name: 'American English Voices', item: pageUrl },
    ],
  };

  /* ── Voice Data ── */
  const americanVoices = [
    { name: 'Heart', gender: 'Female' },
    { name: 'Bella', gender: 'Female' },
    { name: 'Nicole', gender: 'Female' },
    { name: 'Nova', gender: 'Female' },
    { name: 'Adam', gender: 'Male' },
    { name: 'Michael', gender: 'Male' },
  ];

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "How many American English voices does Konthora have?",
      answer: "Konthora provides 6 American English voices: Heart, Bella, Nicole, Nova, Adam, and Michael.",
    },
    {
      question: "Can I adjust the speed of the American voices?",
      answer: "Yes, you can adjust the playback speed of all voices between 0.75× and 1.25× before generating your speech.",
    },
    {
      question: "Are these voices free to use?",
      answer: "Yes, all voices are available to use for free in your browser without creating an account.",
    },
    {
      question: "How long can my script be?",
      answer: "Each voice generation request supports a script of up to 2,000 characters.",
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
                <Link href="/voices" className="hover:text-foreground transition-colors">
                  Voices
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">American English</span>
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
            American English AI Voices{' '}
            <span className="text-gradient">Available in Konthora</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Explore the 6 American English AI voices available on the platform. Discover when to use them and how to generate natural-sounding speech for your projects.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="American English Voices Guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Are American English AI Voices? ── */}
            <section aria-labelledby="what-are-american-voices">
              <h2
                id="what-are-american-voices"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Are American English AI Voices?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  American English AI voices are digital speech models trained specifically on datasets of North American speakers. They naturally handle American pronunciation, rhythm, and common phonetic quirks. For more on the underlying technology, see <Link href="/text-to-speech/how-does-text-to-speech-work" className="text-primary hover:underline">how text-to-speech works</Link>.
                </p>
                <p>
                  When provided with text, these voices read the words aloud using standard American intonation, making them highly effective for localized content aimed at US and Canadian audiences.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: American English Voices Available ── */}
            <section aria-labelledby="available-voices">
              <h2
                id="available-voices"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                American English Voices Available
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Konthora currently offers 6 distinct American English <Link href="/voices" className="text-primary hover:underline">voices</Link>. They are available directly in your browser without creating an account.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {americanVoices.map((voice) => (
                  <div key={voice.name} className="flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border/70 text-center hover:border-primary/50 transition-colors">
                    <User className="h-6 w-6 text-primary mb-3" />
                    <strong className="text-foreground text-base font-semibold">{voice.name}</strong>
                    <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{voice.gender}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: When to Choose an American English Voice ── */}
            <section aria-labelledby="when-to-choose">
              <h2
                id="when-to-choose"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                When to Choose an American English Voice
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Selecting an American accent over a British accent is typically a decision based on your target audience and the content you are producing.
                </p>
                <ul className="space-y-4 mt-6">
                  <li className="flex gap-4 items-start">
                    <Globe2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">North American Audiences:</strong> 
                      If your content is aimed primarily at listeners in the United States or Canada, an American voice will sound the most natural and familiar.
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <Globe2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">American Spelling and Slang:</strong> 
                      These voices are trained to naturally interpret American spellings (e.g., "color" instead of "colour") and regional phrasing without unnatural hesitation.
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Choosing the Right Voice ── */}
            <section aria-labelledby="choosing-right-voice">
              <h2
                id="choosing-right-voice"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Choosing the Right Voice
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Even within the American English category, the 6 voices have varying cadences and depths. We recommend previewing a few different options with a sample sentence from your actual script to see which one fits best.
                </p>
                <p>
                  Keep in mind that you can fine-tune the delivery by adjusting the playback speed between 0.75× and 1.25×, allowing you to match the exact pace required for your project.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preview and Generate Speech ── */}
            <section aria-labelledby="generate-speech">
              <h2
                id="generate-speech"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preview and Generate Speech
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  You can preview all 6 American English voices in the <Link href="/text-to-speech" className="text-primary hover:underline">text to speech</Link> workspace. Simply enter up to 2,000 characters of text, select your preferred voice, and generate your audio.
                </p>
                <p>
                  Once generated, the voiceover must be downloaded during your active browser session as an <Link href="/formats/mp3-vs-wav" className="text-primary hover:underline">MP3 or WAV</Link> file.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Ready to create a voiceover?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try the American English voices now.
                  </p>
                </div>
                <Link
                  href="/text-to-speech"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  Generate Speech
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="american-voices-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="american-voices-faq-heading"
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
