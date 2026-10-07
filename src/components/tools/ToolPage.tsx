import React from 'react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { SpeakableSummary } from '@/components/tools/SpeakableSummary';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { TranscriptionWorkspace } from '@/components/tools/TranscriptionWorkspace';
import {
  InfoSection,
  StepsSection,
  CrossLinks,
  type InfoCard,
} from '@/components/tools/ToolInfoSections';
import {
  FileAudio,
  FileVideo,
  FileDown,
  FileText,
  Clock,
  Captions,
  Languages,
  Mic,
  Users,
  BookOpen,
  Scissors,
  AudioLines,
  Sparkles,
  Sliders,
} from 'lucide-react';

import { constructSoftwareAppSchema, constructSpeakableSchema } from '@/lib/schema';
import { siteConfig } from '@/config/site';
import type { ToolContent, ToolCard } from '@/config/toolPages';

/** Icon names in the content data map to components here, so the config stays serialisable. */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FileAudio,
  FileVideo,
  FileDown,
  FileText,
  Clock,
  Captions,
  Languages,
  Mic,
  Users,
  BookOpen,
  Scissors,
  AudioLines,
  Sparkles,
  Sliders,
};

function toCards(cards: ToolCard[]): InfoCard[] {
  return cards.map((card) => {
    const Icon = ICONS[card.icon];
    if (!Icon) {
      throw new Error(`Unknown tool card icon: ${card.icon}`);
    }
    return { icon: Icon, title: card.title, desc: card.desc };
  });
}

/**
 * Renders one transcription tool page.
 *
 * /audio-to-text, /video-to-text and /mp3-to-text were near-identical clones
 * sharing ~90% of their tokens, so three pages competed for one intent. The
 * renderer is shared; all copy comes from the entry's own data.
 */
export function ToolPage({ content }: { content: ToolContent }) {
  const pageUrl = `${siteConfig.url}/${content.slug}`;

  const webAppSchema = constructSoftwareAppSchema({
    name: `Konthora ${content.crumb}`,
    url: pageUrl,
  });

  const speakableSchema = constructSpeakableSchema(pageUrl, content.speakable);

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
    mainEntity: content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  /* ── Schema: HowTo ── */
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to ${content.crumb.toLowerCase()} with Konthora`,
    description: content.stepDescription,
    url: pageUrl,
    totalTime: 'PT3M',
    supply: [
      { '@type': 'HowToSupply', name: 'Audio or video file (up to 100 MB, 10 minutes)' },
      { '@type': 'HowToSupply', name: 'Internet connection' },
    ],
    tool: [
      { '@type': 'HowToTool', name: `Konthora ${content.crumb} Workspace`, url: pageUrl },
    ],
    step: content.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.desc,
      url: `${pageUrl}#step-${index + 1}`,
    })),
  };

  const faqs: FAQItem[] = content.faqs;

  return (
    <>
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={speakableSchema} />
      <SpeakableSummary id="speakable-summary">{content.speakable}</SpeakableSummary>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={howToSchema} />

      <Section className="pb-6">
        <Container>
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: content.crumb }]} />
          <PageHeader
            title={content.headerTitle}
            description={content.headerDescription}
            badge={content.badge}
          />
          <TranscriptionWorkspace />
          <AdPlaceholder />
        </Container>
      </Section>

      <InfoSection
        id="capabilities"
        eyebrow={content.capabilityEyebrow}
        title={content.capabilityTitle}
        description={content.capabilityDescription}
        cards={toCards(content.capabilityCards)}
      />

      <StepsSection
        id="how-it-works"
        eyebrow={content.stepEyebrow}
        title={content.stepTitle}
        description={content.stepDescription}
        steps={content.steps}
      />

      <InfoSection
        id="use-cases"
        eyebrow={content.useCaseEyebrow}
        title={content.useCaseTitle}
        description={content.useCaseDescription}
        cards={toCards(content.useCaseCards)}
        twoCol
      />

      <CrossLinks
        title={content.crossLinkTitle}
        description={content.crossLinkDescription}
        links={content.links}
      />

      <Section className="bg-secondary/10">
        <Container>
          <div className="text-center mb-12" id={`${content.slug}-faq-heading`}>
            <h2 className="text-2xl font-bold text-foreground">{content.faqHeading}</h2>
            <p className="mt-2 text-muted-foreground">{content.faqSubheading}</p>
          </div>
          <FAQ items={faqs} />
        </Container>
      </Section>
    </>
  );
}