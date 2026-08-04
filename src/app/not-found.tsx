import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <Section className="flex-1 flex items-center min-h-[70vh]">
      <Container className="text-center py-12">
        <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-6">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          Sorry, we couldn&rsquo;t find the page you&rsquo;re looking for. It might have been moved, renamed, or is temporarily unavailable.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href={siteConfig.links.home} passHref>
            <Button size="lg">
              Go back home
            </Button>
          </Link>
          <Link href={siteConfig.links.textToSpeech} passHref>
            <Button variant="outline" size="lg">
              Open speech workspace
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
