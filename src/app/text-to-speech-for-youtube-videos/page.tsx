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
  title: "Text-to-Speech for YouTube Videos | Konthora",
  description:
    "Learn how to create voiceovers for YouTube videos using text-to-speech. Discover how to choose a voice, format your script, and generate MP3 or WAV narration.",
  path: '/text-to-speech-for-youtube-videos',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function TTSForYouTubePage() {
  const pageUrl = `${siteConfig.url}/text-to-speech-for-youtube-videos`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Text to Speech', item: `${siteConfig.url}/text-to-speech` },
      { '@type': 'ListItem', position: 3, name: 'YouTube Videos', item: pageUrl },
    ],
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Voiceovers with Konthora',
    description: 'A 5-step workflow to generate voiceover narration for your YouTube video.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter your script',
        text: 'Type or paste your narration script into the text area. You can input up to 2,000 characters at a time.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select a voice',
        text: 'Choose from 10 different English voices, including both American and British options.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Adjust playback speed',
        text: 'Set the speaking speed to match the pacing of your video editing style.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Choose export format',
        text: 'Select MP3 for a compressed audio file or WAV for an uncompressed, high-quality audio file.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Generate and download',
        text: 'Click generate and download your audio file directly to your device. No account is required.',
      },
    ],
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Is there a limit to how much text I can convert?",
      answer: "Yes. The Konthora text-to-speech tool supports up to 2,000 characters per generation.",
    },
    {
      question: "Can I adjust how fast the voice speaks?",
      answer: "Yes. You can adjust the playback speed before generating the audio.",
    },
    {
      question: "Do I need to download software to generate audio?",
      answer: "No. The entire text-to-speech workflow runs in your browser without requiring you to install any software or create an account.",
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
        aria-labelledby="tts-youtube-h1"
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
                <span className="text-foreground font-medium">YouTube</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="tts-youtube-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Text-to-Speech for <span className="text-gradient">YouTube Videos</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Adding a voiceover to your YouTube videos can improve viewer engagement and clarify complex topics. Learn how to prepare a script, choose an appropriate voice, and generate audio narration directly in your browser.
          </p>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Text to speech for YouTube guide" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: Why Use Text-to-Speech for YouTube? ── */}
            <section aria-labelledby="why-use-tts">
              <h2
                id="why-use-tts"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Use Text-to-Speech for YouTube?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Creators use <Link href="/text-to-speech" className="text-primary hover:underline">text-to-speech</Link> for many types of YouTube content, including educational tutorials, faceless video essays, top-10 lists, and product demonstrations. Narration helps guide the viewer through visual information.
                </p>
                <p>
                  Generating voiceovers from text is useful when you do not have access to a quiet recording environment, lack a high-quality microphone, or prefer not to record your own voice.
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
                  Konthora provides 10 distinct English <Link href="/voices" className="text-primary hover:underline">voices</Link>. Selecting a voice that matches the tone of your video is important for the viewer experience.
                </p>
                <p>
                  If your content is aimed at an audience in the United States, you might prefer the <Link href="/voices/american-english-voices" className="text-primary hover:underline">American English</Link> voices. For documentaries or content geared toward a UK audience, the <Link href="/voices/british-english-voices" className="text-primary hover:underline">British English</Link> voices can provide a different cadence and presentation style.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Preparing a Narration Script ── */}
            <section aria-labelledby="preparing-a-script">
              <h2
                id="preparing-a-script"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Preparing a Narration Script
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The way you format your text impacts <Link href="/text-to-speech/how-does-text-to-speech-work" className="text-primary hover:underline">how text-to-speech works</Link>. Automatic narration relies entirely on punctuation to determine pauses and pacing.
                </p>
                <p>
                  To get the best result for a YouTube video, use proper periods and commas to create natural breathing pauses. Since the tool has a 2,000-character limit per generation, you may need to divide longer video scripts into separate paragraphs and generate the audio in sections.
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
                  When you export your generated voiceover, you can select from two audio <Link href="/formats" className="text-primary hover:underline">formats</Link>.
                </p>
                <p>
                  For video editing, <Link href="/formats/mp3-vs-wav" className="text-primary hover:underline">MP3 vs WAV</Link> is a common consideration. WAV is an uncompressed format, meaning it preserves the highest audio quality, which is ideal if you plan to edit the audio further in your video software. MP3 is a compressed format that uses less file space and is sufficient for many standard YouTube uploads.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Creating Voiceovers with Konthora ── */}
            <section aria-labelledby="creating-voiceovers">
              <h2
                id="creating-voiceovers"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Creating Voiceovers with Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  You can generate a voiceover directly in your browser. The process requires no account.
                </p>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: 'Enter your script',
                    body: 'Type or paste your narration script into the text area. You can input up to 2,000 characters at a time.',
                  },
                  {
                    n: 2,
                    title: 'Select a voice',
                    body: 'Choose from 10 different English voices, including both American and British options.',
                  },
                  {
                    n: 3,
                    title: 'Adjust playback speed',
                    body: 'Set the speaking speed to match the pacing of your video editing style.',
                  },
                  {
                    n: 4,
                    title: 'Choose export format',
                    body: 'Select MP3 for a compressed audio file or WAV for an uncompressed, high-quality audio file.',
                  },
                  {
                    n: 5,
                    title: 'Generate and download',
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
      <Section className="bg-secondary/10" id="youtube-tts-faq">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="youtube-tts-faq-heading"
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
