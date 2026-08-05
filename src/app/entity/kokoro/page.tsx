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
  Volume2,
  Cpu,
  Globe,
  Users,
  CheckCircle2,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export const metadata: Metadata = constructMetadata({
  title: 'Kokoro TTS: Open-Weight Neural Text-to-Speech Model | Konthora',
  description:
    'Kokoro is an open-weight, 82-million-parameter neural text-to-speech model developed by Hexgrad. Learn how its lightweight architecture generates speech.',
  path: '/entity/kokoro',
});

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function KokoroEntityPage() {
  const pageUrl = `${siteConfig.url}/entity/kokoro`;

  /* ── Schema: BreadcrumbList ── */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Kokoro TTS', item: pageUrl },
    ],
  };

  /* ── Schema: TechArticle ── */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Kokoro TTS: An Open-Weight Neural Text-to-Speech Model',
    description:
      'Kokoro is an open-weight neural text-to-speech (TTS) model developed by Hexgrad. With an 82-million parameter architecture, it generates high-quality speech efficiently.',
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
      question: "Who created the Kokoro TTS model?",
      answer: "The Kokoro text-to-speech model was developed by Hexgrad. The weights are released under the Apache 2.0 license, allowing for broad open-weight usage.",
    },
    {
      question: "How large is the Kokoro model?",
      answer: "The Kokoro-82M model contains approximately 82 million parameters. This lightweight architecture allows for efficient inference without requiring massive computational resources.",
    },
    {
      question: "Is Konthora the official version of Kokoro?",
      answer: "No. Konthora is an independent browser-based application that integrates the open-weight Kokoro model for its text-to-speech functionality. Hexgrad maintains the official model repository.",
    },
    {
      question: "How many voices does Kokoro support on Konthora?",
      answer: "Konthora currently exposes 10 English voices from the Kokoro model (6 American English and 4 British English). The broader open-source ecosystem may include additional experimental or community-trained voices.",
    },
    {
      question: "What license does Kokoro use?",
      answer: "The official Kokoro model weights are released by Hexgrad under the Apache 2.0 license, making it an open-weight neural text-to-speech model.",
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
                <span className="text-foreground font-medium">Kokoro TTS</span>
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
            Kokoro TTS:{' '}
            <span className="text-gradient">An Open-Weight Neural Text-to-Speech Model</span>
          </h1>

          {/* Search promise */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Kokoro is an open-weight neural text-to-speech model developed by Hexgrad. 
            Featuring an 82-million parameter architecture, it is designed to synthesize 
            speech efficiently while retaining natural phrasing and intonation.
          </p>

          {/* Attribution Box */}
          <div className="mt-8 inline-flex flex-wrap items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="h-4 w-4" aria-hidden="true" />
              <span>Model: <span className="font-medium text-foreground">Kokoro-82M</span></span>
            </div>
            <div className="hidden sm:block text-border" aria-hidden="true">|</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>Developer: <span className="font-medium text-foreground">Hexgrad</span></span>
            </div>
            <div className="hidden sm:block text-border" aria-hidden="true">|</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span>License: <span className="font-medium text-foreground">Apache 2.0</span></span>
            </div>
          </div>
        </Container>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article aria-label="Kokoro TTS reference" className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">

            {/* ── H2: What Is Kokoro TTS? ── */}
            <section aria-labelledby="what-is-kokoro">
              <h2
                id="what-is-kokoro"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                What Is Kokoro TTS?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Kokoro TTS is an open-weight neural text-to-speech model developed by Hexgrad. 
                  It is a generative machine learning system designed to convert written text into 
                  spoken audio. Unlike legacy concatenative systems that piece together recorded 
                  audio snippets, Kokoro uses a neural network to synthesize the speech dynamically.
                </p>
                <p>
                  The official model, specifically <code>Kokoro-82M</code>, is hosted on 
                  Hugging Face and its architecture is available on GitHub under an Apache 2.0 
                  license. This open-weight approach allows independent developers and platforms 
                  to run the inference engine directly, rather than relying on proprietary cloud APIs.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: How Kokoro Generates Speech ── */}
            <section aria-labelledby="how-kokoro-generates">
              <h2
                id="how-kokoro-generates"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                How Kokoro Generates Speech
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Kokoro utilizes a deep neural network to predict the acoustic properties of speech 
                  based on text input. When text is provided to the model, it is first normalized and 
                  converted into a phonetic representation.
                </p>
                <p>
                  The model then processes these phonemes, applying style and speaker embeddings to 
                  determine pitch, rhythm, and tone. Finally, the network generates an audio waveform. 
                  Because it is a neural model, Kokoro can contextualize punctuation and sentence 
                  structure, leading to more natural inflections compared to older text-to-speech systems.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Why Kokoro Uses a Lightweight Architecture ── */}
            <section aria-labelledby="lightweight-architecture">
              <h2
                id="lightweight-architecture"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Why Kokoro Uses a Lightweight Architecture
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The primary Kokoro model contains approximately 82 million parameters (Kokoro-82M). 
                  In the context of modern generative AI, where models often span tens of billions of 
                  parameters, Kokoro is intentionally lightweight.
                </p>
                <p>
                  This parameter efficiency means the model requires significantly less computational 
                  overhead to run. Inference (the act of generating speech from text) can be performed 
                  quickly, even on consumer-grade hardware or directly within constrained server environments, 
                  without the latency associated with massive cloud-based language models.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Kokoro Voices Available in Konthora ── */}
            <section aria-labelledby="kokoro-voices">
              <h2
                id="kokoro-voices"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Kokoro Voices Available in Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  While the underlying Kokoro ecosystem may support a variety of experimental 
                  weights, Konthora exposes a specific, verified catalogue of English voices for 
                  its browser-based tool. 
                </p>
                <p>
                  Currently, Konthora provides exactly 10 integrated English voices powered by the Kokoro model:
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-primary" /> American English
                    </h3>
                    <ul className="space-y-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <li key={`us-${i}`} className="flex gap-2 items-center text-sm">
                          <CheckCircle2 className="h-3 w-3 text-primary" /> US Voice {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-primary" /> British English
                    </h3>
                    <ul className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <li key={`uk-${i}`} className="flex gap-2 items-center text-sm">
                          <CheckCircle2 className="h-3 w-3 text-primary" /> UK Voice {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Kokoro Compared with Earlier TTS Approaches ── */}
            <section aria-labelledby="kokoro-comparison">
              <h2
                id="kokoro-comparison"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Kokoro Compared with Earlier TTS Approaches
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Before the advent of neural text-to-speech, systems relied on concatenative 
                  synthesis, which spliced together vast databases of pre-recorded syllables. 
                  While intelligible, these older systems often sounded robotic and struggled 
                  with natural pacing.
                </p>
                <p>
                  Like other modern neural text-to-speech architectures, Kokoro synthesizes the audio 
                  from scratch, allowing the neural network to infer context, apply smooth transitions 
                  between phonemes, and mimic human breathing and intonation patterns dynamically.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Using Kokoro Through Konthora ── */}
            <section aria-labelledby="using-kokoro">
              <h2
                id="using-kokoro"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Using Kokoro Through Konthora
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  Because Kokoro is an open-weight model, developers must build the necessary 
                  infrastructure to run it. Konthora provides a direct interface to the Kokoro 
                  model through a free, browser-based application. 
                </p>
                <p>
                  Users can type or paste text into the Konthora interface, select from the 10 available 
                  voices, and generate MP3 or WAV audio without needing to configure the underlying 
                  machine learning environment.
                </p>
              </div>

              <Link
                href="/text-to-speech"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                Try the Text-to-Speech Tool
              </Link>
            </section>

            <hr className="border-border/40" />

            {/* ── H2: Limitations and Practical Considerations ── */}
            <section aria-labelledby="limitations">
              <h2
                id="limitations"
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Limitations and Practical Considerations
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  While Kokoro is an efficient model, it is a statistical system. Occasional 
                  mispronunciations of rare names, complex acronyms, or non-standard vocabulary 
                  may occur.
                </p>
                <p>
                  Additionally, the Konthora implementation of Kokoro is strictly limited to English 
                  language inputs. The interface currently allows a maximum of 2,000 characters per 
                  generation. Because it operates statelessly in the browser with no account system, 
                  audio outputs must be downloaded during the active session.
                </p>
              </div>
            </section>

          </div>
        </Container>
      </article>

      {/* ── FAQ SECTION ── */}
      <Section className="bg-secondary/10" id="kokoro-faq-section">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2
              id="kokoro-faq-heading"
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
