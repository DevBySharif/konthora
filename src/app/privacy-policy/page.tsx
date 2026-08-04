import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Read the privacy policy of ${siteConfig.name}. Review how we handle uploaded files, generated audio, cookies, and ads.`,
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  const pageUrl = `${siteConfig.url}/privacy-policy`;

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
        name: 'Privacy Policy',
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
            title="Privacy Policy"
            description="Understand how we collect, use, and protect your information when utilizing our services."
            badge="Privacy"
          />

          {/* Legal Draft Warning */}
          <div className="p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm leading-relaxed mb-8">
            <strong>Draft Document:</strong> This document is a pre-production launch draft. It must be reviewed, adjusted, and finalized by qualified legal counsel before public production processing is enabled on Konthora.
          </div>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6 leading-relaxed">
            <p>
              At <strong className="text-foreground">{siteConfig.name}</strong>, accessibility and user trust are core values. This policy explains our guidelines concerning data handling for visitors using our website.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">1. Temporary File Processing</h2>
            <p>
              When the transcription and speech processing engines are integrated, the following data lifecycle policy will apply:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Uploaded Files:</strong> Any audio or video files uploaded to the transcription workspace will be processed temporarily on our servers to parse language and generate text timestamps.
              </li>
              <li>
                <strong>Generated Audio:</strong> Text scripts converted into voice output will be compiled on our servers to output downloadable MP3 or WAV files.
              </li>
              <li>
                <strong>Retention & Deletion:</strong> Uploaded texts are processed strictly in-memory and immediately wiped from server memory once synthesis concludes. Generated audio output files are cached temporarily under secure, randomized paths and automatically deleted after exactly 60 minutes.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8">2. Analytical Tools</h2>
            <p>
              We may utilize basic website analytics to monitor traffic, load performance, and browser compatibility. These analytics do not inspect the content of your text scripts or media uploads and serve only to improve platform stability.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">3. Cookies and Storage</h2>
            <p>
              We use local storage within your browser to store user preferences such as your visual theme choice (Light or Dark mode). We do not track users across third-party websites.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">4. Future Advertising Integration</h2>
            <p>
              To keep our tools free, we plan to monetize the platform by serving advertisements. These ad services may use basic device identifiers to serve non-intrusive placements. We do not share user script files or media assets with advertising partners.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">5. Changes to This Policy</h2>
            <p>
              We reserves the right to revise this Privacy Policy to reflect backend integrations or regulatory updates. We recommend checking this page periodically for updates.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">6. Contact Us</h2>
            <p>
              If you have any questions about this draft privacy policy, please contact us at:{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary hover:underline font-medium">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
