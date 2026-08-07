import React from 'react';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/motion';

const stats = [
  { value: '28+', label: 'Neural voices' },
  { value: '2,000', label: 'Characters per script' },
  { value: '100MB', label: 'File uploads' },
  { value: '60min', label: 'Auto-delete retention' },
];

export function Trusted() {
  return (
    <section className="border-y border-border/60 bg-secondary/30" aria-label="Platform at a glance">
      <Container className="py-10 md:py-12">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Engineered for speed, accuracy & privacy
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <div className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                <span className="text-gradient">{s.value}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}