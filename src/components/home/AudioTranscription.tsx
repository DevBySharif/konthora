import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Languages, FileText, Captions } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/motion';
import { SectionHeading } from '@/components/home/SectionHeading';
import { siteConfig } from '@/config/site';

const formats = [
  { label: 'TXT', note: 'Plain text' },
  { label: 'SRT', note: 'Subtitles' },
  { label: 'VTT', note: 'Video captions' },
  { label: 'JSON', note: 'Structured data' },
];

const bullets = [
  { icon: Clock, text: 'Sentence, paragraph, or word-level timestamps' },
  { icon: Languages, text: 'Auto-detected English speech recognition' },
  { icon: FileText, text: 'MP3 · WAV · M4A · AAC · MP4 · WebM · MOV' },
  { icon: Captions, text: 'Copy text or export subtitle standards' },
];

export function AudioTranscription() {
  return (
    <section className="relative overflow-hidden bg-secondary/25" aria-labelledby="transcription-heading">
      <div className="orb top-[-8rem] right-[-8rem] h-[24rem] w-[24rem] bg-cyan-400/10 dark:bg-cyan-500/10" aria-hidden="true" />
      <Container className="py-20 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Visual */}
          <Reveal delay={0.1} className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute inset-0 -z-10 translate-y-5 rounded-[2rem] bg-gradient-to-tr from-cyan-400/15 via-sky-500/10 to-indigo-500/15 blur-2xl" aria-hidden="true" />
              <div className="glass rounded-[1.75rem] p-6 shadow-glow">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">meeting-notes.mp3</div>
                    <div className="text-xs text-muted-foreground">Faster-Whisper · English</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                    Done
                  </span>
                </div>

                {/* Transcript */}
                <div className="mt-5 space-y-3" aria-hidden="true">
                  {[
                    ['00:04', 'Welcome everyone, and thanks for joining today.'],
                    ['00:09', 'Let us walk through this quarter’s key priorities.'],
                    ['00:18', 'First, shipping text-to-speech to production.'],
                  ].map(([t, text]) => (
                    <div key={t} className="flex gap-3">
                      <span className="mt-0.5 shrink-0 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                        {t}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex gap-2 border-t border-border/60 pt-4" aria-hidden="true">
                  {formats.map((f) => (
                    <span key={f.label} className="flex-1 rounded-lg border border-border/60 bg-background/40 px-2 py-1.5 text-center text-xs font-semibold text-muted-foreground">
                      <span className="block text-foreground">{f.label}</span>
                      <span className="text-[10px] font-normal">{f.note}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="Audio Transcription"
              title={
                <>
                  Audio, turned into{' '}
                  <span className="text-gradient">accurate time-coded text</span>
                </>
              }
              description="Upload audio or video and get a readable, timestamped transcript you can trust — grouped by sentence, paragraph, or individual words."
            />
            <ul className="mt-8 space-y-3">
              {bullets.map((b, i) => (
                <Reveal key={b.text} delay={i * 0.06}>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 text-primary">
                      <b.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-foreground/90">{b.text}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.2} className="mt-8">
              <Link
                href={siteConfig.links.audioToText}
                className="group inline-flex items-center gap-2 rounded-md text-base font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Open the transcription workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}