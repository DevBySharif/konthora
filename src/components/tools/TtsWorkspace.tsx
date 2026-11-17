'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { JsonLd } from '@/components/JsonLd';
import {
  Volume2,
  Trash2,
  FileText,
  Download,
  Music,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Lock,
  Settings2,
  RotateCcw,
  FileAudio,
  Headphones,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import {
  API_BASE_URL,
  fetchVoices,
  createTtsJob,
  createDialogueJob,
  getTtsJobStatus,
  fetchAudioBlob,
  ApiError,
  isAbortError,
  ApiVoice
} from '@/lib/api';
import {
  trackTtsSampleInserted,
  trackTtsVoiceChanged,
  trackTtsSpeedChanged,
  trackTtsFormatChanged,
  trackTtsGenerateClicked,
  trackTtsGenerationCompleted,
  trackTtsGenerationFailed,
  trackTtsPreviewPlayed,
  trackTtsAudioDownloaded,
  getCharacterCountBucket
} from '@/components/analytics/events';
import { VoicePicker } from './VoicePicker';
import { WaveformPlayer } from './WaveformPlayer';
import {
  DialogueBuilder,
  DIALOGUE_MAX_CHARS,
  DIALOGUE_MIN_SEGMENTS,
  dialogueTotalChars,
  newDialogueSegment,
  type DialogueSegmentDraft,
} from './DialogueBuilder';
import {
  DEFAULT_VOICE_BY_LANGUAGE,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '@/config/tts';
import {
  DEFAULT_TTS_PREFERENCES,
  TTS_PARAGRAPH_PAUSE_CONTROL,
  TTS_SENTENCE_PAUSE_CONTROL,
  TTS_SPEED_PRESETS,
  TTS_PREFERENCES_STORAGE_KEY,
  TTS_PREFERENCES_VERSION,
  estimateTtsDurationSeconds,
  formatEstimatedDuration as formatTtsEstimatedDuration,
  parseTtsPreferences,
} from '@/lib/ttsPreferences';

const FALLBACK_VOICES: ApiVoice[] = [
  { id: 'af_heart', displayName: 'Heart (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: true, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_bella', displayName: 'Bella (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_nicole', displayName: 'Nicole (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_nova', displayName: 'Nova (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_adam', displayName: 'Adam (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: true, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_michael', displayName: 'Michael (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bf_emma', displayName: 'Emma (Female)', gender: 'female', accent: 'British English', language: 'en-GB', recommended: true, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bf_isabella', displayName: 'Isabella (Female)', gender: 'female', accent: 'British English', language: 'en-GB', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bm_george', displayName: 'George (Male)', gender: 'male', accent: 'British English', language: 'en-GB', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bm_lewis', displayName: 'Lewis (Male)', gender: 'male', accent: 'British English', language: 'en-GB', recommended: true, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_alloy', displayName: 'Alloy (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_aoede', displayName: 'Aoede (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_jessica', displayName: 'Jessica (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_kore', displayName: 'Kore (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_river', displayName: 'River (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_sarah', displayName: 'Sarah (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'af_sky', displayName: 'Sky (Female)', gender: 'female', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_echo', displayName: 'Echo (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_eric', displayName: 'Eric (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_fenrir', displayName: 'Fenrir (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_liam', displayName: 'Liam (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_onyx', displayName: 'Onyx (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_puck', displayName: 'Puck (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'am_santa', displayName: 'Santa (Male)', gender: 'male', accent: 'American English', language: 'en-US', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bf_alice', displayName: 'Alice (Female)', gender: 'female', accent: 'British English', language: 'en-GB', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bf_lily', displayName: 'Lily (Female)', gender: 'female', accent: 'British English', language: 'en-GB', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bm_daniel', displayName: 'Daniel (Male)', gender: 'male', accent: 'British English', language: 'en-GB', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'bm_fable', displayName: 'Fable (Male)', gender: 'male', accent: 'British English', language: 'en-GB', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'ef_dora', displayName: 'Dora (Female)', gender: 'female', accent: 'Spanish', language: 'es', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'em_alex', displayName: 'Alex (Male)', gender: 'male', accent: 'Spanish', language: 'es', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'em_santa', displayName: 'Santa (Male)', gender: 'male', accent: 'Spanish', language: 'es', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'ff_siwis', displayName: 'Siwis (Female)', gender: 'female', accent: 'French', language: 'fr-FR', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'if_sara', displayName: 'Sara (Female)', gender: 'female', accent: 'Italian', language: 'it', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'im_nicola', displayName: 'Nicola (Male)', gender: 'male', accent: 'Italian', language: 'it', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'pf_dora', displayName: 'Dora (Female)', gender: 'female', accent: 'Portuguese', language: 'pt-BR', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'pm_alex', displayName: 'Alex (Male)', gender: 'male', accent: 'Portuguese', language: 'pt-BR', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 },
  { id: 'pm_santa', displayName: 'Santa (Male)', gender: 'male', accent: 'Portuguese', language: 'pt-BR', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 }
];

const PROGRESS_MESSAGES: Record<string, string> = {
  queued: 'Job placed in queue... waiting for worker.',
  preparing_text: 'Analyzing script text and expanding abbreviations...',
  generating_speech: 'Synthesizing voice waves segment-by-segment...',
  processing_audio: 'Smoothing boundaries and applying edge fades...',
  finalizing_file: 'Compiling wav container and encoding to MP3...',
  completed: 'Speech generated successfully!',
  failed: 'Speech synthesis failed. Please try again.',
  expired: 'Audio session expired.'
};

/**
 * Demo text in the reader's language. The sample button and the language
 * switcher both use the entry for the active language, so a Bengali voice
 * demos Bengali text, a Hindi voice demos Hindi text, and so on — never an
 * English paragraph read by a non-English voice.
 */
const SAMPLE_TEXTS: Record<SupportedLanguage, string> = {
  'en-US':
    'Welcome to Konthora. Experience fast, natural-sounding AI text-to-speech directly in your browser. Simply enter your text, choose a voice, adjust the playback speed, and generate high-quality speech in seconds. Explore different voices and accents to find the perfect sound for your content.',
  'hi-IN':
    'कंठोरा में आपका स्वागत है। अपने ब्राउज़र में ही तेज़ और प्राकृतिक AI टेक्स्ट-टू-स्पीच का अनुभव करें। बस अपना टेक्स्ट लिखें, आवाज़ चुनें, गति तय करें और कुछ ही सेकंड में उच्च गुणवत्ता वाली स्पीच तैयार करें। अलग-अलग आवाज़ों और लहजों को आज़माकर अपने कंटेंट के लिए सबसे उपयुक्त आवाज़ खोजें।',
  es: 'Bienvenido a Konthora. Disfruta de una conversión de texto a voz con IA rápida y natural directamente en tu navegador. Solo escribe tu texto, elige una voz, ajusta la velocidad y genera voz de alta calidad en segundos. Explora distintas voces y acentos para encontrar el sonido perfecto para tu contenido.',
  'fr-FR':
    'Bienvenue sur Konthora. Découvrez la synthèse vocale IA rapide et naturelle directement dans votre navigateur. Saisissez votre texte, choisissez une voix, réglez la vitesse et générez une voix de haute qualité en quelques secondes. Explorez les différentes voix et accents pour trouver le son idéal pour votre contenu.',
  it: 'Benvenuto su Konthora. Prova la sintesi vocale AI veloce e naturale direttamente nel tuo browser. Inserisci il testo, scegli una voce, regola la velocità e genera un audio di alta qualità in pochi secondi. Esplora voci e accenti diversi per trovare il suono perfetto per i tuoi contenuti.',
  'pt-BR':
    'Bem-vindo ao Konthora. Experimente a conversão de texto em fala com IA rápida e natural diretamente no seu navegador. Basta digitar o texto, escolher uma voz, ajustar a velocidade e gerar fala de alta qualidade em segundos. Explore diferentes vozes e sotaques para encontrar o som perfeito para o seu conteúdo.',
  'bn-BD':
    'কণ্ঠরায় স্বাগতম। ব্রাউজারেই দ্রুত ও প্রাকৃতিক শোনানো AI টেক্সট টু স্পিচ ব্যবহার করে দেখুন। শুধু আপনার লেখাটি দিন, একটি ভয়েস বেছে নিন, গতি ঠিক করুন, আর কয়েক সেকেন্ডেই উচ্চমানের স্পিচ তৈরি করুন। নানা ভয়েস ও অ্যাকসেন্ট ঘুরে দেখে আপনার কনটেন্টের জন্য পারফেক্ট সাউন্ডটি খুঁজে নিন।',
};

const SAMPLE_SCRIPTS = [
  {
    id: 'intro',
    title: 'Product Introduction',
    description: 'Short promo for a new product or feature launch.',
    icon: Sparkles,
    text: 'Introducing the future of productivity. Our new AI-powered workspace learns how you work, anticipates what you need, and helps you create your best work — automatically. No setup. No learning curve. Just results.',
    category: 'Marketing',
    duration: '~12 sec',
  },
  {
    id: 'explainer',
    title: 'Explainer Video',
    description: 'Clear, educational script for tutorials or onboarding.',
    icon: BookOpen,
    text: 'When you save a file to the cloud, it travels through encrypted channels to secure data centers. Your data is split into fragments, each stored on different servers across multiple regions. This means even if one server fails, your files remain safe and accessible.',
    category: 'Education',
    duration: '~18 sec',
  },
  {
    id: 'social',
    title: 'Social Media Hook',
    description: 'Punchy opening for Reels, TikTok, or Shorts.',
    icon: MessageSquare,
    text: 'Stop scrolling. You\'re probably making this one mistake with your morning routine — and it\'s costing you hours of focus every day. Here\'s the fix that changed everything for me.',
    category: 'Social',
    duration: '~10 sec',
  },
  {
    id: 'podcast',
    title: 'Podcast Intro',
    description: 'Warm, conversational opener for audio shows.',
    icon: Headphones,
    text: 'Hey there, welcome back to The Daily Grind. I\'m your host Alex, and today we\'re diving into something that affects every single one of us: decision fatigue. Why do smart people make bad choices by 5 PM? And how do we fix it?',
    category: 'Audio',
    duration: '~15 sec',
  },
  {
    id: 'welcome',
    title: 'Welcome / Onboarding',
    description: 'Friendly greeting for apps, courses, or platforms.',
    icon: FileAudio,
    text: 'Welcome aboard! We\'re thrilled to have you here. In the next few minutes, I\'ll walk you through the three things you need to know to get the most out of your new account. Let\'s get started.',
    category: 'Onboarding',
    duration: '~11 sec',
  },
];

const POLL_INTERVAL_MS = 1500;
/**
 * Hard ceiling on consecutive failed polls. Without this a backend outage leaves
 * the UI on "Processing…" forever while hammering the API every 1.5s. 40 polls
 * at 1.5s is roughly one minute of tolerance, which is generous for a single
 * dropped packet but short enough to surface a real outage to the user.
 */
const MAX_CONSECUTIVE_POLL_FAILURES = 40;
/** Absolute wall-clock ceiling for one synthesis job (10 minutes). */
const MAX_JOB_DURATION_MS = 10 * 60 * 1000;

/**
 * The current TTS job, persisted in sessionStorage so a refresh restores it
 * while the server still holds the audio (60 minutes). Tokens live in
 * sessionStorage ONLY — never localStorage, which survives the session.
 */
const TTS_CURRENT_JOB_STORAGE_KEY = 'konthora:tts-current-job:v1';
const TTS_JOB_TTL_MS = 60 * 60 * 1000;

interface PersistedTtsJob {
  jobId: string;
  token: string;
  voiceId: string;
  format: 'mp3' | 'wav';
  text: string;
  speed: number;
  createdAt: string;
  expiresAt?: string;
  durationSeconds?: number | null;
  status: 'polling' | 'completed';
}

function loadPersistedTtsJob(): PersistedTtsJob | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.sessionStorage.getItem(TTS_CURRENT_JOB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTtsJob;
    if (!parsed || typeof parsed.jobId !== 'string' || typeof parsed.token !== 'string') return null;
    // Drop anything past the server's 60-minute retention.
    const end = parsed.expiresAt ? Date.parse(parsed.expiresAt) : Date.parse(parsed.createdAt) + TTS_JOB_TTL_MS;
    if (Number.isNaN(end) || end <= Date.now()) {
      window.sessionStorage.removeItem(TTS_CURRENT_JOB_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedTtsJob(job: PersistedTtsJob): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(TTS_CURRENT_JOB_STORAGE_KEY, JSON.stringify(job));
    }
  } catch {
    // A failed write just means this session cannot restore the job.
  }
}

function clearPersistedTtsJob(): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(TTS_CURRENT_JOB_STORAGE_KEY);
    }
  } catch {
    // Nothing to clean up.
  }
}

