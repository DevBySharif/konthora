'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Play, Mic2, AudioLines } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.05 } },
  };

  const item = (offset: number) => ({
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay: offset },
    },
  });

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-radial-faint" aria-hidden="true" />
      <div className="orb top-[-12rem] left-[-8rem] h-[26rem] w-[26rem] bg-primary/20 dark:bg-primary/15" aria-hidden="true" />
      <div className="orb top-[-6rem] right-[-10rem] h-[28rem] w-[28rem] bg-primary-soft/15 dark:bg-primary-soft/10" aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <Container className="relative py-20 md:py-28 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Copy */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div variants={item(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-primary-soft">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                AI Voice & Transcription Studio
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={item(0.05)}
              className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              Natural speech.{' '}
              <span className="text-gradient">Precise transcripts.</span>{' '}
              In your browser.
            </motion.h1>

            <motion.p
              variants={item(0.1)}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0"
            >
              Turn written text into lifelike voiceovers or convert audio and video
              into timestamped transcripts — fast, private, and free to use, right
              from a clean browser-based workspace.
            </motion.p>

            <motion.div
              variants={item(0.15)}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href={siteConfig.links.textToSpeech}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                <AudioLines className="h-5 w-5" aria-hidden="true" />
                Generate Speech
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href={siteConfig.links.audioToText}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-6 text-base font-semibold text-foreground backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                <Mic2 className="h-5 w-5 text-primary" aria-hidden="true" />
                Transcribe Audio
              </Link>
            </motion.div>

            <motion.p
              variants={item(0.2)}
              className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {siteConfig.tagline}
            </motion.p>
          </motion.div>

          {/* Interactive visualization */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            aria-hidden="true"
          >
            <div className="relative mx-auto max-w-md">
              {/* Glow */}
              <div className="absolute inset-0 -z-10 translate-y-4 rounded-[2rem] bg-gradient-to-tr from-brand-from/20 via-brand-via/10 to-brand-to/20 blur-2xl" />

              {/* Glass card */}
              <div className="glass rounded-[1.75rem] p-6 shadow-glow">
                {/* Fake waveform */}
                <div className="flex items-end justify-between gap-1.5 h-24">
                  {[10, 22, 14, 34, 18, 48, 26, 62, 40, 76, 50, 84, 46, 66, 34, 52, 24, 40, 18, 30, 12, 20, 8].map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-full rounded-full bg-gradient-to-t from-brand-from to-brand-to"
                      style={{ height: reduce ? `${h}%` : undefined }}
                      animate={reduce ? undefined : { height: [`${h}%`, `${Math.max(10, h - (i % 5) * 7)}%`, `${h}%`] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
                    />
                  ))}
                </div>

                {/* Status row */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Synthesizing
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">af_heart · en-US</span>
                </div>
              </div>

              {/* Floating chips */}
              <motion.div
                className="glass absolute -left-6 -top-5 flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-card"
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">MP3 · WAV</span>
              </motion.div>

              <motion.div
                className="glass absolute -bottom-5 -right-4 flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-card"
                animate={reduce ? undefined : { y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft/15 text-primary-soft dark:text-primary-soft">
                  <Mic2 className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-semibold">word-level sync</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}