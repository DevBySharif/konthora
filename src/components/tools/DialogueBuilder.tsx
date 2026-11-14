'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { VoicePicker, type Voice } from './VoicePicker';
import type { SupportedLanguage } from '@/config/tts';

export interface DialogueSegmentDraft {
  key: string;
  text: string;
  /** '' = use the studio's selected voice for this turn. */
  voiceId: string;
}

export const DIALOGUE_MIN_SEGMENTS = 2;
export const DIALOGUE_MAX_SEGMENTS = 8;
export const DIALOGUE_MAX_CHARS = 2000;

export function newDialogueSegment(): DialogueSegmentDraft {
  return {
    key: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: '',
    voiceId: '',
  };
}

export function dialogueTotalChars(segments: DialogueSegmentDraft[]): number {
  return segments.reduce((total, segment) => total + segment.text.length, 0);
}

interface DialogueBuilderProps {
  segments: DialogueSegmentDraft[];
  onSegmentsChange: (segments: DialogueSegmentDraft[]) => void;
  /** Voices with previewUrl already attached (same list as the studio picker). */
  voices: Voice[];
  selectedLanguage: SupportedLanguage;
  /** The studio's selected voice — used for any turn without its own voice. */
  defaultVoiceId: string;
  disabled: boolean;
}

/**
 * Multi-voice dialogue builder (Feature 7): one script split into turns,
 * each turn with its own text and its own voice. The backend synthesizes
 * every turn and concatenates them into ONE audio file, so the turns below
 * are the whole dialogue — nothing plays per-turn in the studio.
 */
export function DialogueBuilder({
  segments,
  onSegmentsChange,
  voices,
  selectedLanguage,
  defaultVoiceId,
  disabled,
}: DialogueBuilderProps) {
  const totalChars = dialogueTotalChars(segments);
  const overLimit = totalChars > DIALOGUE_MAX_CHARS;

  const updateSegment = (key: string, patch: Partial<DialogueSegmentDraft>) => {
    onSegmentsChange(
      segments.map((segment) => (segment.key === key ? { ...segment, ...patch } : segment)),
    );
  };

  const addSegment = () => {
    if (segments.length >= DIALOGUE_MAX_SEGMENTS) return;
    onSegmentsChange([...segments, newDialogueSegment()]);
  };

  const removeSegment = (key: string) => {
    if (segments.length <= DIALOGUE_MIN_SEGMENTS) return;
    onSegmentsChange(segments.filter((segment) => segment.key !== key));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Split your script into turns and pick a voice for each turn — interview or
        podcast style. The turns are joined into one audio file, with a short
        pause between speakers. The whole dialogue counts once against your
        hourly limit, and the total text shares the 2,000 character cap.
      </p>

      {segments.map((segment, index) => (
        <div
          key={segment.key}
          className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">
              Turn {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeSegment(segment.key)}
              disabled={disabled || segments.length <= DIALOGUE_MIN_SEGMENTS}
              aria-label={`Remove turn ${index + 1}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <textarea
            value={segment.text}
            onChange={(event) => updateSegment(segment.key, { text: event.target.value })}
            disabled={disabled}
            rows={3}
            placeholder="What does this speaker say?"
            aria-label={`Turn ${index + 1} text`}
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />

          <VoicePicker
            voices={voices}
            selectedVoiceId={segment.voiceId || defaultVoiceId}
            selectedLanguage={selectedLanguage}
            onSelectVoice={(voiceId) => updateSegment(segment.key, { voiceId })}
            disabled={disabled}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addSegment}
          disabled={disabled || segments.length >= DIALOGUE_MAX_SEGMENTS}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add turn
        </button>

        <span
          className={`text-sm font-mono ${
            overLimit ? 'text-destructive font-semibold' : 'text-muted-foreground'
          }`}
          role={overLimit ? 'alert' : undefined}
        >
          {totalChars.toLocaleString()} / {DIALOGUE_MAX_CHARS.toLocaleString()} characters total
          {overLimit ? ' — over the limit, shorten a turn' : ''}
        </span>
      </div>
    </div>
  );
}
