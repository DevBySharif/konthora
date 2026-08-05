import React from 'react';
import { Volume2, Clock, Download, Laptop, ShieldCheck, Captions } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/home/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/motion';

const features = [
  {
    icon: Volume2,
    title: 'Natural speech generation',
    desc: 'Advanced neural speech synthesis for professional voice tracks.',
  },
  {
    icon: Clock,
    title: 'Timestamped transcripts',
    desc: 'Sync spoken language with time — down to individual words.',
  },
  {
    icon: Download,
    title: 'Multiple export standards',
    desc: 'Export subtitles (SRT, VTT) or structured text (TXT, JSON).',
  },
  {
    icon: Laptop,
    title: 'Works anywhere',
    desc: 'Responsive tools for desktop, tablet, and smartphone.',
  },
  {
    icon: ShieldCheck,
    title: 'Data-privacy conscious',
    desc: 'Strict processing boundaries with automatic file deletion.',
  },
  {
    icon: Captions,
    title: 'Studio controls',
    desc: 'Adjust voice, accent, speed, and timestamp grouping on the fly.',
  },
];

export function FeatureGrid() {
  return (
    <section className="relative overflow-hidden bg-secondary/25" aria-labelledby="features-heading">
      <div className="orb bottom-[-8rem] right-[-6rem] h-[20rem] w-[20rem] bg-indigo-500/10" aria-hidden="true" />
      <Container className="py-20 md:py-28">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need,{' '}
              <span className="text-gradient">nothing you don’t</span>
            </>
          }
          description="A purpose-built studio focused on the tools that matter for creators."
        />

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {features.map((f) => (
            <StaggerItem key={f.title} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                {/* subtle top glow on hover */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}