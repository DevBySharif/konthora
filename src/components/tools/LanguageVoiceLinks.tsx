import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Mic2 } from 'lucide-react';
import { getLanguageVoicePages, getVoiceUrl } from '@/config/voices';

interface LanguageVoiceLinksProps {
  language: string;
}

/**
 * Renders links to the dedicated pages (/voices/{voice-id}) for the native
 * voices of a given language, so language pages point back into the voice pages.
 */
export function LanguageVoiceLinks({ language }: LanguageVoiceLinksProps) {
  const voices = getLanguageVoicePages(language);

  if (voices.length === 0) {
    return null;
  }

  return (
    <Section aria-labelledby={`${language}-voice-pages-heading`}>
      <Container>
        <div className="mx-auto max-w-4xl">
          <h2
            id={`${language}-voice-pages-heading`}
            className="text-2xl font-bold text-foreground sm:text-3xl"
          >
            Individual voice pages
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Each voice has a dedicated page with specifications, a preview, and common questions.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {voices.map((voice) => (
              <Link
                key={voice.id}
                href={getVoiceUrl(voice.slug)}
                className="group rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mic2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {voice.shortName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {voice.gender === 'female' ? 'Female' : 'Male'} · {voice.accent}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {voice.description}
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-primary">
                  View voice page
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}