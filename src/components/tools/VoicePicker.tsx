'use client';

import React from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';
import { useVoicePreview } from '@/hooks/useVoicePreview';
import { SupportedLanguage } from '@/config/tts';

export interface Voice {
  id: string;
  displayName: string;
  accent: string;
  gender: string;
  language?: string;
  recommended?: boolean;
  previewUrl?: string;
}

interface VoicePickerProps {
  voices: Voice[];
  selectedVoiceId: string;
  selectedLanguage?: SupportedLanguage;
  onSelectVoice: (voiceId: string) => void;
  disabled?: boolean;
}

export function VoicePicker({ voices, selectedVoiceId, selectedLanguage = 'en-US', onSelectVoice, disabled }: VoicePickerProps) {
  const { activePreviewId, previewStatus, playPreview, stopPreview } = useVoicePreview();

  // Stop preview when language changes
  React.useEffect(() => {
    stopPreview();
  }, [selectedLanguage, stopPreview]);

  const availableVoices = voices.filter(
    (voice) => voice.language === selectedLanguage || (!voice.language && selectedLanguage === 'en-US')
  );

  const selectedVoice = availableVoices.find((v) => v.id === selectedVoiceId) || availableVoices[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectVoice(e.target.value);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedVoice) {
      playPreview(selectedVoice.id, selectedVoice);
    }
  };

  const isPreviewing = activePreviewId === selectedVoice?.id;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="tts-voice-select"
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
      >
        Voice
      </label>
      <div className="flex items-stretch gap-2">
        <select
          id="tts-voice-select"
          value={selectedVoiceId}
          onChange={handleChange}
          disabled={disabled || availableVoices.length === 0}
          className="min-h-11 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {availableVoices.length === 0 ? (
            <option value="">No voices available for this language</option>
          ) : (
            availableVoices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.displayName} — {voice.accent}
                {voice.recommended ? ' (Recommended)' : ''}
              </option>
            ))
          )}
        </select>

        <button
          type="button"
          onClick={handlePreviewClick}
          disabled={disabled || !selectedVoice || availableVoices.length === 0}
          className="shrink-0 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isPreviewing && previewStatus === 'playing' ? `Pause ${selectedVoice?.displayName}` : `Listen to ${selectedVoice?.displayName || 'voice'}`}
        >
          {isPreviewing && previewStatus === 'loading' ? (
            <span className="text-xs">Loading</span>
          ) : isPreviewing && previewStatus === 'playing' ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span className="text-xs">Pause</span>
            </>
          ) : isPreviewing && previewStatus === 'error' ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs text-destructive">Error</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span className="text-xs">Listen</span>
            </>
          )}
        </button>
      </div>

      {isPreviewing && previewStatus === 'error' && (
        <p className="text-[10px] text-muted-foreground -mt-1">
          Preview unavailable. You can still generate speech with this voice.
        </p>
      )}
    </div>
  );
}