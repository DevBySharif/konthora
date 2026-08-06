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
  Lock
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
  trackTtsVoicePreviewPlayed,
  trackTtsAudioDownloaded,
  getCharacterCountBucket
} from '@/components/analytics/events';

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
  { id: 'bm_fable', displayName: 'Fable (Male)', gender: 'male', accent: 'British English', language: 'en-GB', recommended: false, defaultSpeed: 1.0, minimumSpeed: 0.75, maximumSpeed: 1.25 }
];

const ACCENTS = [
  { id: 'american', name: 'American English' },
  { id: 'british', name: 'British English' }
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

export function TtsWorkspace() {
  const [voices, setVoices] = useState<ApiVoice[]>(FALLBACK_VOICES);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(true);

  // Selection and form states
  const [text, setText] = useState<string>('');
  const [selectedAccent, setSelectedAccent] = useState<string>(ACCENTS[0].id);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('af_heart');
  const [speed, setSpeed] = useState<number>(1.0);
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav'>('mp3');

  // Job execution states
  const [status, setStatus] = useState<'idle' | 'submitting' | 'polling' | 'completed' | 'failed'>('idle');
  const [progressStage, setProgressStage] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio playback states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  // Voice preview states
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTrackedRef = useRef<boolean>(false);

  const charLimit = 2000;

  // References for polling and audio elements
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Analytics refs
  const jobStartTimeRef = useRef<number | null>(null);
  const hasTrackedPlayRef = useRef<boolean>(false);

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.oncanplaythrough = null;
        previewAudioRef.current.onerror = null;
        previewAudioRef.current.onended = null;
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
    };
  }, []);

  const togglePreview = () => {
    if (previewStatus === 'playing') {
      previewAudioRef.current?.pause();
      setPreviewStatus('paused');
      return;
    }

    if (previewStatus === 'paused') {
      previewAudioRef.current?.play();
      setPreviewStatus('playing');
      return;
    }

    // Start fresh preview for the current voice
    setPreviewStatus('loading');
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    const audio = new Audio(`/audio/voice-previews/${selectedVoiceId}.mp3`);
    previewAudioRef.current = audio;

    audio.oncanplaythrough = () => {
      if (previewAudioRef.current !== audio) return;
      audio.play().then(() => {
        if (previewAudioRef.current !== audio) return;
        setPreviewStatus('playing');
        if (!previewTrackedRef.current) {
          previewTrackedRef.current = true;
          const currentVoice = voices.find((v) => v.id === selectedVoiceId);
          if (currentVoice) {
            trackTtsVoicePreviewPlayed({
              voice_id: currentVoice.id,
              accent: currentVoice.accent,
              gender: currentVoice.gender,
              recommended: currentVoice.recommended
            });
          }
        }
      }).catch((err) => {
        if (previewAudioRef.current !== audio) return;
        console.error('Preview play failed', err);
        setPreviewStatus('error');
      });
    };

    audio.onended = () => {
      if (previewAudioRef.current !== audio) return;
      setPreviewStatus('idle');
    };

    audio.onerror = () => {
      if (previewAudioRef.current !== audio) return;
      setPreviewStatus('error');
    };

    audio.load();
  };

  // Fetch voices list on mount
  useEffect(() => {
    async function loadVoices() {
      try {
        setLoadingVoices(true);
        const data = await fetchVoices();
        if (data && data.length > 0) {
          setVoices(data);
          // Set default voice based on first US voice in returned data
          const defaultUs = data.find(v => v.id === 'af_heart') || data[0];
          setSelectedVoiceId(defaultUs.id);
        }
      } catch (err) {
        console.error('Failed to load dynamic voices catalog. Falling back to local values.', err);
        setVoices(FALLBACK_VOICES);
      } finally {
        setLoadingVoices(false);
      }
    }
    loadVoices();
  }, []);

  // Filter voices dynamically based on selected accent
  const filteredVoices = voices.filter(
    (v) => v.accent.toLowerCase() === (selectedAccent === 'american' ? 'american english' : 'british english')
  );

  // Auto-switch voice choice when changing accent
  useEffect(() => {
    if (filteredVoices.length > 0) {
      // Keep voice if it exists in filtered list, else reset to first in list
      const exists = filteredVoices.some(v => v.id === selectedVoiceId);
      if (!exists) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedVoiceId(filteredVoices[0].id);
      }
    }
  }, [selectedAccent, filteredVoices, selectedVoiceId]);

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
        selectedAccent,
        speed,
        outputFormat
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

  // Word count duration estimator
  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Estimates ~140 words per minute at 1.0x speed
  const estimatedSeconds = Math.max(1, Math.round(wordsCount / (2.3 * speed)));

  const formatEstimatedDuration = () => {
    if (wordsCount === 0) return '00:00';
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
    <div className="w-full max-w-4xl mx-auto">
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
              Guest Character Limit
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border border-border bg-card rounded-2xl shadow-xs">
          {/* Accent Options */}
          <div className="flex flex-col gap-2">
            <label htmlFor="accent-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Voice Accent
            </label>
            <select
              id="accent-select"
              value={selectedAccent}
              onChange={(e) => setSelectedAccent(e.target.value)}
              disabled={status === 'submitting' || status === 'polling'}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer"
            >
              {ACCENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Model */}
          <div className="flex flex-col gap-2">
            <label htmlFor="voice-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Voice Model
            </label>
            <div className="flex flex-row gap-2">
              <select
                id="voice-select"
                value={selectedVoiceId}
                onChange={(e) => {
                  const newVoiceId = e.target.value;
                  setSelectedVoiceId(newVoiceId);

                  // Reset preview state for new voice
                  setPreviewStatus('idle');
                  if (previewAudioRef.current) {
                    previewAudioRef.current.oncanplaythrough = null;
                    previewAudioRef.current.onerror = null;
                    previewAudioRef.current.onended = null;
                    previewAudioRef.current.pause();
                    previewAudioRef.current.src = '';
                    previewAudioRef.current = null;
                  }
                  previewTrackedRef.current = false;

                  const voice = voices.find(v => v.id === newVoiceId);
                  if (voice) {
                    trackTtsVoiceChanged({
                      voice_id: voice.id,
                      accent: voice.accent,
                      gender: voice.gender,
                      recommended: voice.recommended,
                    });
                  }
                }}
                disabled={status === 'submitting' || status === 'polling' || loadingVoices}
                className="w-full flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer"
              >
                {loadingVoices ? (
                  <option>Loading voices...</option>
                ) : (
                  filteredVoices.map((v) => (
                    <option key={v.id} value={v.id} className="py-1">
                      {v.displayName} {v.recommended ? '★' : ''}
                    </option>
                  ))
                )}
              </select>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={togglePreview}
                className="w-full sm:w-[110px] h-10 px-4 shrink-0 text-sm"
                aria-pressed={previewStatus === 'playing'}
                disabled={previewStatus === 'loading'}
                aria-label={
                  previewStatus === 'loading' ? `Loading preview for ${voices.find(v => v.id === selectedVoiceId)?.displayName}` :
                  previewStatus === 'playing' ? `Pause preview for ${voices.find(v => v.id === selectedVoiceId)?.displayName}` :
                  previewStatus === 'paused' ? `Resume preview for ${voices.find(v => v.id === selectedVoiceId)?.displayName}` :
                  previewStatus === 'idle' ? `Preview ${voices.find(v => v.id === selectedVoiceId)?.displayName}` :
                  `Preview unavailable for ${voices.find(v => v.id === selectedVoiceId)?.displayName}`
                }
              >
                {previewStatus === 'loading' && 'Loading...'}
                {previewStatus === 'playing' && (
                  <>
                    <Pause className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Pause
                  </>
                )}
                {previewStatus === 'paused' && (
                  <>
                    <Play className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Listen
                  </>
                )}
                {previewStatus === 'idle' && (
                  <>
                    <Play className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Listen
                  </>
                )}
                {previewStatus === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Listen
                  </>
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
              {previewStatus === 'error' ? (
                <span className="text-destructive/90">Preview unavailable. You can still generate speech.</span>
              ) : (
                <span>
                  {(() => {
                    const v = voices.find(v => v.id === selectedVoiceId);
                    if (!v) return null;
                    return `${v.accent} • ${v.gender.charAt(0).toUpperCase() + v.gender.slice(1)}`;
                  })()}
                </span>
              )}
            </div>
          </div>

          {/* Speed Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label htmlFor="speed-slider" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Speech Speed
              </label>
              <span className="text-xs font-mono font-bold text-primary">
                {speed === 1.0 ? 'Normal (1.00×)' : speed < 1.0 ? `Slow (${speed.toFixed(2)}×)` : `Fast (${speed.toFixed(2)}×)`}
              </span>
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-2 h-10">
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
                ? 'MP3: Smaller file, suitable for web, sharing, and everyday use.'
                : 'WAV: Uncompressed audio, suitable for editing and workflows that need maximum source quality.'}
            </p>
          </div>
        </div>

        {/* Generate Button and Duration Block */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-secondary/15 border border-border/80 rounded-2xl">
            <div className="text-left w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground uppercase block">
                Estimated Audio Duration
              </span>
              <span className="text-lg font-mono font-bold text-foreground mt-0.5 block leading-tight">
                {formatEstimatedDuration()}
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto cursor-pointer"
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

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground px-4 text-center">
            <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              Your text is processed securely and automatically deleted after 60 minutes.{' '}
              <a href="/privacy-policy" className="underline hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">Privacy</a>
            </span>
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
      <div className="mt-12 pt-8 border-t border-border/60">
        <h3 className="text-lg font-bold text-foreground mb-4">Generated Audio Output</h3>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
          {status !== 'completed' && (
            <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-border rounded-2xl bg-card/30">
              <div className="mb-4 text-muted-foreground">
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
                <div className="mt-6">
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
