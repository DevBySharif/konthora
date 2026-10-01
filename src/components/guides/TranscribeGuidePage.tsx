import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { FileText } from 'lucide-react';

import { siteConfig } from '@/config/site';
import type { GuideContent } from '@/config/transcribeGuides';

/**
 * Renders one /transcribe-* use-case guide.
 *
 * The renderer is shared so layout and structured data stay consistent, but
 * every word of copy comes from the guide's own data in
 * `@/config/transcribeGuides`. These pages used to be hand-maintained clones
 * that shared their headings, steps and FAQs, which Google treated as one page
 * attempted seven times.
 */
export function TranscribeGuidePage({ guide }: { guide: GuideContent }) {
  const pageUrl = `${siteConfig.url}/${guide.slug}`;
  const anchor = guide.slug.replace(/-/g, '');
  const faqs: FAQItem[] = guide.faqs;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Speech to Text',
        item: `${siteConfig.url}/speech-to-text`,
      },
      { '@type': 'ListItem', position: 3, name: guide.label, item: pageUrl },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.howToName,
    description: guide.howToDescription,
    step: guide.steps.map((step, index) => ({
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

      {/* ── HERO ── */}
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
                <Link href="/speech-to-text" className="hover:text-foreground transition-colors">
                  Speech to Text
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <span className="text-foreground font-medium">{guide.label}</span>
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
            How to {guide.h1Highlight}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            {guide.lede}
          </p>
        </Container>
      </section>

      {/* ── ARTICLE ── */}
      <article aria-label={`${guide.label} guide`} className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-16">
            {guide.sections.map((section, index) => (
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

            {/* ── WORKFLOW ── */}
            <section aria-labelledby={`${anchor}-workflow`}>
              <h2
                id={`${anchor}-workflow`}
                className="text-2xl sm:text-3xl font-bold text-foreground mb-5"
              >
                Step by step
              </h2>
              <div className="space-y-4">
                {guide.steps.map((step) => (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm"
                  >
                    <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-sm font-bold text-white">
                      {guide.steps.indexOf(step) + 1}
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
                  href={guide.ctaHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {guide.ctaLabel}
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </article>

      {/* ── FAQ ── */}
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

/**
 * Renders `[label](/path)` as an internal link, leaving plain text untouched.
 * Keeps the guide copy in the config file readable instead of full of JSX.
 */
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
