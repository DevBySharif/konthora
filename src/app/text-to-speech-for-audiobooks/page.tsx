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
  title: "Text-to-Speech for Audiobooks | Konthora",
  description:
    "Learn how to generate spoken narration for audiobook-style projects using text-to-speech. Discover how to format scripts, choose voices, and manage character limits.",
  path: '/text-to-speech-for-audiobooks',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TTSForAudiobooksPage() {
  const pageUrl = `${siteConfig.url}/text-to-speech-for-audiobooks`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Text to Speech', item: `${siteConfig.url}/text-to-speech` },
      { '@type': 'ListItem', position: 3, name: 'Audiobooks', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Audiobook Narration with Konthora',
    description: 'A 5-step workflow to generate voiceover narration for your audiobook-style projects.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare one manageable section of the narration script',
        text: 'Break your written material into smaller parts that fit within the tool\'s character constraints.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter up to 2,000 characters',
        text: 'Type or paste your text section into the generation area.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Select an English voice and playback speed',
        text: 'Choose from 10 different English voices and adjust the speaking speed from 0.75× to 1.25×.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Select MP3 or WAV',
        text: 'Choose MP3 for a compressed audio file or WAV for an uncompressed, high-quality audio file.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Generate and download the audio during the active session',
        text: 'Click generate and download your audio file directly to your device. No account is required.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Can I generate a whole audiobook in one request?",
      answer: "No. The Konthora text-to-speech tool has a strict 2,000-character limit per generation. You must process long texts in separate sections.",
    },
    {
      question: "Are there any accounts required to use the tool?",
      answer: "No. The entire text-to-speech workflow runs in your browser without requiring you to install any software or create an account.",
    },
    {
      question: "Do you offer non-English voices?",
      answer: "No. The tool currently provides 10 English voices (American and British).",
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
        aria-labelledby="tts-audiobook-h1"
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
                <Link href="/text-to-speech" className="hover:text-foreground transition-colors">
                  Text to Speech
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">Audiobooks</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="tts-audiobook-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Text-to-Speech for <span className="text-gradient">Audiobooks</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Creating spoken narration for audiobook-style projects requires planning and organization. Learn how to format scripts, manage text constraints, and generate audio narration directly in your browser.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Text to speech for audiobooks guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Use Text-to-Speech for Audiobook Narration? ── */}
            <section aria-labelledby="why-use-tts">
              <h2
                id="why-use-tts"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Use Text-to-Speech for Audiobook Narration?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Creators use <Link href="/text-to-speech" className="text-primary hover:underline">text-to-speech</Link> to generate narration for long-form written content such as independent stories, educational manuals, and serialized web fiction. This approach provides an alternative way for audiences to consume written material.
                </p>
                <p>
                  Generating voiceovers from text can be a practical option for draft readings, accessibility improvements, or personal projects when a dedicated recording studio or a human narrator is not available.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Choosing the Right Voice ── */}
            <section aria-labelledby="choosing-the-right-voice">
              <h2
                id="choosing-the-right-voice"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Choosing the Right Voice
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora provides 10 distinct English <Link href="/voices" className="text-primary hover:underline">voices</Link>. Selecting a voice that suits the genre and tone of your material is critical for long-form listening.
                </p>
                <p>
                  You can choose from 6 <Link href="/voices/american-english-voices" className="text-primary hover:underline">American English</Link> voices and 4 <Link href="/voices/british-english-voices" className="text-primary hover:underline">British English</Link> voices. Test different voices with a small sample of your text to find one that remains clear and engaging over extended periods of listening.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing an Audiobook Script ── */}
            <section aria-labelledby="preparing-a-script">
              <h2
                id="preparing-a-script"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing an Audiobook Script
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The punctuation in your text dictates <Link href="/text-to-speech/how-does-text-to-speech-work" className="text-primary hover:underline">how text-to-speech works</Link>. Automatic narration relies entirely on periods, commas, and question marks to determine pauses and pacing.
                </p>
                <p>
                  Before generating audio, review your text to ensure that long, complex sentences are broken down. Clear punctuation helps the system interpret the flow of the narration and insert natural breathing pauses.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Working Within the Generation Limit ── */}
            <section aria-labelledby="working-within-limits">
              <h2
                id="working-within-limits"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Working Within the Generation Limit
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Konthora is not designed to accept an entire book in a single request. The tool enforces a strict limit of 2,000 characters per generation. 
                </p>
                <p>
                  To convert long-form content, you must manually divide your written material into smaller, manageable sections (such as individual paragraphs or short pages). You will need to generate and download the audio for each section separately during your active session.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Adjusting Playback Speed ── */}
            <section aria-labelledby="adjusting-playback-speed">
              <h2
                id="adjusting-playback-speed"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Adjusting Playback Speed
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Audiobooks are typically narrated at a moderate, steady pace. You can adjust the playback speed from 0.75× to 1.25× to match the mood of the text. A slower speed may suit dramatic or dense material, while a slightly faster speed might be appropriate for action-oriented sections.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: MP3 or WAV? ── */}
            <section aria-labelledby="mp3-or-wav">
              <h2
                id="mp3-or-wav"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                MP3 or WAV?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When you export your generated audio, you can select from two audio <Link href="/formats" className="text-primary hover:underline">formats</Link>.
                </p>
                <p>
                  Deciding between <Link href="/formats/mp3-vs-wav" className="text-primary hover:underline">MP3 or WAV</Link> depends on your post-production needs. WAV is an uncompressed format that preserves high audio quality, which is ideal if you plan to manually assemble the sections in an external audio editor. MP3 is a compressed format that takes up less file space.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Creating Audiobook Narration with Konthora ── */}
            <section aria-labelledby="creating-voiceovers">
              <h2
                id="creating-voiceovers"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Creating Audiobook Narration with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  You can generate narration directly in your browser. Note that generated audio must be downloaded during your active session, as the tool does not provide persistent project storage.
                </p>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: 'Prepare one manageable section of the narration script',
                    body: 'Break your written material into smaller parts that fit within the tool\'s character constraints.',
                  },
                  {
                    n: 2,
                    title: 'Enter up to 2,000 characters',
                    body: 'Type or paste your text section into the generation area.',
                  },
                  {
                    n: 3,
                    title: 'Select an English voice and playback speed',
                    body: 'Choose from 10 different English voices and adjust the speaking speed from 0.75× to 1.25×.',
                  },
                  {
                    n: 4,
                    title: 'Select MP3 or WAV',
                    body: 'Choose MP3 for a compressed audio file or WAV for an uncompressed, high-quality audio file.',
                  },
                  {
                    n: 5,
                    title: 'Generate and download the audio during the active session',
                    body: 'Click generate and download your audio file directly to your device. No account is required.',
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="flex gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm"
                  >
                    <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-sm font-bold text-white">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/text-to-speech"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Mic className="h-4 w-4" aria-hidden="true" />
                  Try Text-to-Speech
                </Link>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="audiobooks-tts-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="audiobooks-tts-faq-heading"
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
