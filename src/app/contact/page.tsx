import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Mail, HelpCircle } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: `Contact Us | ${siteConfig.name}`,
  description: `Get in touch with the ${siteConfig.name} support team. Reach out via email for general inquiries, feedback, or copyright notices.`,
  path: '/contact',
});

export default function ContactPage() {
  const pageUrl = `${siteConfig.url}/contact`;

  // Structured Data (JSON-LD)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact',
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section>
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />
          <PageHeader
            title="Contact Us"
            description="Have questions, suggestions, or need help? Get in touch with our team directly."
            badge="Get in Touch"
          />

          <div className="mt-8 space-y-8">
            {/* Email card contact card */}
            <div className="flex flex-col md:flex-row items-start gap-6 p-6 border border-border bg-card rounded-2xl shadow-xs">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Email Support</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For all questions, feedback, commercial suggestions, or general support requests, please contact us at our support address:
                </p>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-block text-base font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md px-1 py-0.5"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>

            {/* Copyright warning card */}
            <div className="flex flex-col md:flex-row items-start gap-6 p-6 border border-border bg-card rounded-2xl shadow-xs">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Copyright & Takedown Issues</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you wish to submit a content removal request or copyright dispute, please refer to the detailed guidelines on our copyright portal and send the requested details directly to our email.
                </p>
                <a
                  href={siteConfig.links.copyright}
                  className="inline-block text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
                >
                  View Copyright & Takedown Policy &rarr;
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