/**
 * Last 5 generations, also in sessionStorage (metadata + token only — the
 * audio itself is never stored, it is re-fetched from the server while the
 * 60-minute window lasts).
 */
const TTS_HISTORY_STORAGE_KEY = 'konthora:tts-history:v1';
const TTS_HISTORY_MAX_ENTRIES = 5;

interface TtsHistoryEntry {
  jobId: string;
  token: string;
  voiceId: string;
  voiceName: string;
  format: 'mp3' | 'wav';
  textSnippet: string;
  createdAt: string;
  expiresAt: string;
  durationSeconds: number | null;
}

function loadTtsHistory(): TtsHistoryEntry[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.sessionStorage.getItem(TTS_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TtsHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .filter((e) => e && typeof e.jobId === 'string' && typeof e.token === 'string' && Date.parse(e.expiresAt) > now)
      .slice(0, TTS_HISTORY_MAX_ENTRIES);
  } catch {
    return [];
  }
}

function saveTtsHistory(entries: TtsHistoryEntry[]): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(TTS_HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, TTS_HISTORY_MAX_ENTRIES)));
    }
  } catch {
    // History is a convenience; losing it is not fatal.
  }
}

export function TtsWorkspace({ initialVoiceId }: { initialVoiceId?: string | null }) {
  const [voices, setVoices] = useState<ApiVoice[]>(FALLBACK_VOICES);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(true);

  // Core configuration states
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en-US');
  const [text, setText] = useState<string>('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(FALLBACK_VOICES[0].id);
  // 'single' = one voice for the whole text; 'dialogue' = one script split
  // into turns, each turn with its own voice (Feature 7).
  const [mode, setMode] = useState<'single' | 'dialogue'>('single');
  const [dialogueSegments, setDialogueSegments] = useState<DialogueSegmentDraft[]>(() => [
    newDialogueSegment(),
    newDialogueSegment(),
  ]);
  const lastVoiceByLanguage = useRef<Record<SupportedLanguage, string>>({ ...DEFAULT_VOICE_BY_LANGUAGE });
  const [speed, setSpeed] = useState<number>(1.0);
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav'>('mp3');
  const [sentencePauseMs, setSentencePauseMs] = useState<number>(DEFAULT_TTS_PREFERENCES.sentencePauseMs);
  const [paragraphPauseMs, setParagraphPauseMs] = useState<number>(DEFAULT_TTS_PREFERENCES.paragraphPauseMs);
  const [normalizeText, setNormalizeText] = useState<boolean>(true);
  const preferencesLoadedRef = useRef(false);

  // Job execution states
  const [status, setStatus] = useState<'idle' | 'submitting' | 'polling' | 'completed' | 'failed'>('idle');
  const [progressStage, setProgressStage] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Shown when pasted/typed text exceeds the 2,000-character limit and was
  // trimmed, so the user sees what happened instead of text silently vanishing.
  const [trimNotice, setTrimNotice] = useState<string | null>(null);

  // Audio playback states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  // Server-reported expiry for the generated audio, for the countdown.
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  // Ticking clock that drives the countdown display.
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  /** Guards the one-time sessionStorage restore on mount. */
  const restoredJobRef = useRef(false);
  /**
   * A restored job waiting for its poll to start. The mount effect cannot
   * call startStatusPolling directly (it is declared later in the file), so
   * the restore stashes the job here and the effect below drains it.
   */
  const pendingRestoreRef = useRef<{ jobId: string; token: string } | null>(null);
  // Last 5 generations, restored from sessionStorage (expired ones filtered).
  const [history, setHistory] = useState<TtsHistoryEntry[]>(() => loadTtsHistory());
  /** Job id currently being loaded/downloaded from history (buttons disable). */
  const [historyBusyId, setHistoryBusyId] = useState<string | null>(null);

  const charLimit = 2000;

  // References for polling and audio elements
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  /**
   * Guards every async continuation. A poll chain started by `handleSubmit`
   * can resolve after the user navigates away; without this flag it would call
   * setState on a dead component and restart the interval with no owner to
   * ever clear it.
   */
  const mountedRef = useRef(true);
  /** Object URL for the current generated clip, revoked exactly once. */
  const audioUrlRef = useRef<string | null>(null);

  // Analytics refs
  const jobStartTimeRef = useRef<number | null>(null);
  const hasTrackedPlayRef = useRef<boolean>(false);

  /**
   * Voices valid for the active language. Recommended voices sort first so the
   * default choice is the best available one.
   */
  const availableVoices = voices
    .filter((voice) => voice.language === selectedLanguage || (!voice.language && selectedLanguage === 'en-US'))
    .sort((a, b) => Number(b.recommended ?? false) - Number(a.recommended ?? false));

  /**
   * Guards against `selectedVoiceId` pointing at a voice that is not in the
   * filtered set (restored preferences, a language switch, or a catalogue that
   * changed between renders). Without this the <select> would silently display
   * its first option while the API payload used the stale id.
   *
   * `selectedVoiceId` remains the raw preference; every read that matters uses
   * this resolved value. Deliberately no effect syncing the two — that would be
   * a cascading render, and derived state should just be derived.
   */
  const resolvedVoiceId = availableVoices.some((voice) => voice.id === selectedVoiceId)
    ? selectedVoiceId
    : (availableVoices[0]?.id ?? '');

  /**
   * The picker list with a Listen preview URL attached to every voice. Shared
   * by the studio picker and by each dialogue turn's picker, so both always
   * show the same voices and the same previews.
   */
  const pickerVoices = availableVoices.map(v => ({
    id: v.id,
    displayName: v.displayName,
    accent: v.accent,
    gender: v.gender,
    language: v.language,
    recommended: v.recommended,
    engine: v.engine,
    // Use the API preview when present (Kokoro). Fallback voices carry no
    // previewUrl, so build the conventional path for them. Edge voices are
    // previewed by the API endpoint, which synthesizes a short line in the
    // voice's own language and caches it server-side — the Listen button
    // works for them without generating a job.
    previewUrl: v.previewUrl
      ? v.previewUrl
      : v.engine === 'edge'
        ? `${API_BASE_URL}/tts/preview/${encodeURIComponent(v.id)}`
        : `/audio/voice-previews/${v.id}.mp3`,
  }));

  const handleVoiceSelect = (voiceId: string) => {
    if (voiceId === resolvedVoiceId) return;
    setSelectedVoiceId(voiceId);

    const voice = voices.find(v => v.id === voiceId);
    if (voice) {
      lastVoiceByLanguage.current[voice.language as SupportedLanguage] = voiceId;
      trackTtsVoiceChanged({
        voice_id: voice.id,
        accent: voice.accent,
        gender: voice.gender,
        language: voice.language,
        recommended: voice.recommended,
      });
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (lang === selectedLanguage) return;
    // If the box is empty or still holds the previous language's sample
    // text, swap in the new language's sample so the demo matches the
    // voice. Text the user typed themselves is never touched.
    if (text.trim() === '' || text === SAMPLE_TEXTS[selectedLanguage]) {
      setText(SAMPLE_TEXTS[lang]);
    }
    setSelectedLanguage(lang);
    const lastVoice = lastVoiceByLanguage.current[lang];
    const fallback = voices.find(v => v.id === lastVoice)
      ? lastVoice
      : DEFAULT_VOICE_BY_LANGUAGE[lang];
    setSelectedVoiceId(fallback);
  };

  /**
   * Restores a job saved in sessionStorage by an earlier page load, if the
   * server still holds its audio. Runs once, after the voice catalogue loads
   * so the stored voice/language resolve against real data. A ?voice= preset
   * wins over the restore — explicit navigation beats a stale session.
   *
   * A function declaration (not a const arrow) so the mount effect above can
   * call it: declarations hoist, consts do not.
   */
  function restorePersistedJob(catalogue: ApiVoice[]) {
    if (restoredJobRef.current || initialVoiceId) return;
    restoredJobRef.current = true;
    const stored = loadPersistedTtsJob();
    if (!stored) return;

    const voice = catalogue.find((v) => v.id === stored.voiceId);
    if (voice) {
      setSelectedVoiceId(voice.id);
      setSelectedLanguage(voice.language as SupportedLanguage);
      lastVoiceByLanguage.current[voice.language as SupportedLanguage] = voice.id;
    }
    // A submit that beat the catalogue fetch owns the workspace now;
    // restoring over it would hijack its poll.
    if (pollTimerRef.current || abortControllerRef.current) return;
    setText(stored.text);
    setSpeed(stored.speed);
    setOutputFormat(stored.format);
    setJobId(stored.jobId);
    pendingRestoreRef.current = { jobId: stored.jobId, token: stored.token };
  }

  // Fetch voices list on mount
  useEffect(() => {
    const applyInitialPreferences = (catalogue: ApiVoice[]) => {
      let storedValue: string | null = null;
      try {
        storedValue = typeof window === 'undefined'
          ? null
          : window.localStorage.getItem(TTS_PREFERENCES_STORAGE_KEY);
      } catch {
        // Browser storage can be unavailable in restricted privacy contexts.
      }
      const stored = parseTtsPreferences(storedValue);

      if (stored) {
        const storedVoice = catalogue.find((voice) => voice.id === stored.voiceId);
        const language = storedVoice
          ? (storedVoice.language as SupportedLanguage)
          : (stored.language as SupportedLanguage);
        const voiceId = storedVoice?.id ?? DEFAULT_VOICE_BY_LANGUAGE[language];

        setSelectedLanguage(language);
        setSelectedVoiceId(voiceId);
        setSpeed(stored.speed);
        setOutputFormat(stored.outputFormat);
        setSentencePauseMs(stored.sentencePauseMs);
        setParagraphPauseMs(stored.paragraphPauseMs);
        setNormalizeText(stored.normalizeText);
        lastVoiceByLanguage.current[language] = voiceId;
      }

      const preset = initialVoiceId
        ? catalogue.find((voice) => voice.id === initialVoiceId)
        : undefined;
      if (preset) {
        const language = preset.language as SupportedLanguage;
        setSelectedVoiceId(preset.id);
        setSelectedLanguage(language);
        lastVoiceByLanguage.current[language] = preset.id;
      } else if (!stored) {
        const defaultVoice = catalogue.find((voice) => voice.id === 'af_heart') ?? catalogue[0];
        if (defaultVoice) setSelectedVoiceId(defaultVoice.id);
      }

      preferencesLoadedRef.current = true;
    };

    async function loadVoices() {
      try {
        setLoadingVoices(true);
        const data = await fetchVoices();
        if (data && data.length > 0) {
          setVoices(data);
          applyInitialPreferences(data);
          restorePersistedJob(data);
        }
      } catch (err) {
        console.error('Failed to load dynamic voices catalog. Falling back to local values.', err);
        setVoices(FALLBACK_VOICES);
        applyInitialPreferences(FALLBACK_VOICES);
        restorePersistedJob(FALLBACK_VOICES);
      } finally {
        setLoadingVoices(false);
      }
    }
    loadVoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!preferencesLoadedRef.current) return;

    try {
      window.localStorage.setItem(TTS_PREFERENCES_STORAGE_KEY, JSON.stringify({
        version: TTS_PREFERENCES_VERSION,
        language: selectedLanguage,
        voiceId: selectedVoiceId,
        speed,
        outputFormat,
        sentencePauseMs,
        paragraphPauseMs,
        normalizeText,
      }));
    } catch {
      // Preferences remain usable for the session if browser storage is unavailable.
    }
  }, [
    selectedLanguage,
    selectedVoiceId,
    speed,
    outputFormat,
    sentencePauseMs,
    paragraphPauseMs,
    normalizeText,
  ]);

  // Clean up timers, abort controllers, and URL allocations
  const clearRunningTasks = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  /**
   * Single owner of the object URL. Revoking through a ref (instead of reading
   * `audioUrl` state) keeps revocation idempotent and lets unmount release the
   * blob even though state updates are no-ops after teardown.
   */
  const releaseAudioUrl = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearRunningTasks();
      releaseAudioUrl();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Wipes all states back to starting setup
  const handleClear = () => {
    setText('');
    setTrimNotice(null);
    setErrorMsg(null);
    setStatus('idle');
    setProgressStage('');
    setJobId(null);
    setExpiresAt(null);
    clearPersistedTtsJob();
    setDurationSeconds(null);
    clearRunningTasks();
    releaseAudioUrl();
    setAudioUrl(null);
    setIsPlaying(false);
    hasTrackedPlayRef.current = false;
  };

  const handleInsertSample = (source: 'input_action' | 'empty_state' = 'input_action') => {
    setText(SAMPLE_TEXTS[selectedLanguage]);
    setTrimNotice(null);
    setErrorMsg(null);
    trackTtsSampleInserted(source);
  };

  const handleResetPreferences = () => {
    const defaults = DEFAULT_TTS_PREFERENCES;
    setSelectedLanguage(defaults.language);
    setSelectedVoiceId(defaults.voiceId);
    setSpeed(defaults.speed);
    setOutputFormat(defaults.outputFormat);
    setSentencePauseMs(defaults.sentencePauseMs);
    setParagraphPauseMs(defaults.paragraphPauseMs);
    setNormalizeText(defaults.normalizeText);
    lastVoiceByLanguage.current = { ...DEFAULT_VOICE_BY_LANGUAGE };
    try {
      window.localStorage.removeItem(TTS_PREFERENCES_STORAGE_KEY);
    } catch {
      // The in-memory reset still succeeds when browser storage is unavailable.
    }
  };

  // Polls status check endpoint recursively
  /**
   * Polls a job to completion. `meta` lets a dialogue job describe itself:
   * without it the history entry and analytics read the single-editor text
   * and the studio voice, which is wrong for a multi-turn job.
   */
  const startStatusPolling = (id: string, token: string, meta?: { text: string; voiceId: string }) => {
    const jobText = meta?.text ?? text;
    const jobVoiceId = meta?.voiceId ?? resolvedVoiceId;
    clearRunningTasks();
    setStatus('polling');
    setProgressStage('queued');

    // Reset the liveness guards for this job.
    let consecutiveFailures = 0;
    const startedAt = Date.now();

    const poll = async () => {
      if (!mountedRef.current) return;

      // Absolute ceiling, so a job that never reaches a terminal state cannot
      // hold the submit button disabled indefinitely.
      if (Date.now() - startedAt > MAX_JOB_DURATION_MS) {
        clearRunningTasks();
        setStatus('failed');
        setProgressStage('failed');
        setExpiresAt(null);
        clearPersistedTtsJob();
        setErrorMsg('This took longer than expected and was stopped. Please try again.');
        trackTtsGenerationFailed({
          stage: 'poll',
          error_code: 'JOB_TIMEOUT',
          voice_id: jobVoiceId,
          format: outputFormat,
        });
        return;
      }

      // Abort controller for current request loop
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await getTtsJobStatus(id, token, controller.signal);
        consecutiveFailures = 0;

        if (!mountedRef.current) return;

        if (data.status === 'completed') {
          setProgressStage('completed');
          setDurationSeconds(data.durationSeconds);
          setExpiresAt(data.expiresAt);
          const previous = loadPersistedTtsJob();
          if (previous && previous.jobId === id) {
            savePersistedTtsJob({
              ...previous,
              status: 'completed',
              expiresAt: data.expiresAt,
              durationSeconds: data.durationSeconds,
            });
          }

          // Record this generation in the recent history (last 5). The
          // sessionStorage copy is the source of truth here, not the
          // closure's `history` value, which predates this poll chain.
          const completedVoice = voices.find((v) => v.id === jobVoiceId);
          const historyEntry: TtsHistoryEntry = {
            jobId: id,
            token,
            voiceId: jobVoiceId,
            voiceName: completedVoice?.displayName ?? resolvedVoiceId,
            format: outputFormat,
            textSnippet: jobText.trim().slice(0, 80),
            createdAt: data.createdAt,
            expiresAt: data.expiresAt,
            durationSeconds: data.durationSeconds,
          };
          const nextHistory = [historyEntry, ...loadTtsHistory().filter((e) => e.jobId !== id)].slice(0, TTS_HISTORY_MAX_ENTRIES);
          saveTtsHistory(nextHistory);
          setHistory(nextHistory);

          // Request file download, convert to blob, set Object URL
          const blob = await fetchAudioBlob(id, token);
          if (!mountedRef.current) return;

          const localUrl = URL.createObjectURL(blob);

          // Release the previous URL through the ref, never inside a state
          // updater: updaters must stay pure so React's replay in StrictMode
          // and concurrent renders cannot double-revoke a committed URL.
          releaseAudioUrl();
          audioUrlRef.current = localUrl;
          setAudioUrl(localUrl);

          setStatus('completed');
          clearRunningTasks();

          const voice = voices.find(v => v.id === jobVoiceId);
          if (voice && jobStartTimeRef.current) {
            trackTtsGenerationCompleted({
              voice_id: voice.id,
              accent: voice.accent,
              gender: voice.gender,
              speed,
              format: outputFormat,
              character_count_bucket: getCharacterCountBucket(jobText.length),
              duration_seconds: data.durationSeconds ?? undefined,
              elapsed_seconds: Math.round((Date.now() - jobStartTimeRef.current) / 1000)
            });
            jobStartTimeRef.current = null;
          }
        } else if (data.status === 'failed') {
          setProgressStage('failed');
          setStatus('failed');
          setExpiresAt(null);
          clearPersistedTtsJob();
          setErrorMsg(data.errorMessage || 'Generation failed on worker.');
          clearRunningTasks();

          trackTtsGenerationFailed({
            stage: 'poll',
            voice_id: jobVoiceId,
            format: outputFormat
          });
        } else if (data.status === 'expired') {
          setProgressStage('expired');
          setStatus('failed');
          setExpiresAt(null);
          clearPersistedTtsJob();
          setErrorMsg('This audio file cache has expired. Please run synthesis again.');
          clearRunningTasks();

          trackTtsGenerationFailed({
            stage: 'poll',
            error_code: 'expired',
            voice_id: jobVoiceId,
            format: outputFormat
          });
        } else {
          // Update status stage
          setProgressStage(data.progressStage);
        }
      } catch (err) {
        // Covers both caller cancellation and the per-request timeout signal.
        if (isAbortError(err)) return;
        if (!mountedRef.current) return;

        console.error('Job status polling error:', err);

        consecutiveFailures += 1;

        // Surface a real outage instead of spinning on "Processing…" forever.
        if (consecutiveFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
          clearRunningTasks();
          setStatus('failed');
          setProgressStage('failed');
          setErrorMsg(
            'Lost connection to the speech synthesis server. Please check that the backend is running and try again.',
          );

          trackTtsGenerationFailed({
            stage: 'poll',
            error_code: 'POLL_TIMEOUT',
            voice_id: jobVoiceId,
            format: outputFormat
          });
        }
      }
    };

    poll();
    if (!mountedRef.current) return;
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
  };

  // Starts polling for a sessionStorage-restored job. The mount effect
  // stashes the job in pendingRestoreRef; this effect drains it once the
  // catalogue load has set the job id. The ref guard keeps a fresh submit —
  // which also sets jobId — from double-starting its own poll.
  useEffect(() => {
    const pending = pendingRestoreRef.current;
    if (!pending) return;
    pendingRestoreRef.current = null;
    startStatusPolling(pending.jobId, pending.token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  /**
   * Shared submit-failure handling for both single and dialogue jobs, so the
   * user gets the same friendly rate-limit / connection messages either way.
   * `voiceId` is the studio voice for a single job, the first turn's voice
   * for a dialogue.
   */
  const handleSubmitError = (err: unknown, voiceId: string) => {
    if (isAbortError(err) || !mountedRef.current) return;

    // Prefer the typed ApiError, which carries the code and Retry-After.
    const error = err instanceof ApiError ? err : (err as { code?: string; message?: string });
    console.error('Job submission failed:', error);
    setStatus('failed');
    setProgressStage('failed');

    let friendlyMsg: string;
    if (error.code === 'RATE_LIMITED') {
      const wait = err instanceof ApiError ? err.retryAfterSeconds : undefined;
      friendlyMsg = wait
        ? `Rate limit exceeded. Please try again in ${wait} second${wait === 1 ? '' : 's'}.`
        : (error.message || 'Rate limit exceeded. Please try again later.');
    } else if (err instanceof ApiError && err.code === 'INVALID_RESPONSE') {
      friendlyMsg = err.message;
    } else {
      friendlyMsg = error.message || 'Could not connect to the speech synthesis server.';
    }
    setErrorMsg(friendlyMsg);

    trackTtsGenerationFailed({
      stage: 'submit',
      error_code: error.code,
      voice_id: voiceId,
      format: outputFormat
    });
  };

  /**
   * Dialogue submit (Feature 7): every turn must have text, the combined
   * text shares the 2,000-character cap, and the whole dialogue counts once
   * against the hourly limit. The response is one job id, so the same polling
   * and player flow serves it — the meta describes the dialogue for the
   * history entry and analytics instead of the single-editor text.
   */
  const handleDialogueSubmit = async () => {
    if (dialogueSegments.some((segment) => !segment.text.trim())) {
      setErrorMsg('Every turn needs some text — fill in the empty turns or remove them.');
      return;
    }
    const totalChars = dialogueTotalChars(dialogueSegments);
    if (totalChars > DIALOGUE_MAX_CHARS) {
      setErrorMsg(`Dialogue text is ${totalChars.toLocaleString()} characters — trim it to ${DIALOGUE_MAX_CHARS.toLocaleString()} or less.`);
      return;
    }

    setErrorMsg(null);
    setStatus('submitting');
    setProgressStage('queued');
    setExpiresAt(null);

    // Revoke previous audio resources
    releaseAudioUrl();
    setAudioUrl(null);
    setIsPlaying(false);
    hasTrackedPlayRef.current = false;

    const segments = dialogueSegments.map((segment) => ({
      text: segment.text.trim(),
      voiceId: segment.voiceId || resolvedVoiceId,
    }));
    const combinedText = segments.map((segment) => segment.text).join(' ');
    const firstVoiceId = segments[0].voiceId;
    const firstVoice = voices.find((v) => v.id === firstVoiceId);
    if (firstVoice) {
      trackTtsGenerateClicked({
        voice_id: firstVoice.id,
        accent: firstVoice.accent,
        gender: firstVoice.gender,
        speed,
        format: outputFormat,
        character_count_bucket: getCharacterCountBucket(combinedText.length)
      });
    }

    jobStartTimeRef.current = Date.now();

    const submitController = new AbortController();
    abortControllerRef.current = submitController;

    try {
      const jobData = await createDialogueJob(
        segments,
        speed,
        outputFormat,
        { sentencePauseMs, paragraphPauseMs, normalizeText },
        submitController.signal,
      );

      // Bail out if we were torn down while the POST was in flight.
      if (!mountedRef.current) return;

      setJobId(jobData.jobId);
      savePersistedTtsJob({
        jobId: jobData.jobId,
        token: jobData.accessToken,
        voiceId: firstVoiceId,
        format: outputFormat,
        text: combinedText,
        speed,
        createdAt: new Date().toISOString(),
        status: 'polling',
      });

      // Start status verification interval
      startStatusPolling(jobData.jobId, jobData.accessToken, { text: combinedText, voiceId: firstVoiceId });
    } catch (err) {
      handleSubmitError(err, firstVoiceId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'dialogue') {
      await handleDialogueSubmit();
      return;
    }

    if (!text.trim()) {
      setErrorMsg('Please enter some text in the editor to convert.');
      return;
    }

    setErrorMsg(null);
    setStatus('submitting');
    setProgressStage('queued');
    setExpiresAt(null);

    // Revoke previous audio resources
    releaseAudioUrl();
    setAudioUrl(null);
    setIsPlaying(false);
    hasTrackedPlayRef.current = false;

    const voice = voices.find(v => v.id === resolvedVoiceId);
    if (voice) {
      trackTtsGenerateClicked({
        voice_id: voice.id,
        accent: voice.accent,
        gender: voice.gender,
        speed,
        format: outputFormat,
        character_count_bucket: getCharacterCountBucket(text.length)
      });
    }

    jobStartTimeRef.current = Date.now();

    // Own controller for the submission itself. `clearRunningTasks` on unmount
    // aborts it, so a submit still in flight when the user navigates away can
    // never proceed to start the poll interval.
    const submitController = new AbortController();
    abortControllerRef.current = submitController;

    try {
      const jobData = await createTtsJob(
        text,
        resolvedVoiceId,
        voices.find(v => v.id === resolvedVoiceId)?.accent || 'american',
        speed,
        outputFormat,
        {
          sentencePauseMs,
          paragraphPauseMs,
          normalizeText,
          // The engine travels with the voice: Kokoro voices stay on Kokoro,
          // Edge voices (e.g. Bengali) are synthesized by Edge. The backend
          // re-derives it from the served catalogue anyway.
          engine: voice?.engine,
        },
        submitController.signal,
      );

      // Bail out if we were torn down while the POST was in flight.
      if (!mountedRef.current) return;

      setJobId(jobData.jobId);
      savePersistedTtsJob({
        jobId: jobData.jobId,
        token: jobData.accessToken,
        voiceId: resolvedVoiceId,
        format: outputFormat,
        text,
        speed,
        createdAt: new Date().toISOString(),
        status: 'polling',
      });

      // Start status verification interval
      startStatusPolling(jobData.jobId, jobData.accessToken);
    } catch (err) {
      handleSubmitError(err, resolvedVoiceId);
    }
  };

  // Audio Playback Actions
  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().catch(err => {
        console.error('Audio play error:', err);
      });
      setIsPlaying(true);

      if (!hasTrackedPlayRef.current) {
        trackTtsPreviewPlayed({ voice_id: resolvedVoiceId, format: outputFormat });
        hasTrackedPlayRef.current = true;
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Loads a history entry back into the player (re-fetches the audio while
  // the server still holds it). The entry is NOT written back to the
  // current-job store: only a snippet was kept, and restoring a truncated
  // snippet into the editor on the next refresh would wipe the user's text.
  const loadHistoryEntry = async (entry: TtsHistoryEntry) => {
    if (historyBusyId) return;
    setHistoryBusyId(entry.jobId);
    try {
      const blob = await fetchAudioBlob(entry.jobId, entry.token);
      if (!mountedRef.current) return;
      const localUrl = URL.createObjectURL(blob);
      releaseAudioUrl();
      audioUrlRef.current = localUrl;
      setAudioUrl(localUrl);
      setJobId(entry.jobId);
      setStatus('completed');
      setProgressStage('completed');
      setDurationSeconds(entry.durationSeconds);
      setExpiresAt(entry.expiresAt);
      setSelectedVoiceId(entry.voiceId);
      setIsPlaying(false);
      hasTrackedPlayRef.current = false;
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Failed to load history audio:', err);
      setErrorMsg('That audio is no longer available. It may have expired after 60 minutes.');
      const next = loadTtsHistory().filter((e) => e.jobId !== entry.jobId);
      saveTtsHistory(next);
      setHistory(next);
    } finally {
      if (mountedRef.current) setHistoryBusyId(null);
    }
  };

  const downloadHistoryEntry = async (entry: TtsHistoryEntry) => {
    if (historyBusyId) return;
    setHistoryBusyId(entry.jobId);
    try {
      const blob = await fetchAudioBlob(entry.jobId, entry.token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `konthora-speech-${entry.jobId.slice(0, 8)}.${entry.format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      trackTtsAudioDownloaded({ voice_id: entry.voiceId, format: entry.format });
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Failed to download history audio:', err);
      setErrorMsg('That audio is no longer available. It may have expired after 60 minutes.');
    } finally {
      if (mountedRef.current) setHistoryBusyId(null);
    }
  };

  // Word-count estimate adjusted for selected speed and requested boundary pauses.
  // In dialogue mode the estimate covers the combined turns, not the single editor.
  const dialogueCombinedText = dialogueSegments.map((segment) => segment.text).join(' ');
  const estimateSourceText = mode === 'dialogue' ? dialogueCombinedText : text;
  const wordsCount = estimateSourceText.trim() ? estimateSourceText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = estimateTtsDurationSeconds(
    estimateSourceText,
    speed,
    sentencePauseMs,
    paragraphPauseMs,
  );
  const estimatedDuration = formatTtsEstimatedDuration(estimatedSeconds);

  // The Generate button stays disabled until a dialogue is actually submittable.
  const dialogueValid =
    dialogueSegments.length >= DIALOGUE_MIN_SEGMENTS &&
    dialogueSegments.every((segment) => segment.text.trim().length > 0) &&
    dialogueTotalChars(dialogueSegments) <= DIALOGUE_MAX_CHARS;

  const formatExpiryCountdown = (expires: string, now: number) => {
    const remainingMs = Math.max(0, Date.parse(expires) - now);
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Keeps history expiry labels fresh while entries are listed.
  useEffect(() => {
    if (history.length === 0) return;
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [history.length]);

  // Ticks the expiry countdown once a second while completed audio is live.
  // The expiry transition itself runs inside the interval callback (not in
  // the effect body): when the server deletes the audio, the player is
  // cleared the same way a polled 'expired' status would clear it.
  useEffect(() => {
    if (status !== 'completed' || !expiresAt) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (Date.parse(expiresAt) - now > 0) return;
      clearInterval(timer);
      clearRunningTasks();
      releaseAudioUrl();
      setAudioUrl(null);
      setIsPlaying(false);
      setStatus('failed');
      setProgressStage('expired');
      setExpiresAt(null);
      setErrorMsg('This audio file cache has expired. Please run synthesis again.');
      clearPersistedTtsJob();
    }, 1000);
    return () => clearInterval(timer);
  }, [status, expiresAt]);

  // Renders descriptive label for the progress banner
  const getProgressLabel = () => {
    return PROGRESS_MESSAGES[progressStage] || 'Processing audio generation...';
  };

  return (
    <div className="w-full">
      {/* Three-column (Layout J): language + voice picker on the left,
          editor + generated audio in the center, settings + recent
          history on the right. On mobile the grid stacks to a single
          column with the center (editor) first via order classes.
          min-w-0 on all three columns keeps long content (voice rows,
          history snippets) from pushing the grid past the viewport. */}
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
        {/* Left column: language + voice picker. */}
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            {/* Language Selector */}
            <div className="flex flex-col gap-3">
              <div
                id="tts-language-label"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                </span>
                Language
              </div>
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-labelledby="tts-language-label"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => handleLanguageChange(lang.value as SupportedLanguage)}
                    disabled={status === 'submitting' || status === 'polling'}
                    aria-pressed={selectedLanguage === lang.value}
                    className={`min-h-11 rounded-lg border text-sm font-semibold tracking-wide transition-colors cursor-pointer py-2 px-3 ${
                      selectedLanguage === lang.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.description || ''}
              </p>
            </div>
          </div>

          {/* Voice — searchable picker (Edge first, favorites pinned),
              moved out of the controls card into its own card, as in the
              three-column mockup. */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <VoicePicker
              voices={pickerVoices}
              selectedVoiceId={resolvedVoiceId}
              selectedLanguage={selectedLanguage}
              onSelectVoice={handleVoiceSelect}
              disabled={status === 'submitting' || status === 'polling' || loadingVoices || availableVoices.length === 0}
            />
            {availableVoices.length === 0 && (
              <p className="text-[11px] text-destructive leading-snug">
                No voices are available for this language right now. Please pick another language.
              </p>
            )}
          </div>
        </div>

        {/* Center column: mode, editor, generate, generated audio. */}
        <div className="order-1 min-w-0 space-y-6 lg:order-2">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Single voice / Dialogue mode toggle */}
        <div
          className="flex gap-1 rounded-xl border border-border bg-secondary/20 p-1"
          role="group"
          aria-label="Generation mode"
        >
          <button
            type="button"
            onClick={() => setMode('single')}
            aria-pressed={mode === 'single'}
            disabled={status === 'submitting' || status === 'polling'}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              mode === 'single'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            Single voice
          </button>
          <button
            type="button"
            onClick={() => setMode('dialogue')}
            aria-pressed={mode === 'dialogue'}
            disabled={status === 'submitting' || status === 'polling'}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              mode === 'dialogue'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            Dialogue · two or more voices
          </button>
        </div>

        {/* Dialogue builder — one script, turns with their own voices */}
        {mode === 'dialogue' && (
          <div className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
            <div className="flex justify-between items-center bg-secondary/30 px-4 py-2 border-b border-border/80">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dialogue Script
              </span>
            </div>
            <div className="p-5">
              <DialogueBuilder
                segments={dialogueSegments}
                onSegmentsChange={setDialogueSegments}
                voices={pickerVoices}
                selectedLanguage={selectedLanguage}
                defaultVoiceId={resolvedVoiceId}
                disabled={status === 'submitting' || status === 'polling'}
              />
            </div>
          </div>
        )}

        {/* Editor Wrapper */}
        {mode === 'single' && (
        <div className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
          {/* Editor Header Toolbar */}
          <div className="flex justify-between items-center gap-2 bg-secondary/30 px-4 py-2 border-b border-border/80">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {/* Short label below sm so the header fits on one line at 390px. */}
              <span className="sm:hidden">Script</span>
              <span className="hidden sm:inline">Speech Text Editor</span>
            </span>
            <div className="flex shrink-0 gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => handleInsertSample('input_action')}
                className="text-[11px] h-8 px-2 sm:text-xs sm:px-2.5 cursor-pointer"
                disabled={status === 'submitting' || status === 'polling'}
                aria-label="Insert sample text"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                Sample Text
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleClear}
                className="text-[11px] h-8 px-2 sm:text-xs sm:px-2.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer"
                aria-label="Clear all editor text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
          </div>

          {/* Textarea Area */}
          <div className="relative">
            <label htmlFor="tts-text-input" className="sr-only">
              Script text to convert to speech
            </label>
            <textarea
              id="tts-text-input"
              value={text}
              onChange={(e) => {
                const next = e.target.value;
                if (next.length > charLimit) {
                  // Trim instead of silently dropping the input: the user sees
                  // exactly what was kept and how much was removed (below).
                  setText(next.slice(0, charLimit));
                  setTrimNotice(
                    `Text trimmed to ${charLimit.toLocaleString()} characters — ${(next.length - charLimit).toLocaleString()} extra character${next.length - charLimit === 1 ? '' : 's'} removed.`,
                  );
                } else {
                  setText(next);
                  setTrimNotice(null);
                }
                setErrorMsg(null);
              }}
              disabled={status === 'submitting' || status === 'polling'}
              placeholder="Type or paste your text here to convert it to natural speech..."
              className="w-full min-h-[220px] p-5 bg-transparent border-0 focus:ring-0 focus:outline-none resize-y text-foreground leading-relaxed text-base"
              aria-describedby={errorMsg ? 'tts-validation-error tts-char-count' : 'tts-char-count'}
            />
          </div>

          {/* Trim notice / near-limit warning */}
          {(trimNotice || (text.length >= charLimit - 100 && text.length < charLimit)) && (
            <p role="status" className="px-5 pt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
              {trimNotice ?? 'Almost at the 2,000 character limit — remove some text or split it into a second generation.'}
            </p>
          )}

          {/* Editor Footer / Count */}
          <div className="flex justify-between items-center px-5 py-3 border-t border-border/60 bg-secondary/10">
            <span className="text-xs text-muted-foreground">
              {wordsCount.toLocaleString()} word{wordsCount === 1 ? '' : 's'} · Guest limit
            </span>
            <span
              id="tts-char-count"
              className={`text-xs font-mono font-medium ${
                text.length >= charLimit - 100
                  ? 'text-red-500 font-bold'
                  : 'text-muted-foreground'
              }`}
            >
              {text.length.toLocaleString()} / {charLimit.toLocaleString()}
            </span>
          </div>
        </div>
        )}

{/* Sample Scripts - Quick Start */}
        {mode === 'single' && (!text || text.trim() === '') && status !== 'submitting' && status !== 'polling' ? (
          <div className="border border-border/50 bg-card/50 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick start — click a script to load it
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SAMPLE_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  type="button"
                  onClick={() => {
                    setText(script.text);
                    setTrimNotice(null);
                    setErrorMsg(null);
                    trackTtsSampleInserted('quick_start');
                  }}
                  className="group relative p-3 border border-border/70 bg-background rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 shrink-0 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <script.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{script.title}</h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{script.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{script.category}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{script.duration}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Validation Errors */}
        {errorMsg && (
          <StatusMessage
            id="tts-validation-error"
            type="error"
            message={errorMsg}
          />
        )}


        {/* Generate Button and Duration Block */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-secondary/15 border border-border/80 rounded-2xl">
            <div className="text-left w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground uppercase block">
                Estimated audio duration
              </span>
              <span className="text-lg font-mono font-bold text-foreground mt-0.5 block leading-tight">
                {estimatedDuration}
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto sm:min-w-64 cursor-pointer"
              disabled={status === 'submitting' || status === 'polling' || availableVoices.length === 0 || (mode === 'dialogue' && !dialogueValid)}
              aria-describedby="tts-submit-status"
            >
              {status === 'submitting' || status === 'polling' ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              {status === 'submitting' || status === 'polling' ? 'Processing...' : mode === 'dialogue' ? 'Generate Dialogue' : 'Generate Speech'}
            </Button>
          </div>

          <div className="flex flex-col gap-2 px-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold uppercase tracking-wide">Estimate</span>
              <span>{wordsCount.toLocaleString()} words at {speed.toFixed(2)}×</span>
            </div>
            <div className="flex items-center gap-1.5 sm:text-right">
            <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              Your text is processed securely and automatically deleted after 60 minutes.{' '}
              <a href="/privacy-policy" className="underline hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Privacy</a>
            </span>
            </div>
          </div>
        </div>

        {/* Status Message (Pending or Processing details) */}
        {(status === 'submitting' || status === 'polling') && (
          <StatusMessage
            id="tts-submit-status"
            type="info"
            message={getProgressLabel()}
            className="border-primary/20"
          />
        )}
      </form>

          {/* Output Results Area */}
          <div className="min-w-0">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Generated Audio</h2>
              {status === 'completed' && <span className="text-xs font-semibold text-primary">Ready to play or download</span>}
            </div>

            <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
              {/* Empty state / Error state / Results */}
              {status !== 'completed' && (
                <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-border rounded-xl bg-card/30">
                  <div className="mb-3 text-muted-foreground">
                    {status === 'failed' ? (
                      <AlertCircle className="w-8 h-8 text-red-500 opacity-60 animate-pulse" />
                    ) : (
                      <Music className="w-8 h-8 opacity-40" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {status === 'failed' ? 'Synthesis failed' : 'No audio generated'}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    {status === 'failed'
                      ? 'There was an error generating your speech. Check the error message above.'
                      : 'Enter your script above and click Generate Speech. Your audio will appear here when ready.'}
                  </p>
                </div>
              )}

              {status === 'completed' && audioUrl && (
                <>
                  <JsonLd schema={{
                    '@context': 'https://schema.org',
                    '@type': 'AudioObject',
                    name: `Konthora Speech — ${resolvedVoiceId}`,
                    description: `AI-generated speech using ${resolvedVoiceId} voice, ${outputFormat.toUpperCase()} format`,
                    contentUrl: audioUrl,
                    encodingFormat: `audio/${outputFormat}`,
                    duration: durationSeconds ? `PT${Math.floor(durationSeconds)}S` : undefined,
                    author: {
                      '@type': 'Organization',
                      name: 'Konthora',
                      url: 'https://konthora.dev.bd',
                    },
                    dateCreated: new Date().toISOString(),
                  }} />
                  <div className="space-y-4">
                  {/* The audio element stays hidden here; the WaveformPlayer below
                      drives it (play/pause, seek, speed) and visualises it. */}
                  <audio
                    ref={audioPlayerRef}
                    src={audioUrl}
                    onEnded={handleAudioEnded}
                    className="hidden"
                    preload="auto"
                  />

                  <div className="flex flex-col gap-1 p-4 bg-secondary/20 rounded-xl">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Generated Speech File
                    </span>
                    {expiresAt && (
                      <span className="text-xs text-muted-foreground">
                        Available for another {formatExpiryCountdown(expiresAt, nowMs)} — audio is deleted after 60 minutes.
                      </span>
                    )}
                  </div>

                  <WaveformPlayer
                    audioUrl={audioUrl}
                    audioRef={audioPlayerRef}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlayPause}
                    onEnded={handleAudioEnded}
                    durationSeconds={durationSeconds}
                    outputFormat={outputFormat}
                    downloadHref={audioUrl}
                    downloadFileName={`konthora-speech-${jobId ? jobId.slice(0, 8) : 'export'}.${outputFormat}`}
                    onDownload={() => trackTtsAudioDownloaded({ voice_id: resolvedVoiceId, format: outputFormat })}
                  />

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                    <span>
                      Neural synthesis complete! Click the play button to preview or download the high-fidelity {outputFormat.toUpperCase()} file to your device.
                    </span>
                  </div>
                </div>
              </>)}
            </div>
          </div>
        </div>

        {/* Right column: settings + recent history. */}
        <div className="order-3 min-w-0 space-y-6">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Settings
            </div>

            <div className="grid gap-5">
            {/* Speed Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="speed-slider" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                    <Settings2 className="w-3.5 h-3.5 text-primary" />
                  </span>
                  Speech Speed
                </label>
                <span className="text-xs font-mono font-bold text-primary">
                  {speed === 1.0 ? 'Normal (1.00×)' : speed < 1.0 ? `Slow (${speed.toFixed(2)}×)` : `Fast (${speed.toFixed(2)}×)`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2" aria-label="Speech speed presets">
                {TTS_SPEED_PRESETS.map(({ label, value: presetSpeed }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setSpeed(presetSpeed);
                      trackTtsSpeedChanged(presetSpeed);
                    }}
                    disabled={status === 'submitting' || status === 'polling'}
                    aria-pressed={speed === presetSpeed}
                    className={`min-h-11 rounded-lg border px-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      speed === presetSpeed
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {label} <span className="font-mono">{presetSpeed.toFixed(2)}×</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center h-10">
                <input
                  id="speed-slider"
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  onPointerUp={() => trackTtsSpeedChanged(speed)}
                  onKeyUp={() => trackTtsSpeedChanged(speed)}
                  disabled={status === 'submitting' || status === 'polling'}
                  className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Format Selector */}
            <div className="flex flex-col gap-2">
              <div
                id="tts-format-label"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                  <FileAudio className="w-3.5 h-3.5 text-primary" />
                </span>
                Output Format
              </div>
              <div
                className="grid grid-cols-2 gap-2 min-h-11"
                role="group"
                aria-labelledby="tts-format-label"
              >
                {(['mp3', 'wav'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => {
                      setOutputFormat(fmt);
                      trackTtsFormatChanged(fmt);
                    }}
                    disabled={status === 'submitting' || status === 'polling'}
                    aria-pressed={outputFormat === fmt}
                    className={`rounded-lg border text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      outputFormat === fmt
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {outputFormat === 'mp3'
                  ? 'MP3: 24 kHz high-quality VBR audio for web, sharing, and everyday use.'
                  : 'WAV: 24 kHz, 16-bit PCM audio for editing and lossless workflows.'}
              </p>
            </div>
            </div>

            <details className="group border-t border-border/70 pt-5" open>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="inline-flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Pauses &amp; text
                </span>
                <span className="hidden text-xs font-normal text-muted-foreground group-open:hidden sm:inline">Sentence &amp; paragraph pauses, text normalization</span>
                <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">Hide controls</span>
              </summary>

              <div className="mt-4 grid gap-5 rounded-xl border border-border/70 bg-secondary/10 p-4">
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="sentence-pause" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sentence pause
                    </label>
                    <output htmlFor="sentence-pause" className="font-mono text-xs font-bold text-primary">
                      {sentencePauseMs} ms
                    </output>
                  </div>
                  <input
                    id="sentence-pause"
                    type="range"
                    min={TTS_SENTENCE_PAUSE_CONTROL.min}
                    max={TTS_SENTENCE_PAUSE_CONTROL.max}
                    step={TTS_SENTENCE_PAUSE_CONTROL.step}
                    value={sentencePauseMs}
                    onChange={(event) => setSentencePauseMs(Number(event.target.value))}
                    disabled={status === 'submitting' || status === 'polling'}
                    className="h-11 w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Added at sentence chunk boundaries. Production default: 220 ms.
                  </p>
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="paragraph-pause" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Paragraph pause
                    </label>
                    <output htmlFor="paragraph-pause" className="font-mono text-xs font-bold text-primary">
                      {paragraphPauseMs} ms
                    </output>
                  </div>
                  <input
                    id="paragraph-pause"
                    type="range"
                    min={TTS_PARAGRAPH_PAUSE_CONTROL.min}
                    max={TTS_PARAGRAPH_PAUSE_CONTROL.max}
                    step={TTS_PARAGRAPH_PAUSE_CONTROL.step}
                    value={paragraphPauseMs}
                    onChange={(event) => setParagraphPauseMs(Number(event.target.value))}
                    disabled={status === 'submitting' || status === 'polling'}
                    className="h-11 w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Added between paragraph chunks. Production default: 500 ms.
                  </p>
                </div>

                <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border/70 bg-background p-3">
                  <input
                    id="normalize-text"
                    type="checkbox"
                    checked={normalizeText}
                    onChange={(event) => setNormalizeText(event.target.checked)}
                    disabled={status === 'submitting' || status === 'polling'}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                  />
                  <label htmlFor="normalize-text" className="min-w-0 text-sm text-foreground">
                    <span className="block font-semibold">Normalize text for speech</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      Conservatively expands common English abbreviations, dollar amounts, and percentages and standardizes punctuation. Disable it to synthesize the submitted text without those speech-focused replacements.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/70 pt-3">
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    These controls, language, voice, speed, and format are saved in this browser. Script text and generated audio are never saved as preferences.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetPreferences}
                    disabled={status === 'submitting' || status === 'polling'}
                    className="w-full shrink-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset preferences
                  </Button>
                </div>
              </div>
            </details>
          </div>

          {/* Recent generations — last 5, re-downloadable within 60 minutes.
              Its own card in the right column, as in the three-column mockup. */}
          {history.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent generations</h3>
              <ul className="space-y-2">
                {history.map((entry) => {
                  const expired = Date.parse(entry.expiresAt) <= nowMs;
                  const busy = historyBusyId === entry.jobId;
                  const entryMinutes = entry.durationSeconds == null ? null : Math.floor(entry.durationSeconds / 60);
                  const entrySeconds = entry.durationSeconds == null ? null : Math.round(entry.durationSeconds % 60);
                  return (
                    <li
                      key={entry.jobId}
                      className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {entry.voiceName} · {entry.format.toUpperCase()}
                          {entryMinutes != null && entrySeconds != null
                            ? ` · ${entryMinutes}:${entrySeconds.toString().padStart(2, '0')}`
                            : ''}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{entry.textSnippet}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(entry.createdAt).toLocaleString()}
                          {expired ? ' · Expired' : ' · Available for 60 minutes from creation'}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void loadHistoryEntry(entry)}
                          disabled={expired || busy}
                        >
                          {busy ? 'Loading…' : 'Load'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void downloadHistoryEntry(entry)}
                          disabled={expired || busy}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
