'use client';

import React from 'react';
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react';
import { useVoicePreview } from '@/hooks/useVoicePreview';
import { API_BASE_URL } from '@/lib/api';
import type { VoicePageConfig } from '@/config/voices';

/**
 * Listen preview button for a per-voice landing page.
 *
 * The voice pages are server components, so the interactive preview lives
 * here. The preview URL follows the same rule as the TTS workspace
 * (TtsWorkspace.tsx): a Kokoro voice plays its static clip at
 * /audio/voice-previews/{id}.mp3 (the useVoicePreview default), while an
 * Edge voice has no static clip and is previewed through the API endpoint,
 * which synthesizes a short line in the voice's own language and caches it
 * server-side — no generation job is needed.
 */
export function VoicePagePreview({ voice }: { voice: VoicePageConfig }) {
  const { activePreviewId, previewStatus, playPreview, stopPreview } = useVoicePreview();

  const isPreviewing = activePreviewId === voice.id;
  const previewUrl =
    voice.engine === 'edge'
      ? `${API_BASE_URL}/tts/preview/${encodeURIComponent(voice.id)}`
      : undefined;

  /**
   * After a failed preview the hook holds the error state and ignores a
   * replay (same as the VoicePicker). Clearing it first returns the button
   * to "Listen", and the next click retries the preview.
   */
  const handleClick = () => {
    if (isPreviewing && previewStatus === 'error') {
      stopPreview();
      return;
    }
    playPreview(voice.id, {
      accent: voice.accent,
      gender: voice.gender,
      recommended: voice.recommended,
      previewUrl,
    });
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          isPreviewing && previewStatus === 'playing'
            ? `Pause ${voice.shortName} preview`
            : `Listen to ${voice.shortName}`
        }
        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary/50 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        {isPreviewing && previewStatus === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isPreviewing && previewStatus === 'playing' ? (
          <Pause className="h-4 w-4" aria-hidden="true" />
        ) : isPreviewing && previewStatus === 'error' ? (
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4" aria-hidden="true" />
        )}
        {isPreviewing && previewStatus === 'loading'
          ? 'Loading preview…'
          : isPreviewing && previewStatus === 'playing'
            ? 'Pause preview'
            : isPreviewing && previewStatus === 'error'
              ? 'Preview unavailable'
              : `Listen to ${voice.shortName}`}
      </button>
      {isPreviewing && previewStatus === 'error' && (
        <span className="text-xs text-muted-foreground">
          Preview unavailable for {voice.shortName}. You can still generate speech with this voice.
        </span>
      )}
    </span>
  );
}
