'use client';

import React from 'react';
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react';
import { useVoicePreview } from '@/hooks/useVoicePreview';

interface VoiceCardPreviewProps {
  voiceId: string;
  displayName: string;
  accent: string;
  gender: string;
  /** Full preview URL. Kokoro voices use a static MP3; Edge voices use the API preview endpoint. */
  previewUrl: string;
  /** Optional small caption shown above the button, e.g. the representative voice for a language group. */
  contextLabel?: string;
}

/**
 * Compact Listen/Pause button for a single voice card on the /voices page.
 *
 * The page is a server component, so each card renders this client island.
 * It plays the given previewUrl through the shared useVoicePreview hook
 * (auto-cleaned on unmount) and toggles pause/resume on repeat clicks.
 *
 * The button is rendered as a sibling of the card's <Link>, never nested
 * inside it, and it stops propagation so clicking Listen never navigates
 * to the voice page.
 */
export function VoiceCardPreview({
  voiceId,
  displayName,
  accent,
  gender,
  previewUrl,
  contextLabel,
}: VoiceCardPreviewProps) {
  const { activePreviewId, previewStatus, playPreview } = useVoicePreview();

  const isActive = activePreviewId === voiceId;
  const isPlaying = isActive && previewStatus === 'playing';
  const isLoading = isActive && previewStatus === 'loading';
  const hasError = isActive && previewStatus === 'error';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playPreview(voiceId, { accent, gender, previewUrl });
  };

  const label = isLoading
    ? `Loading preview for ${displayName}`
    : isPlaying
      ? `Pause preview for ${displayName}`
      : `Listen to ${displayName}`;

  return (
    <span className="inline-flex flex-col items-center gap-1">
      {contextLabel && (
        <span className="text-[11px] text-muted-foreground">{contextLabel}</span>
      )}
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-pressed={isPlaying}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        )}
        {hasError ? 'Preview unavailable' : isPlaying ? 'Pause' : 'Listen'}
        {hasError && (
          <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
        )}
      </button>
    </span>
  );
}
