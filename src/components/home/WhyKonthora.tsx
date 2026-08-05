import React from 'react';
import { Lock, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/home/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/motion';

const reasons = [
  {
    icon: Zap,
    title: 'Instant results',
    desc: 'No accounts, no friction. Generate speech or transcripts in seconds with production-grade neural models.',
    accent: 'from-amber-400/20 to-orange-500/10 text-orange-500 dark:text-orange-400',
  },
  {
    icon: Lock,
    title: 'Privacy first',
    desc: 'Text is processed in-memory and wiped after synthesis. Files and transcripts auto-delete after 60 minutes.',
    accent: 'from-emerald-400/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Sparkles,
    title: 'Precision output',
    desc: 'Word-level timestamps and natural prosody deliver results built for real podcasts, videos, and captions.',
    accent: 'from-primary/20 to-primary-soft/10 text-primary dark:text-primary-soft',
  },
  {
    icon: ShieldCheck,
    title: 'Trustworthy & safe',
    desc: 'Rate limits, secure token access, and strict storage boundaries keep your work protected at every step.',
    accent: 'from-brand-from/20 to-brand-to/10 text-primary dark:text-primary-soft',
  },
];

export function WhyKonthora() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="why-heading">
      <Container className="py-20 md:py-28">
        <SectionHeading
          eyebrow="Why Konthora"
          title={
            <>
              Built to feel <span className="text-gradient">fast and effortless</span>
            </>
          }
          description="A modern audio studio that respects your time, your privacy, and the quality of your work."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Stagger key={r.title} delay={i * 0.05}>
              <StaggerItem className="h-full">
                <div className="group h-full rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${r.accent}`}>
                    <r.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
              </StaggerItem>
            </Stagger>
          ))}
        </div>
      </Container>
    </section>
  );
}