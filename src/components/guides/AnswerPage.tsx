import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { AudioLines, ArrowRight } from 'lucide-react';

import { siteConfig } from '@/config/site';
import type { AnswerContent } from '@/config/answerPages';

/**
 * Renders an answer-shaped reference page.
 *
 * These target question queries. AEO favours question-shaped headings and a
 * direct answer immediately under the h1, because both featured snippets and AI
 * answer engines quote the most extractable answer on the page rather than
 * assembling one from several paragraphs.
 */
export function AnswerPage({ content }: { content: AnswerContent }) {
  const pageUrl = `${siteConfig.url}/${content.slug}`;
  const faqs: FAQItem[] = content.faqs;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: content.crumb, item: pageUrl },
    ],
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: content.h1Prefix,
    description: content.directAnswer,
    step: content.sections.map((section, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: section.heading,
      text: section.paragraphs[0],
    })),
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={howToSchema} />

      <section
        aria-labelledby={`${content.slug}-h1`}
        className="relative overflow-hidden bg-radial-faint py-16 md:py-24 border-b border-border/40"
      >
        <div
          aria-hidden="true"
          className="orb w-[520px] h-[520px] -top-64 -right-32 bg-primary/10 dark:bg-primary/5"
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
                <span className="text-foreground font-medium">{content.crumb}</span>
              </li>
            </ol>
          </nav>

          <p className="inline-block mb-4 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Reference
          </p>

          <h1
            id={`${content.slug}-h1`}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            {content.h1Prefix}
          </h1>

          {/* The direct answer sits above the fold, on its own, because that is
              what a featured snippet or an AI answer engine will quote. */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {content.directAnswer}
          </p>
        </Container>
      </section>

      {/* Quick answers, as a scannable definition list. */}
      <Section className="bg-secondary/10">
        <Container className="max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Short answers</h2>
          <dl className="space-y-6">
            {content.quickAnswers.map((item) => (
              <div key={item.question} className="border-l-2 border-primary/40 pl-5">
                <dt className="font-semibold text-foreground">{item.question}</dt>
                <dd className="mt-2 text-muted-foreground leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <article aria-label={content.crumb} className="border-b border-border/40">
        <Container className="max-w-4xl py-14 md:py-20">
          <div className="space-y-14">
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

            <section aria-labelledby={`${content.slug}-related`}>
              <h2
                id={`${content.slug}-related`}
                className="text-2xl sm:text-3xl font-bold text-foreground mb-6"
              >
                Related
              </h2>
              <ul className="space-y-4">
                {content.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>
                        <span className="block font-semibold text-foreground">
                          {link.label}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {link.description}
                        </span>
                      </span>
                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={content.slug.includes('voice') ? '/text-to-speech' : '/audio-to-text'}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  {content.slug.includes('voice')
                    ? 'Open the Text-to-Speech Tool'
                    : 'Open the Audio-to-Text Tool'}
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </article>

      <Section className="bg-secondary/10" id={`${content.slug}-faq`}>
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