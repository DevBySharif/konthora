import type { SupportedLanguage } from '../config/tts';

/**
 * Pure helpers for the searchable voice picker (VoicePicker.tsx).
 *
 * Kept free of component code and `@/` imports so the node:test suite can
 * import this module directly, the same way it imports ttsPreferences.ts.
 * The component owns rendering, preview playback and the language labels;
 * this module owns filtering, ordering and grouping.
 */

export interface VoiceListEntry {
  id: string;
  displayName: string;
  accent: string;
  language?: string;
  recommended?: boolean;
  engine?: string;
}

export type VoiceEngine = 'edge' | 'kokoro';

export interface VoiceEngineGroup<T extends VoiceListEntry> {
  engine: VoiceEngine;
  /** Header label, e.g. "Edge" / "Kokoro" — the component appends the count. */
  label: string;
  voices: T[];
}

/**
 * Voices available for a language. A voice without a language belongs to
 * en-US (the legacy Kokoro catalogue predates per-language tagging).
 */
export function filterVoicesForLanguage<T extends VoiceListEntry>(
  voices: readonly T[],
  language: SupportedLanguage,
): T[] {
  return voices.filter(
    (voice) => voice.language === language || (!voice.language && language === 'en-US'),
  );
}

/**
 * Edge voices first (the newest catalogue, and the recommended default for
 * Bengali); Kokoro voices follow. Stable sort, so the order inside each
 * engine group is unchanged.
 */
export function sortVoicesByEngine<T extends VoiceListEntry>(voices: readonly T[]): T[] {
  return [...voices].sort((a, b) => (a.engine === 'edge' ? 0 : 1) - (b.engine === 'edge' ? 0 : 1));
}

/**
 * Case-insensitive substring match across display name, accent, language
 * code (e.g. "bn-BD") and — when provided — the human language label
 * (e.g. "Bengali"), so typing a language name finds its voices too.
 * A blank query matches everything.
 */
export function searchVoices<T extends VoiceListEntry>(
  voices: readonly T[],
  query: string,
  languageLabels: Record<string, string> = {},
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [...voices];
  }
  return voices.filter((voice) => {
    const haystack = [
      voice.displayName,
      voice.accent,
      voice.language ?? '',
      voice.language ? (languageLabels[voice.language] ?? '') : '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

/**
 * Split an already language-filtered, engine-sorted list into its engine
 * groups, Edge first. Empty groups are omitted, so a language with only
 * Kokoro voices renders a single group.
 */
export function groupVoicesByEngine<T extends VoiceListEntry>(
  voices: readonly T[],
): Array<VoiceEngineGroup<T>> {
  const groups: Array<VoiceEngineGroup<T>> = [
    { engine: 'edge', label: 'Edge', voices: [] },
    { engine: 'kokoro', label: 'Kokoro', voices: [] },
  ];
  for (const voice of voices) {
    const group = voice.engine === 'edge' ? groups[0] : groups[1];
    group.voices.push(voice);
  }
  return groups.filter((group) => group.voices.length > 0);
}
