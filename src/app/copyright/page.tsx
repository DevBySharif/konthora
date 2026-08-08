import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Copyright and Content Removal Requests | ${siteConfig.name}`,
  description: `Our policy regarding content disputes, intellectual property claims, and removal procedures.`,
  path: '/copyright',
});

export default function Page() {
  const pageUrl = `${siteConfig.url}/copyright`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Copyright and Content Removal Requests', item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section className="pb-24">
        <Container className="max-w-4xl">
          <div className="mb-10">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Copyright and Content Removal Requests' }]} />
            <PageHeader
              title="Copyright and Content Removal Requests"
              description="Our policy regarding content disputes, intellectual property claims, and removal procedures."
              badge="Copyright"
            />
          </div>

          <div className="flex gap-4 p-5 border border-yellow-500/20 bg-yellow-500/5 rounded-2xl text-yellow-700 dark:text-yellow-400/90 mb-12">
            <AlertTriangle className="h-6 w-6 shrink-0 text-yellow-600 dark:text-yellow-500" />
            <div className="space-y-1.5">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Draft Notice</h3>
              <p className="text-sm leading-relaxed">
                This document is a pre-production launch draft. It must be reviewed, adjusted, and finalized by qualified legal counsel before public production processing is enabled on Konthora.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                At <strong className="text-foreground">{siteConfig.name}</strong>, we respect the intellectual property rights of others. We expect our users to display the same level of respect when uploading content or using our synthesis workspaces.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                Policy Overview
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch] mb-4">
                  Because our platform is designed around temporary local processing, we do not host a public database of user files, nor do we run a index page of public user audio or transcripts. When the backend launches, uploaded files and generated outputs will be processed temporarily and automatically deleted after a short processing window.
                </p>
                <p className="leading-8 text-muted-foreground max-w-[75ch]">
                  However, if you believe that any content generated or processed through our services infringes on your intellectual property rights, you can submit a removal or dispute notice to our team.
                </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                Procedure for Submitting a Request
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch] mb-4">
                  To report a copyright issue or request content removal, please send an email to our support team at:{' '}
                  <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary hover:underline font-semibold">
                    {siteConfig.contactEmail}
                  </a>
                </p>
                <p className="leading-8 text-muted-foreground max-w-[75ch] mb-4">
                  To expedite your request, please include the following details in your message:
                </p>
                <ul className="list-disc pl-6 space-y-3 leading-8 text-muted-foreground max-w-[75ch] marker:text-muted-foreground/50">
                  <li className="pl-2"><strong className="text-foreground">Identification of the Work:</strong> A description of the copyrighted work that you claim has been infringed.</li>
                  <li className="pl-2"><strong className="text-foreground">Details of Infringement:</strong> Details explaining how the material processed through our tools infringes your copyright.</li>
                  <li className="pl-2"><strong className="text-foreground">Contact Details:</strong> Your full name, mailing address, telephone number, and email address.</li>
                  <li className="pl-2"><strong className="text-foreground">Ownership Declaration:</strong> A statement indicating that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                  <li className="pl-2"><strong className="text-foreground">Truth Declaration:</strong> A statement certifying that the details in the notice are accurate, and under penalty of perjury, that you are the owner or authorized to act on behalf of the owner of the copyright.</li>
                </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                Review Process
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                  Once a valid dispute notice is received, our team will review the claim and take appropriate measures, which may include disabling temporary features or restricting specific access keys. Because all user files are deleted automatically, many disputes are resolved immediately through system-level file expirations.
                </p>
            </div>

          </div>

          <div className="mt-16 pt-12 border-t border-border/50">
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-secondary/30 border border-border/40">
              <HelpCircle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Questions? Need clarification?</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Our support team is here to help you understand our policies and answer any questions you might have.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
                >
                  Contact Support
                </a>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 font-medium text-foreground transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
