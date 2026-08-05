import React from 'react';
import { Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/home/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/motion';

const voices = [
  { id: 'af_heart', label: 'American Female', code: 'en-US' },
  { id: 'am_michael', label: 'American Male', code: 'en-US' },
  { id: 'bf_emma', label: 'British Female', code: 'en-GB' },
  { id: 'bm_george', label: 'British Male', code: 'en-GB' },
];

const extras = [
  'English speech recognition with auto-detect',
  'Multiple voice profiles across accents',
  'Word-level transcription timing',
];

export function SupportedLanguages() {
  return (
    <section className="relative overflow-hidden bg-secondary/25" aria-labelledby="languages-heading">
      <div className="orb bottom-[-8rem] right-[-6rem] h-[20rem] w-[20rem] bg-primary/10" aria-hidden="true" />
      <Container className="py-20 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Language & Voices"
              title={
                <>
                  English, spoken{' '}
                  <span className="text-gradient">your way</span>
                </>
              }
              description="Konthora focuses on polished English synthesis and transcription, with multiple voices across American and British accents — and more languages on the roadmap."
            />
            <ul className="mt-8 space-y-3">
              {extras.map((c, i) => (
                <Stagger key={c} delay={i * 0.06}>
                  <StaggerItem>
                    <li className="flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-from/20 to-brand-to/20 text-primary">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-foreground/90">{c}</span>
                    </li>
                  </StaggerItem>
                </Stagger>
              ))}
            </ul>
          </div>

          {/* Voice cards */}
          <Stagger className="grid gap-4 sm:grid-cols-2" stagger={0.07}>
            {voices.map((v) => (
              <StaggerItem key={v.id}>
                <div className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{v.label}</span>
                    <span className="inline-flex items-center rounded-full border border-border/70 bg-background/50 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {v.code}
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-from to-brand-to" />
                  </div>
                  <div className="mt-2 font-mono text-[11px] text-muted-foreground">{v.id}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}