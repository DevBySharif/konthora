'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Waveform player for the generated TTS clip (component only — the parent
 * `TtsWorkspace` owns the hidden <audio> element and the playback state).
 *
 * The parent keeps rendering its hidden <audio ref={audioPlayerRef}
 * src={audioUrl}>; this component only *drives* that element (play/pause,
 * seek, playbackRate) and visualises its audio on a <canvas>.
 */

export interface WaveformPlayerProps {
  /** Object URL of the fetched audio blob (same URL the parent's <audio> uses). */
  audioUrl: string;
  /** The parent's hidden audio element. This component never creates its own. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** Playback state owned by the parent. */
  isPlaying: boolean;
  /** Parent's toggle — plays/pauses the shared audio element. */
  onTogglePlay: () => void;
  /** Called when the audio element fires `ended` (parent resets isPlaying). */
  onEnded: () => void;
  /** Duration reported by the job status; null until the job completes. */
  durationSeconds: number | null;
  /** Output format, used only for the Download button label. */
  outputFormat: 'mp3' | 'wav';
  /** Download target — the parent passes its audioUrl. */
  downloadHref: string;
  /** e.g. `konthora-speech-<jobId8>.mp3` — built by the parent from jobId. */
  downloadFileName: string;
  /** Parent's download handler (analytics). */
  onDownload: () => void;
}

const BAR_COUNT = 120;
/** Flat row shown while decoding and when decoding fails — never an empty box. */
const FLAT_PEAKS: number[] = Array.from({ length: BAR_COUNT }, () => 0.35);
/** Playback-speed choices. Independent of the parent's GENERATION speed. */
const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25] as const;
/** Keyboard seek step (seconds) for the waveform slider. */
const SEEK_STEP_SECONDS = 5;

import { computePeaks } from '@/lib/waveform';

/**
 * Pure helper: reduce a mono channel to `barCount` normalised peaks (0..1),
 * one max-abs value per bucket, scaled by the global max so quiet clips still
 * fill the waveform. Lives in src/lib/waveform.ts so it can be unit-tested
 * without a browser.
 */

