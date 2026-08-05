import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/motion';
import { siteConfig } from '@/config/site';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="cta-heading">
      <Container className="py-20 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-card px-6 py-16 text-center shadow-card md:px-16 md:py-20">
            {/* gradient backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10" aria-hidden="true" />
            <div className="orb absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 bg-indigo-500/15" aria-hidden="true" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
                Your text, spoken with{' '}
                <span className="text-gradient">perfect clarity</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                Create natural-sounding voiceovers and accurate transcripts in seconds — right in your browser. No account needed.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={siteConfig.links.textToSpeech}
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Generate speech now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={siteConfig.links.audioToText}
                  className="inline-flex items-center rounded-md border border-border/70 bg-background/50 px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Transcribe audio
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">Free forever · No sign-up · Files auto-delete in 60 minutes</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}