import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/home/SectionHeading';
import { siteConfig } from '@/config/site';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { Mic2, AudioLines, Languages, FileDown } from 'lucide-react';

const facts = [
  {
    icon: Mic2,
    title: 'US & British English voices',
    desc: 'Generate speech with 10 neural voices across American and British English accents.',
  },
  {
    icon: AudioLines,
    title: 'MP3 & WAV for speech',
    desc: 'Download AI voiceovers as MP3 or WAV, with speed adjustable between 0.75× and 1.25×.',
  },
  {
    icon: Languages,
    title: 'English transcription',
    desc: 'Transcribe audio and video in English, with sentence, paragraph, or word-level timestamps.',
  },
  {
    icon: FileDown,
    title: 'Export as TXT, SRT, VTT, JSON',
    desc: 'Take transcripts into subtitle files or structured data for editing and publishing.',
  },
];

export function ProductFacts() {
  return (
    <section className="relative overflow-hidden bg-secondary/25">
      <Container className="py-16 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="What you get"
              title={
                <>
                  Real tools with{' '}
                  <span className="text-gradient">clear capabilities</span>
                </>
              }
              description="Konthora is a set of browser-based workspaces. Here is what is actually supported, so you know exactly what to expect before you start."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={siteConfig.links.textToSpeech}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Open speech workspace
              </Link>
              <Link
                href={siteConfig.links.audioToText}
                className="inline-flex items-center rounded-md border border-border bg-card/60 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Open transcription workspace
              </Link>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Learn how Konthora protects your data in our{' '}
              <Link href={siteConfig.links.privacy} className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary">
                privacy policy
              </Link>
              , find out more about the team on our{' '}
              <Link href={siteConfig.links.about} className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary">
                about page
              </Link>
              , or{' '}
              <Link href={siteConfig.links.contact} className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary">
                get in touch
              </Link>
              .
            </p>
          </div>

          <Stagger className="grid gap-4 sm:grid-cols-2" stagger={0.07}>
            {facts.map((f) => (
              <StaggerItem key={f.title}>
                <div className="h-full rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary">
                    <f.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}