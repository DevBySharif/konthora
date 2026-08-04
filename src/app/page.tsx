import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { FAQ, FAQItem } from '@/components/ui/FAQ';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import {
  Volume2,
  FileAudio,
  Shield,
  ArrowRight,
  Clock,
  Download,
  Settings,
  Sparkles,
  Laptop,
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Konthora | Free AI Text to Speech & Audio Transcription',
  description:
    'Convert text into natural AI speech or transcribe audio and video with accurate timestamps. Create downloadable speech and timestamped transcripts with Konthora.',
  path: '/',
});

export default function HomePage() {
  // Structured Data (JSON-LD)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${siteConfig.name} AI Audio Tools`,
    url: siteConfig.url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires a modern web browser with HTML5 support.',
  };

  const homeFaqs: FAQItem[] = [
    {
      question: 'Is Konthora free to use?',
      answer:
        'Yes, Konthora is currently free to use. You can generate speech and transcribe audio directly from your browser without creating an account.',
    },
    {
      question: 'Which audio formats are supported?',
      answer:
        'For text-to-speech, you can download audio in MP3 and WAV formats. For transcription, you can upload MP3, WAV, M4A, AAC, MP4, WebM, and MOV files.',
    },
    {
      question: 'Can transcripts include timestamps?',
      answer:
        'Yes. You can choose between sentence-level, paragraph-level, or precise word-level timestamps to sync text with your audio.',
    },
    {
      question: 'Can generated speech be downloaded?',
      answer:
        'Yes. You can generate and download high-quality speech files directly in MP3 or WAV format from the Text to Speech workspace.',
    },
    {
      question: 'Are uploaded files stored permanently?',
      answer:
        'No. Uploaded texts are processed strictly in-memory and immediately wiped once synthesis completes. Uploaded media files and transcripts are automatically deleted after 60 minutes.',
    },
    {
      question: 'Does it work on mobile devices?',
      answer:
        'Yes. Konthora is designed with a mobile-first responsive layout, allowing you to use all tools, configure settings, and manage workspaces on smartphones and tablets.',
    },
  ];

  return (
    <>
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={webAppSchema} />

      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-secondary/30 to-background">
        <Container className="text-center pt-8 pb-12 md:pt-16 md:pb-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-sm font-semibold text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            AI Voice and Transcription Tools
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl font-sans max-w-4xl mx-auto leading-tight">
            AI Text to Speech and Audio Transcription
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn written text into natural-sounding speech or convert audio and video into timestamped transcripts—all from a clean, browser-based workspace.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={siteConfig.links.textToSpeech} passHref>
              <Button size="lg" className="w-full sm:w-auto">
                Generate Speech
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={siteConfig.links.audioToText} passHref>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Transcribe Audio
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            {siteConfig.tagline}
          </p>
        </Container>
      </Section>

      {/* Tool Cards Section */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Text to Speech Card */}
            <div className="flex flex-col justify-between p-8 border border-border bg-card rounded-2xl shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200 group">
              <div>
                <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Text to Speech</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed text-sm md:text-base">
                  Create natural voiceovers from plain text. Customize options for different accents, adjustable playback speeds, and download audio directly.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Natural voice generation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Voice, accent, and speed controls
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    MP3 and WAV download support
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-border/60">
                <Link href={siteConfig.links.textToSpeech} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 group-hover:translate-x-0.5 transition-transform duration-200">
                  Open Speech Workspace
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Audio to Text Card */}
            <div className="flex flex-col justify-between p-8 border border-border bg-card rounded-2xl shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200 group">
              <div>
                <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6">
                  <FileAudio className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Audio Transcription</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed text-sm md:text-base">
                  Transcribe speech from audio or video files. Generate readable text coupled with detailed sentence, paragraph, or word-level timestamps.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Upload audio or video files
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Sentence and word timestamps
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    TXT, SRT, VTT, and JSON exports
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-border/60">
                <Link href={siteConfig.links.audioToText} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 group-hover:translate-x-0.5 transition-transform duration-200">
                  Open Transcription Workspace
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <AdPlaceholder />

      {/* How it Works Section */}
      <Section className="bg-secondary/20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Follow simple web-based workflows to generate voiceovers or transcripts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* TTS Steps */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border/60 pb-3">
                <Volume2 className="w-5 h-5 text-primary" />
                Text to Speech
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Input Text',
                    desc: 'Paste or draft your content directly in our rich editor (up to 2,000 characters).',
                  },
                  {
                    step: '02',
                    title: 'Configure Voice Settings',
                    desc: 'Select your preferred voice model, accent, and natural speech speed.',
                  },
                  {
                    step: '03',
                    title: 'Export Audio File',
                    desc: 'Generate your high-fidelity voice track and download it as MP3 or WAV.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-2xl font-extrabold text-primary/30 font-mono leading-none">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcription Steps */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border/60 pb-3">
                <FileAudio className="w-5 h-5 text-primary" />
                Audio Transcription
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Upload Audio or Video',
                    desc: 'Drag & drop files up to 100 MB directly into the browser workspace.',
                  },
                  {
                    step: '02',
                    title: 'Choose Timestamp Mode',
                    desc: 'Set transcripts to group by sentences, paragraphs, or individual words.',
                  },
                  {
                    step: '03',
                    title: 'Export Transcripts',
                    desc: 'Copy your text or download formatting standards like SRT, VTT, or JSON.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-2xl font-extrabold text-primary/30 font-mono leading-none">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Feature Overview Section */}
      <Section>
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Core Platform Features
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Engineered for productivity, speed, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Volume2 className="w-5 h-5" />,
                title: 'Natural Speech Generation',
                desc: 'Generate voice tracks using advanced, professional neural speech algorithms.',
              },
              {
                icon: <Settings className="w-5 h-5" />,
                title: 'Granular Controls',
                desc: 'Adjust voice properties, pitch speed rates, and custom pauses for exact output.',
              },
              {
                icon: <Clock className="w-5 h-5" />,
                title: 'Timestamped Transcripts',
                desc: 'Sync spoken language with temporal timestamps down to individual words.',
              },
              {
                icon: <Download className="w-5 h-5" />,
                title: 'Multiple Export Standards',
                desc: 'Export subtitles (SRT, VTT) or structured text (TXT, JSON) dynamically.',
              },
              {
                icon: <Laptop className="w-5 h-5" />,
                title: 'Responsive Web Layout',
                desc: 'Access your work from anywhere, on desktop, tablet, or smartphone devices.',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Data-Privacy Conscious',
                desc: 'Files are processed with strict boundaries and auto-deleted.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 border border-border/80 bg-card rounded-xl shadow-xs">
                <div className="inline-flex p-2.5 rounded-lg bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Privacy Section */}
      <Section className="bg-primary/5 border-y border-primary/10">
        <Container className="max-w-4xl text-center py-4">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Privacy-First temporary processing</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
            Uploaded texts are processed strictly in-memory and immediately wiped once synthesis completes. Generated audio files are stored temporarily under secure, randomized paths and automatically deleted after exactly 60 minutes.
          </p>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section>
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Have questions about Konthora? Find quick answers below.
            </p>
          </div>
          <FAQ items={homeFaqs} />
        </Container>
      </Section>

      {/* Final CTA Section */}
      <Section className="bg-gradient-to-t from-secondary/35 to-background border-t border-border">
        <Container className="text-center py-8">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Choose a workspace to launch our text-to-speech engine or transcription workbench.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={siteConfig.links.textToSpeech} passHref>
              <Button size="lg" className="w-full sm:w-auto">
                Text to Speech Workspace
              </Button>
            </Link>
            <Link href={siteConfig.links.audioToText} passHref>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Transcription Workspace
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
