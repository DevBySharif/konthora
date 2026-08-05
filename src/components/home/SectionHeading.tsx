import React from 'react';
import { Reveal } from '@/components/ui/motion';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({ eyebrow, title, description, align = 'center' }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <Reveal className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-primary-soft">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-[2.6rem] md:leading-[1.15]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>
      )}
    </Reveal>
  );
}