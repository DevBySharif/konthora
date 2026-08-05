import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/home/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/motion';

export interface InfoCard {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}

interface InfoSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: InfoCard[];
  twoCol?: boolean;
}

export function InfoSection({ id, eyebrow, title, description, cards, twoCol = false }: InfoSectionProps) {
  return (
    <SectionBase id={id}>
      <div className="max-w-3xl">
        <SectionHeading align="left" eyebrow={eyebrow} title={title} description={description} />
      </div>
      <Stagger className={`mt-12 grid gap-4 ${twoCol ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`} stagger={0.06}>
        {cards.map((c) => (
          <StaggerItem key={c.title}>
            <div className="h-full rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-primary">
                <c.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionBase>
  );
}

interface StepsProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  steps: { title: string; desc: string }[];
}

export function StepsSection({ id, eyebrow, title, description, steps }: StepsProps) {
  return (
    <SectionBase id={id} alt>
      <div className="max-w-3xl">
        <SectionHeading align="left" eyebrow={eyebrow} title={title} description={description} />
      </div>
      <Stagger className="mt-12 grid gap-4 md:grid-cols-3" stagger={0.08}>
        {steps.map((s, i) => (
          <StaggerItem key={s.title}>
            <div className="relative h-full rounded-2xl border border-border/70 bg-card p-6 shadow-card">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionBase>
  );
}

interface CrossLinksProps {
  title: string;
  description: string;
  links: { href: string; label: string; description: string; primary?: boolean }[];
}

export function CrossLinks({ title, description, links }: CrossLinksProps) {
  return (
    <SectionBase id="related-tools" alt>
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeading align="center" eyebrow="Related tools" title={title} description={description} />
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`group rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
              l.primary
                ? 'border-primary/40 bg-primary/5 shadow-card hover:border-primary/60'
                : 'border-border/70 bg-card shadow-card hover:border-primary/25'
            }`}
          >
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{l.label}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Learn more
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M21 12H3" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </SectionBase>
  );
}

function SectionBase({ id, alt, children }: { id: string; alt?: boolean; children: React.ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`py-16 md:py-20 ${alt ? 'bg-secondary/10' : ''}`}
    >
      <Container>{children}</Container>
    </section>
  );
}