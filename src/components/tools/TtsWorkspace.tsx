'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusMessage } from '@/components/ui/StatusMessage';
import {
  Volume2,
  Trash2,
  FileText,
  Download,
  Play,
  Pause,
  Music,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Lock,
  Settings2,
  RotateCcw,
} from 'lucide-react';
import {
  fetchVoices,
  createTtsJob,
  getTtsJobStatus,
  fetchAudioBlob,
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

const SAMPLE_TEXT =
  'Welcome to Konthora. Experience fast, natural-sounding AI text-to-speech directly in your browser. Simply enter your text, choose a voice, adjust the playback speed, and generate high-quality speech in seconds. Explore different voices and accents to find the perfect sound for your content.';

export function TtsWorkspace({ initialVoiceId }: { initialVoiceId?: string | null }) {
  const [voices, setVoices] = useState<ApiVoice[]>(FALLBACK_VOICES);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(true);

  // Core configuration states
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en-US');
  const [text, setText] = useState<string>('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(FALLBACK_VOICES[0].id);
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

  // Audio playback states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  const charLimit = 2000;

  // References for polling and audio elements
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Analytics refs
  const jobStartTimeRef = useRef<number | null>(null);
  const hasTrackedPlayRef = useRef<boolean>(false);

  const handleVoiceSelect = (voiceId: string) => {
    if (voiceId === selectedVoiceId) return;
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
    setSelectedLanguage(lang);
    const lastVoice = lastVoiceByLanguage.current[lang];
    const fallback = voices.find(v => v.id === lastVoice)
      ? lastVoice
      : DEFAULT_VOICE_BY_LANGUAGE[lang];
    setSelectedVoiceId(fallback);
  };

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
        }
      } catch (err) {
        console.error('Failed to load dynamic voices catalog. Falling back to local values.', err);
        setVoices(FALLBACK_VOICES);
        applyInitialPreferences(FALLBACK_VOICES);
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

  useEffect(() => {
    return () => {
      clearRunningTasks();
    };
  }, []);

  // Wipes all states back to starting setup
  const handleClear = () => {
    setText('');
    setErrorMsg(null);
    setStatus('idle');
    setProgressStage('');
    setJobId(null);
    setDurationSeconds(null);
    clearRunningTasks();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    hasTrackedPlayRef.current = false;
  };

  const handleInsertSample = (source: 'input_action' | 'empty_state' = 'input_action') => {
    setText(SAMPLE_TEXT);
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
  const startStatusPolling = (id: string, token: string) => {
    clearRunningTasks();
    setStatus('polling');
    setProgressStage('queued');

    const poll = async () => {
      // Abort controller for current request loop
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await getTtsJobStatus(id, token, controller.signal);

        if (data.status === 'completed') {
          setProgressStage('completed');
          setDurationSeconds(data.durationSeconds);

          // Request file download, convert to blob, set Object URL
          const blob = await fetchAudioBlob(id, token);
          const localUrl = URL.createObjectURL(blob);

          // Cleanup existing audio URL before assigning new one to prevent leaks
          setAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return localUrl;
          });

          setStatus('completed');
          clearRunningTasks();

          const voice = voices.find(v => v.id === selectedVoiceId);
          if (voice && jobStartTimeRef.current) {
            trackTtsGenerationCompleted({
              voice_id: voice.id,
              accent: voice.accent,
              gender: voice.gender,
              speed,
              format: outputFormat,
              character_count: text.length,
              character_count_bucket: getCharacterCountBucket(text.length),
              duration_seconds: data.durationSeconds ?? undefined,
              elapsed_seconds: Math.round((Date.now() - jobStartTimeRef.current) / 1000)
            });
            jobStartTimeRef.current = null;
          }
        } else if (data.status === 'failed') {
          setProgressStage('failed');
          setStatus('failed');
          setErrorMsg(data.errorMessage || 'Generation failed on worker.');
          clearRunningTasks();

          trackTtsGenerationFailed({
            stage: 'poll',
            voice_id: selectedVoiceId,
            format: outputFormat
          });
        } else if (data.status === 'expired') {
          setProgressStage('expired');
          setStatus('failed');
          setErrorMsg('This audio file cache has expired. Please run synthesis again.');
          clearRunningTasks();

          trackTtsGenerationFailed({
            stage: 'poll',
            error_code: 'expired',
            voice_id: selectedVoiceId,
            format: outputFormat
          });
        } else {
          // Update status stage
          setProgressStage(data.progressStage);
        }
      } catch (err) {
        const error = err as Error;
        if (error.name === 'AbortError') return;
        console.error('Job status polling error:', error);
        // Do not fail immediately on minor network drops, let interval retry
      }
    };

    poll();
    pollTimerRef.current = setInterval(poll, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setErrorMsg('Please enter some text in the editor to convert.');
      return;
    }

    setErrorMsg(null);
    setStatus('submitting');
    setProgressStage('queued');

    // Revoke previous audio resources
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    hasTrackedPlayRef.current = false;

    const voice = voices.find(v => v.id === selectedVoiceId);
    if (voice) {
      trackTtsGenerateClicked({
        voice_id: voice.id,
        accent: voice.accent,
        gender: voice.gender,
        speed,
        format: outputFormat,
        character_count: text.length,
        character_count_bucket: getCharacterCountBucket(text.length)
      });
    }

    jobStartTimeRef.current = Date.now();

    try {
      const jobData = await createTtsJob(
        text,
        selectedVoiceId,
        voices.find(v => v.id === selectedVoiceId)?.accent || 'american',
        speed,
        outputFormat,
        {
          sentencePauseMs,
          paragraphPauseMs,
          normalizeText,
        },
      );

      setJobId(jobData.jobId);

      // Start status verification interval
      startStatusPolling(jobData.jobId, jobData.accessToken);
    } catch (err) {
      const error = err as { code?: string; message?: string };
      console.error('Job submission failed:', error);
      setStatus('failed');
      setProgressStage('failed');

      const friendlyMsg = error.code === 'RATE_LIMITED'
        ? (error.message || 'Rate limit exceeded. Please try again later.')
        : (error.message || 'Could not connect to the speech synthesis server.');
      setErrorMsg(friendlyMsg);

      trackTtsGenerationFailed({
        stage: 'submit',
        error_code: error.code,
        voice_id: selectedVoiceId,
        format: outputFormat
      });
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
        trackTtsPreviewPlayed({ voice_id: selectedVoiceId, format: outputFormat });
        hasTrackedPlayRef.current = true;
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Word-count estimate adjusted for selected speed and requested boundary pauses.
  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = estimateTtsDurationSeconds(
    text,
    speed,
    sentencePauseMs,
    paragraphPauseMs,
  );
  const estimatedDuration = formatTtsEstimatedDuration(estimatedSeconds);

  const formatCompletedDuration = () => {
    if (durationSeconds === null) return '00:00';
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.round(durationSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Renders descriptive label for the progress banner
  const getProgressLabel = () => {
    return PROGRESS_MESSAGES[progressStage] || 'Processing audio generation...';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Editor Wrapper */}
        <div className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
          {/* Editor Header Toolbar */}
          <div className="flex justify-between items-center bg-secondary/30 px-4 py-2 border-b border-border/80">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Speech Text Editor
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => handleInsertSample('input_action')}
                className="text-xs h-8 px-2.5 cursor-pointer"
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
                className="text-xs h-8 px-2.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer"
                aria-label="Clear all editor text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
          </div>

          {/* Textarea Area */}
          <div className="relative">
            <textarea
              id="tts-text-input"
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= charLimit) {
                  setText(e.target.value);
                  setErrorMsg(null);
                }
              }}
              disabled={status === 'submitting' || status === 'polling'}
              placeholder="Type or paste your text here to convert it to natural speech..."
              className="w-full min-h-[220px] p-5 bg-transparent border-0 focus:ring-0 focus:outline-none resize-y text-foreground leading-relaxed text-base"
              aria-describedby={errorMsg ? 'tts-validation-error' : undefined}
            />
          </div>

          {/* Editor Footer / Count */}
          <div className="flex justify-between items-center px-5 py-3 border-t border-border/60 bg-secondary/10">
            <span className="text-xs text-muted-foreground">
              {wordsCount.toLocaleString()} word{wordsCount === 1 ? '' : 's'} · Guest limit
            </span>
            <span
              className={`text-xs font-mono font-medium ${
                text.length >= charLimit - 100
                  ? 'text-red-500 font-bold'
                  : 'text-muted-foreground'
              }`}
              aria-live="polite"
            >
              {text.length.toLocaleString()} / {charLimit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Validation Errors */}
        {errorMsg && (
          <StatusMessage
            id="tts-validation-error"
            type="error"
            message={errorMsg}
          />
        )}

        {/* Controls Layout */}
        <div className="space-y-6 p-5 sm:p-6 lg:p-7 border border-border bg-card rounded-2xl shadow-xs">
          {/* Language Selector */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => handleLanguageChange(lang.value as SupportedLanguage)}
                  disabled={status === 'submitting' || status === 'polling'}
                  className={`min-h-11 rounded-lg border text-sm font-semibold tracking-wide transition-colors cursor-pointer py-2 px-3 ${
                    selectedLanguage === lang.value
                      ? 'border-primary bg-primary/5 text-primary'
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

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(15rem,0.75fr)] lg:items-start">
          {/* Voice Picker V2 */}
          <VoicePicker
            voices={voices.filter(v => v.language === selectedLanguage || (!v.language && selectedLanguage === 'en-US'))}
            selectedVoiceId={selectedVoiceId}
            selectedLanguage={selectedLanguage}
            onSelectVoice={handleVoiceSelect}
            disabled={status === 'submitting' || status === 'polling' || loadingVoices}
          />

          {/* Speed Slider */}
          <div className="flex flex-col gap-2 lg:order-2 lg:col-span-2 border-t border-border/70 pt-5">
            <div className="flex justify-between items-center">
              <label htmlFor="speed-slider" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                      ? 'border-primary bg-primary/5 text-primary'
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
          <div className="flex flex-col gap-2 lg:order-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-2 min-h-11">
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
                      ? 'border-primary bg-primary/5 text-primary'
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

          <details className="group border-t border-border/70 pt-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <span className="inline-flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Advanced speech controls
              </span>
              <span className="hidden text-xs font-normal text-muted-foreground group-open:hidden sm:inline">Pauses & text normalization</span>
              <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">Hide controls</span>
            </summary>

            <div className="mt-4 grid gap-5 rounded-xl border border-border/70 bg-secondary/10 p-4 sm:grid-cols-2">
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

              <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border/70 bg-background p-3 sm:col-span-2">
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

              <div className="flex flex-col gap-3 border-t border-border/70 pt-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-snug text-muted-foreground">
                  These controls, language, voice, speed, and format are saved in this browser. Script text and generated audio are never saved as preferences.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetPreferences}
                  disabled={status === 'submitting' || status === 'polling'}
                  className="w-full shrink-0 sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset preferences
                </Button>
              </div>
            </div>
          </details>
        </div>

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
              disabled={status === 'submitting' || status === 'polling'}
              aria-describedby="tts-submit-status"
            >
              {status === 'submitting' || status === 'polling' ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              {status === 'submitting' || status === 'polling' ? 'Processing...' : 'Generate Speech'}
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
              <a href="/privacy-policy" className="underline hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Privacy</a>
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
      <div className="mt-8 pt-7 border-t border-border/60">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">Generated Audio</h2>
          {status === 'completed' && <span className="text-xs font-semibold text-primary">Ready to play or download</span>}
        </div>

        <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
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
                  : 'Enter your script and click Generate Speech to create natural-sounding voiceovers. Output controls will appear here.'}
              </p>
              {status !== 'failed' && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertSample('empty_state')}
                  >
                    Try a sample script
                  </Button>
                </div>
              )}
            </div>
          )}

          {status === 'completed' && audioUrl && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-secondary/20 rounded-xl">
                {/* Audio HTML element (hidden visually but driven by refs and play controls) */}
                <audio
                  ref={audioPlayerRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                  className="hidden"
                  preload="auto"
                />

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Pause generated speech' : 'Play generated speech'}
                    className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="text-left">
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">
                      Generated Speech File
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block leading-tight font-mono">
                      Duration: {formatCompletedDuration()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <a
                    href={audioUrl}
                    download={`konthora-speech-${jobId ? jobId.slice(0, 8) : 'export'}.${outputFormat}`}
                    className="flex-1 md:flex-none"
                    onClick={() => trackTtsAudioDownloaded({ voice_id: selectedVoiceId, format: outputFormat })}
                  >
                    <Button variant="primary" size="md" className="w-full gap-2 cursor-pointer">
                      <Download className="w-4 h-4" />
                      Download {outputFormat.toUpperCase()}
                    </Button>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                <span>
                  Neural synthesis complete! Click the play button to preview or download the high-fidelity {outputFormat.toUpperCase()} file to your device.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
