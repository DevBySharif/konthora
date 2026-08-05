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
  AudioLines,
  Cpu,
  Globe,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'Whisper ASR: Open-Source Speech Recognition Model | Konthora',
  description:
    'Whisper is an open-source automatic speech recognition (ASR) system developed by OpenAI. Learn how this transformer-based model handles audio transcription.',
  path: '/entity/whisper',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function WhisperEntityPage() {
  const pageUrl = `${siteConfig.url}/entity/whisper`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Whisper ASR', item: pageUrl },
    ],
  };

  /* ── Schema: TechArticle ── */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Whisper: An Open-Source Automatic Speech Recognition System',
    description:
      'Whisper is an open-source automatic speech recognition (ASR) model developed by OpenAI, based on transformer architecture and trained on large-scale weak supervision.',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Konthora',
      url: siteConfig.url,
    },
    mainEntityOfPage: pageUrl,
  };

  /* ── Schema: FAQPage ── */
  const faqs: FAQItem[] = [
    {
      question: "Who developed the Whisper model?",
      answer: "The Whisper automatic speech recognition model was developed and open-sourced by OpenAI.",
    },
    {
      question: "What architecture does Whisper use?",
      answer: "Whisper uses a Transformer sequence-to-sequence architecture, commonly found in modern large language models, to map audio spectrograms directly to text.",
    },
    {
      question: "Which version of Whisper does Konthora use?",
      answer: "Konthora integrates the Whisper small.en model for its browser-based audio-to-text tool, balancing processing efficiency with accurate English transcription.",
    },
    {
      question: "Is Konthora affiliated with OpenAI?",
      answer: "No. Konthora is an independent platform that utilizes the open-source MIT-licensed Whisper model. It is not affiliated with or endorsed by OpenAI.",
    },
    {
      question: "What are the audio length limits in Konthora's Whisper implementation?",
      answer: "Konthora currently accepts audio or video files up to 10 minutes in duration and up to 100 MB in file size for transcription.",
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
      <JsonLd schema={faqSchema} />

      {/* ── HERO / INTRO ── */}
      <section
        aria-labelledby="entity-h1"
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
                <span className="text-foreground font-medium">Whisper ASR</span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          {/* H1 */}
          <h1
            id="entity-h1"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Whisper:{' '}
            <span className="text-gradient">An Open-Source Automatic Speech Recognition System</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Whisper is an open-source automatic speech recognition (ASR) system developed by OpenAI. 
            Built on a sequence-to-sequence Transformer architecture, it converts spoken audio into written text.
          </p>

          {/* Attribution Box */}
          <div className="mt-8 inline-flex flex-wrap items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="h-4 w-4" aria-hidden="true" />
              <span>Technology: <span className="font-medium text-foreground">Transformer ASR</span></span>
            </div>
            <div className="hidden sm:block text-border" aria-hidden="true">|</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>Developer: <span className="font-medium text-foreground">OpenAI</span></span>
            </div>
            <div className="hidden sm:block text-border" aria-hidden="true">|</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span>License: <span className="font-medium text-foreground">MIT License</span></span>
            </div>
          </div>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Whisper ASR reference" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is the Whisper Model? ── */}
            <section aria-labelledby="what-is-whisper">
              <h2
                id="what-is-whisper"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is the Whisper Model?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Whisper is an automatic speech recognition system released by OpenAI. It is designed 
                  to transcribe spoken language into text. The model was trained on a massive dataset of diverse, 
                  weakly supervised audio, giving it robustness against background noise, varied accents, and technical jargon.
                </p>
                <p>
                  Unlike proprietary cloud-only APIs, OpenAI open-sourced the Whisper model weights and code 
                  under the MIT License. This open-source distribution allows developers to run the inference 
                  engine independently without sending audio data to third-party servers.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How Whisper Processes Audio ── */}
            <section aria-labelledby="how-whisper-processes">
              <h2
                id="how-whisper-processes"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How Whisper Processes Audio
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Whisper employs an encoder-decoder Transformer architecture. When an audio file is 
                  provided, it is first converted into a log-Mel spectrogram, which is a visual representation 
                  of the audio frequencies over time.
                </p>
                <p>
                  The Transformer encoder processes this spectrogram to understand the acoustic features, 
                  while the decoder generates the corresponding text transcript. During this process, the model 
                  can also predict timestamps, allowing the text to be aligned with the precise moment it was spoken.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Whisper Implementation in Konthora ── */}
            <section aria-labelledby="konthora-implementation">
              <h2
                id="konthora-implementation"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Whisper Implementation in Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Konthora utilizes the Whisper model to power its free, browser-based transcription tool. 
                  Specifically, Konthora implements the <code>small.en</code> variant of the Whisper model, 
                  which provides an optimal balance between transcription precision and computational speed 
                  for English-language audio.
                </p>
                <p>
                  The Konthora implementation introduces specific guardrails and processing features to support 
                  practical user workflows:
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <AudioLines className="h-4 w-4 text-primary" /> Supported Formats
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex gap-2 items-center text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> Audio: MP3, WAV, M4A, AAC
                      </li>
                      <li className="flex gap-2 items-center text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> Video: MP4, WebM, MOV
                      </li>
                      <li className="flex gap-2 items-center text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> Export: TXT, SRT, VTT, JSON
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-primary" /> Processing Constraints
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex gap-2 items-center text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> 10-minute maximum duration
                      </li>
                      <li className="flex gap-2 items-center text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> 100 MB maximum file size
                      </li>
                      <li className="flex gap-2 items-center text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> English language only
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Privacy and Lifecycle ── */}
            <section aria-labelledby="privacy-lifecycle">
              <h2
                id="privacy-lifecycle"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Privacy and Data Lifecycle
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Because the Whisper model is open-source, Konthora hosts the inference engine independently. 
                  Audio files are not transmitted to OpenAI for processing.
                </p>
                <p>
                  Within the Konthora infrastructure, all uploaded media and generated transcripts are subject 
                  to a strict 60-minute automatic deletion policy. The tool does not require user accounts, 
                  ensuring that transcriptions remain untethered to persistent user identities.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Using Whisper for Captions ── */}
            <section aria-labelledby="using-whisper-captions">
              <h2
                id="using-whisper-captions"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Using Whisper for Captions
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  One of the most practical applications of the Whisper model is the generation of timestamped 
                  subtitles and closed captions. Through the Konthora interface, the raw timestamps produced 
                  by Whisper can be grouped by word, sentence, or paragraph, and exported directly as SRT or VTT files.
                </p>
              </div>

              <Link
                href="/audio-to-text"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AudioLines className="h-4 w-4" aria-hidden="true" />
                Try the Audio-to-Text Tool
              </Link>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="whisper-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="whisper-faq-heading"
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
