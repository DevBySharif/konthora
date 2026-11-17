import React from 'react';
import Link from 'next/link';
import { Type, SlidersHorizontal, Download, Upload, ListFilter, FileOutput, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/home/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { siteConfig } from '@/config/site';

const ttsSteps = [
  { icon: Type, title: 'Input your text', desc: 'Paste or draft scripts up to 2,000 characters.' },
  { icon: SlidersHorizontal, title: 'Tune the voice', desc: 'Choose voice, accent, and natural speed.' },
  { icon: Download, title: 'Export audio', desc: 'Download a polished MP3 or WAV file.' },
];

const transSteps = [
  { icon: Upload, title: 'Upload media', desc: 'Drag & drop audio or video up to 100 MB.' },
  { icon: ListFilter, title: 'Pick timestamp mode', desc: 'Group by sentences, paragraphs, or words.' },
  { icon: FileOutput, title: 'Export transcript', desc: 'Copy text or download TXT, SRT, VTT, JSON.' },
];

export function Workflow() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="workflow-heading">
      <div className="orb top-[-8rem] left-[-8rem] h-[22rem] w-[22rem] bg-primary-soft/10" aria-hidden="true" />
      <Container className="py-14 md:py-20">
        <SectionHeading
          eyebrow="Workflow"
          title={
            <>
              Three simple steps{' '}
              <span className="text-gradient">from idea to output</span>
            </>
          }
          description="A clean, guided flow for every project — no tutorials required."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {[
            {
              label: 'Speech',
              colour: 'from-brand-from to-brand-to',
              steps: ttsSteps,
              desc: 'Type a script, pick one of 129 voices, and export MP3 or WAV.',
              cta: 'Open speech workspace',
              href: siteConfig.links.textToSpeech,
            },
            {
              label: 'Transcription',
              colour: 'from-primary to-primary-soft',
              steps: transSteps,
              desc: 'Upload audio or video and get timestamped text you can export.',
              cta: 'Open transcription workspace',
              href: siteConfig.links.audioToText,
            },
          ].map((track) => (
            <Stagger key={track.label} className="flex flex-col rounded-3xl border border-border/70 bg-card p-7 shadow-card" stagger={0.09}>
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r ${track.colour}`} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground">{track.label}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{track.desc}</p>
              <ol className="mt-7 flex-1 space-y-6">
                {track.steps.map((s, i) => (
                  <StaggerItem key={s.title}>
                    <li className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary">
                          <s.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        {i < track.steps.length - 1 && (
                          <span className="my-1 w-px flex-1 bg-border/60" aria-hidden="true" />
                        )}
                      </div>
                      <div className="pb-2">
                        <span className="font-mono text-xs font-semibold text-primary/70">Step 0{i + 1}</span>
                        <h4 className="mt-0.5 font-semibold text-foreground">{s.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </li>
                  </StaggerItem>
                ))}
              </ol>
              <Link
                href={track.href}
                className="mt-8 inline-flex items-center gap-2 self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {track.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Stagger>
          ))}
        </div>
      </Container>
    </section>
  );
}