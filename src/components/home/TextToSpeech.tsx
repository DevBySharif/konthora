import React from 'react';
import Link from 'next/link';
import { ArrowRight, Volume2, Download, Waves, Gauge, FileDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/home/SectionHeading';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { siteConfig } from '@/config/site';

const features = [
  {
    icon: Volume2,
    title: 'Lifelike voices',
    desc: 'Neural AI voices in American and British English, male and female, tuned for natural narration.',
  },
  {
    icon: Gauge,
    title: 'Granular controls',
    desc: 'Fine-tune accent and playback speed to match your intended cadence and tone.',
  },
  {
    icon: Waves,
    title: 'Natural delivery',
    desc: 'Realistic pacing, emphasis, and rhythm synthesised from your own written script.',
  },
  {
    icon: FileDown,
    title: 'MP3 & WAV export',
    desc: 'Download polished audio for videos, podcasts, or presentations in your preferred format.',
  },
];

export function TextToSpeech() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="tts-heading">
      <div className="orb bottom-[-10rem] left-[-6rem] h-[22rem] w-[22rem] bg-violet-500/10" aria-hidden="true" />
      <Container className="py-20 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="AI Text-to-Speech"
              title={
                <>
                  Narratives that sound{' '}
                  <span className="text-gradient">effortlessly human</span>
                </>
              }
              description="Turn a written script into high-quality voiceovers. Pick a voice, set the pace, and export polished audio — all in your browser."
            />
            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.07}>
              {features.map((f) => (
                <StaggerItem key={f.title}>
                  <div className="group h-full rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 text-primary">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-8">
              <Link
                href={siteConfig.links.textToSpeech}
                className="group inline-flex items-center gap-2 rounded-md text-base font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Open the speech workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          {/* Visual */}
          <Reveal delay={0.1}>
            <div className="relative mx-auto max-w-lg">
              <div className="absolute inset-0 -z-10 translate-y-5 rounded-[2rem] bg-gradient-to-tr from-indigo-500/15 via-violet-500/10 to-cyan-400/15 blur-2xl" aria-hidden="true" />
              <div className="glass rounded-[1.75rem] p-6 shadow-glow">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">US English · Female</div>
                    <div className="text-xs text-muted-foreground">Neural Kokoro engine</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Ready
                  </span>
                </div>

                {/* Waveform */}
                <div className="mt-5 flex h-24 items-center justify-center gap-1" aria-hidden="true">
                  {[26, 48, 34, 64, 42, 78, 60, 96, 44, 88, 52, 72, 40, 58, 32, 46, 24, 38, 18, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">00:12 / 00:48</span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" /> MP3
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}