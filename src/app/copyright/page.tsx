import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Copyright and Content Removal | ${siteConfig.name}`,
  description: `Review the policy for submitting copyright disputes, takedowns, and content removal requests on ${siteConfig.name}.`,
  path: '/copyright',
});

export default function CopyrightPage() {
  const pageUrl = `${siteConfig.url}/copyright`;

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
        name: 'Copyright & Removal',
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section>
        <Container className="max-w-4xl">
          <PageHeader
            title="Copyright and Content Removal Requests"
            description="Our policy regarding content disputes, intellectual property claims, and removal procedures."
            badge="Copyright"
          />

          <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6 leading-relaxed">
            <p>
              At <strong className="text-foreground">{siteConfig.name}</strong>, we respect the intellectual property rights of others. We expect our users to display the same level of respect when uploading content or using our synthesis workspaces.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">Policy Overview</h2>
            <p>
              Because our platform is designed around temporary local processing, we do not host a public database of user files, nor do we run a index page of public user audio or transcripts. When the backend launches, uploaded files and generated outputs will be processed temporarily and automatically deleted after a short processing window.
            </p>
            <p>
              However, if you believe that any content generated or processed through our services infringes on your intellectual property rights, you can submit a removal or dispute notice to our team.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">Procedure for Submitting a Request</h2>
            <p>
              To report a copyright issue or request content removal, please send an email to our support team at:{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary hover:underline font-bold">
                {siteConfig.contactEmail}
              </a>
            </p>
            <p>
              To expedite your request, please include the following details in your message:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Identification of the Work:</strong> A description of the copyrighted work that you claim has been infringed.
              </li>
              <li>
                <strong>Details of Infringement:</strong> Details explaining how the material processed through our tools infringes your copyright.
              </li>
              <li>
                <strong>Contact Details:</strong> Your full name, mailing address, telephone number, and email address.
              </li>
              <li>
                <strong>Ownership Declaration:</strong> A statement indicating that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong>Truth Declaration:</strong> A statement certifying that the details in the notice are accurate, and under penalty of perjury, that you are the owner or authorized to act on behalf of the owner of the copyright.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8">Review Process</h2>
            <p>
              Once a valid dispute notice is received, our team will review the claim and take appropriate measures, which may include disabling temporary features or restricting specific access keys. Because all user files are deleted automatically, many disputes are resolved immediately through system-level file expirations.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