function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds === null || totalSeconds === undefined || !Number.isFinite(totalSeconds)) {
    return '00:00';
  }
  const total = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function WaveformPlayer({
  audioUrl,
  audioRef,
  isPlaying,
  onTogglePlay,
  onEnded,
  durationSeconds,
  outputFormat,
  downloadHref,
  downloadFileName,
  onDownload,
}: WaveformPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveformWrapRef = useRef<HTMLDivElement | null>(null);

  const [peaks, setPeaks] = useState<number[]>(FLAT_PEAKS);
  /** True duration of the decoded buffer; fallback when durationSeconds is null. */
  const [decodedDuration, setDecodedDuration] = useState<number | null>(null);
  /** Elapsed seconds, re-rendered at most once per second. */
  const [currentTime, setCurrentTime] = useState(0);
  /** Preview-only playback speed — separate from the generation speed. */
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  /** Played fraction (0..1), kept in a ref so timeupdate can redraw without re-rendering. */
  const progressRef = useRef(0);
  /** Latest onEnded without re-subscribing listeners on every parent render. */
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  const totalDuration = durationSeconds ?? decodedDuration;

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Theme is dark-only; played bars use the primary token, unplayed bars a
    // translucent white so they stay visible on the near-black card.
    const styles = getComputedStyle(document.documentElement);
    const playedColor = styles.getPropertyValue('--primary').trim() || '#FFFFFF';
    const unplayedColor = 'rgba(255, 255, 255, 0.28)';

    ctx.clearRect(0, 0, width, height);

    const slotWidth = width / BAR_COUNT;
    const barWidth = Math.max(1, Math.floor(slotWidth * 0.6));
    const progressX = progressRef.current * width;

    for (let i = 0; i < BAR_COUNT; i += 1) {
      const peak = peaks[i] ?? 0.35;
      const barHeight = Math.max(2 * dpr, peak * (height - 4 * dpr));
      const x = i * slotWidth + (slotWidth - barWidth) / 2;
      const y = (height - barHeight) / 2;
      ctx.fillStyle = x + barWidth / 2 <= progressX ? playedColor : unplayedColor;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
      } else {
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();
    }

    // Thin playhead line at the current position.
    if (progressRef.current > 0 && progressRef.current < 1) {
      ctx.fillStyle = playedColor;
      ctx.fillRect(progressX - dpr, 0, 2 * dpr, height);
    }
  }, [peaks]);

  // Redraw whenever the peaks change (placeholder -> decoded waveform).
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Redraw on container resize so bars stay crisp at any width.
  useEffect(() => {
    const wrapper = waveformWrapRef.current;
    if (!wrapper || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => drawWaveform());
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [drawWaveform]);

  /**
   * Decode the audio (object URL) into peaks. Runs on every new clip; aborts
   * the fetch and closes the AudioContext on unmount / audioUrl change, and a
   * stale decode can never overwrite a newer clip's peaks. Any failure leaves
   * the flat placeholder bars in place — the player never crashes.
   */
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const decode = async () => {
      // Reset to the placeholder row for the new clip. This runs inside the
      // async callback (not the effect body), so it cannot cascade renders.
      setPeaks(FLAT_PEAKS);
      setDecodedDuration(null);
      setCurrentTime(0);
      progressRef.current = 0;

      let audioCtx: AudioContext | null = null;
      try {
        const response = await fetch(audioUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`Waveform fetch failed: HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (cancelled) return;

        const AudioContextCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextCtor) return; // Very old browser: keep the placeholder row.
        audioCtx = new AudioContextCtor();
        const audioBuffer = await audioCtx.decodeAudioData(buffer);
        if (cancelled) return;

        // Generated speech is mono; the first channel is the whole signal.
        setPeaks(computePeaks(audioBuffer.getChannelData(0), BAR_COUNT));
        setDecodedDuration(audioBuffer.duration);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        console.warn('Waveform decode failed — showing placeholder bars.', err);
      } finally {
        if (audioCtx) {
          void audioCtx.close().catch(() => undefined);
        }
      }
    };
    void decode();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [audioUrl]);

  // Keep the played portion in sync with the shared audio element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncProgress = () => {
      const duration =
        (Number.isFinite(audio.duration) ? audio.duration : 0) ||
        durationSeconds ||
        0;
      progressRef.current =
        duration > 0 ? Math.min(1, Math.max(0, audio.currentTime / duration)) : 0;
      drawWaveform();
      const t = audio.currentTime;
      setCurrentTime((prev) => (Math.floor(prev) === Math.floor(t) ? prev : t));
    };

    const handleEnded = () => {
      progressRef.current = 1;
      drawWaveform();
      setCurrentTime(0);
      onEndedRef.current();
    };

    audio.addEventListener('timeupdate', syncProgress);
    audio.addEventListener('seeked', syncProgress);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', syncProgress);
      audio.removeEventListener('seeked', syncProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, audioRef, drawWaveform, durationSeconds]);

  // Re-apply the chosen preview speed whenever the clip (or the speed) changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = playbackRate;
  }, [audioRef, audioUrl, playbackRate]);

  const getDuration = (): number => {
    const audio = audioRef.current;
    return (
      (audio && Number.isFinite(audio.duration) ? audio.duration : 0) ||
      durationSeconds ||
      decodedDuration ||
      0
    );
  };

  const seekToFraction = (fraction: number) => {
    const audio = audioRef.current;
    const duration = getDuration();
    if (!audio || duration <= 0) return;
    const clamped = Math.min(1, Math.max(0, fraction));
    audio.currentTime = clamped * duration;
    progressRef.current = clamped;
    setCurrentTime(clamped * duration);
    drawWaveform();
  };

  const handleWaveformPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = waveformWrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    seekToFraction((event.clientX - rect.left) / rect.width);
  };

  const handleWaveformKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const duration = getDuration();
    if (!audio || duration <= 0) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - SEEK_STEP_SECONDS);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      audio.currentTime = Math.min(duration, audio.currentTime + SEEK_STEP_SECONDS);
    } else if (event.key === 'Home') {
      event.preventDefault();
      audio.currentTime = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      audio.currentTime = duration;
    } else {
      return;
    }
    progressRef.current = Math.min(1, Math.max(0, audio.currentTime / duration));
    setCurrentTime(audio.currentTime);
    drawWaveform();
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
  };

  return (
    <div className="space-y-4">
      {/* Play button + waveform + time readout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause generated speech' : 'Play generated speech'}
          className="w-12 h-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div
            ref={waveformWrapRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek through generated speech"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              totalDuration && totalDuration > 0
                ? Math.round((currentTime / totalDuration) * 100)
                : 0
            }
            aria-valuetext={`${formatDuration(currentTime)} of ${formatDuration(totalDuration)}`}
            onPointerDown={handleWaveformPointerDown}
            onKeyDown={handleWaveformKeyDown}
            className="relative h-14 w-full cursor-pointer touch-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span aria-label="Current playback time">{formatDuration(currentTime)}</span>
            <span aria-label="Total duration">{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Playback speed + download */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            id="waveform-playback-speed-label"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
          >
            Playback speed
          </span>
          <div
            className="flex gap-1.5"
            role="group"
            aria-labelledby="waveform-playback-speed-label"
          >
            {PLAYBACK_SPEEDS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSpeedChange(rate)}
                aria-pressed={playbackRate === rate}
                className={`h-9 min-w-14 rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                  playbackRate === rate
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                {rate.toFixed(2)}×
              </button>
            ))}
          </div>
        </div>

        <a
          href={downloadHref}
          download={downloadFileName}
          onClick={onDownload}
        >
          <Button variant="primary" size="md" className="gap-2 cursor-pointer">
            <Download className="w-4 h-4" aria-hidden="true" />
            Download {outputFormat.toUpperCase()}
          </Button>
        </a>
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">
        Playback speed only changes how this preview sounds — it does not change
        the generated file or the speech speed used for generation.
      </p>
    </div>
  );
}
