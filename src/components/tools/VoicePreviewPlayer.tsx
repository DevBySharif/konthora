'use client';

import React from 'react';
import { useVoicePreview } from '@/hooks/useVoicePreview';
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react';

interface VoicePreviewPlayerProps {
  voiceId: string;
  voiceName: string;
  accent: string;
  gender: string;
  recommended?: boolean;
}

/**
 * Keyboard-accessible play/pause button that streams the voice preview MP3
 * from public/audio/voice-previews/{voiceId}.mp3 using the shared
 * useVoicePreview hook (auto-cleaned on unmount).
 */
export function VoicePreviewPlayer({
  voiceId,
  voiceName,
  accent,
  gender,
  recommended = false,
}: VoicePreviewPlayerProps) {
  const { activePreviewId, previewStatus, playPreview } = useVoicePreview();

  const isActive = activePreviewId === voiceId;
  const isPlaying = isActive && previewStatus === 'playing';
  const isLoading = isActive && previewStatus === 'loading';
  const hasError = isActive && previewStatus === 'error';

  const handleClick = () => {
    playPreview(voiceId, {
      accent,
      gender,
      recommended,
      previewUrl: `/audio/voice-previews/${voiceId}.mp3`,
    });
  };

  const label = isLoading
    ? `Loading preview for ${voiceName}`
    : isPlaying
      ? `Pause preview for ${voiceName}`
      : `Play preview for ${voiceName}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isPlaying}
      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
      ) : (
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
      )}
      {hasError ? 'Preview unavailable' : isPlaying ? 'Pause' : 'Play preview'}
      {hasError && (
        <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
      )}
    </button>
  );
}