import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { Volume2 } from 'lucide-react';

import { siteConfig } from '@/config/site';
import type { TtsContent } from '@/config/ttsUseCases';

/**
 * Renders one /text-to-speech-for-* use-case guide.
 *
 * The renderer is shared so layout and structured data stay consistent, but all
 * copy comes from the entry's own data in `@/config/ttsUseCases`. These pages
 * were six hand-maintained clones that shared 84-93% of their tokens, which is
 * the thin-content pattern Google penalises.
 */
export function TtsUseCasePage({ content }: { content: TtsContent }) {
  const pageUrl = `${siteConfig.url}/${content.slug}`;
  const anchor = content.slug.replace(/-/g, '');
  const faqs: FAQItem[] = content.faqs;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Text to Speech',
        item: `${siteConfig.url}/text-to-speech`,
      },
      { '@type': 'ListItem', position: 3, name: content.crumb, item: pageUrl },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: content.howToName,
    description: content.howToDescription,
    step: content.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={howToSchema} />
      <JsonLd schema={faqSchema} />

      <section
        aria-labelledby={`${anchor}-h1`}
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
                <span className="text-foreground font-medium">{content.crumb}</span>
              </li>
            </ol>
          </nav>

          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Knowledge Center
          </p>

          <h1
            id={`${anchor}-h1`}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            Text to Speech for <span className="text-gradient">{content.h1Noun}</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            {content.lede}
          </p>
        </Container>
      </section>

      <article aria-label={`Text to speech for ${content.crumb}`} className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">
            {content.sections.map((section, index) => (
              <React.Fragment key={section.id}>
                {index > 0 && <hr className="border-border/40" />}
                <section aria-labelledby={section.id}>
                  <h2
                    id={section.id}
                    className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
                  >
                    {section.heading}
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex}>{renderInlineLinks(paragraph)}</p>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            ))}

            <hr className="border-border/40" />

            <section aria-labelledby={`${anchor}-workflow`}>
              <h2
                id={`${anchor}-workflow`}
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Step by step
              </h2>
              <div className="space-y-4">
                {content.steps.map((step) => (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm"
                  >
                    <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-sm font-bold text-white">
                      {content.steps.indexOf(step) + 1}
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
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Open the Text-to-Speech Tool
                </Link>
              </div>

              {/* One-way relationship with the adjacent use case, so the pair is
                  genuinely different pages rather than a link loop. */}
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-2xl">
                {content.relatedNote.before}
                <Link href={content.relatedNote.href} className="text-primary hover:underline">
                  {content.relatedNote.linkLabel}
                </Link>
                {content.relatedNote.after}
              </p>
            </section>
          </div>
        </Container>
      </article>

      <Section className="bg-secondary/10" id={`${anchor}-faq`}>
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}

/** Renders `[label](/path)` as a link so the config copy stays readable. */
function renderInlineLinks(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) {
      return part;
    }
    return (
      <Link key={index} href={match[2]} className="text-primary hover:underline">
        {match[1]}
      </Link>
    );
  });
}
