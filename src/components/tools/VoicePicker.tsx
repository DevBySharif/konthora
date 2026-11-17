'use client';

import React from 'react';
import { useSyncExternalStore } from 'react';
import { Play, Pause, AlertCircle, Check, Loader2, Search, X, Star } from 'lucide-react';
import { useVoicePreview } from '@/hooks/useVoicePreview';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/config/tts';
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  subscribeToFavoriteChanges,
  toggleFavorite,
} from '@/lib/voiceFavorites';
import {
  VoiceListEntry,
  filterVoicesForLanguage,
  groupVoicesByEngine,
  searchVoices,
  sortVoicesByEngine,
} from '@/lib/voicePicker';

// Human labels per language code, so a search for "Bengali" finds bn-BD
// voices even though the voice records only carry the code.
const LANGUAGE_LABELS: Record<string, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang.value, lang.label]),
);

export interface Voice extends VoiceListEntry {
  gender: string;
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
  // Favorites live in localStorage and are shared with the /voices page
  // cards; useSyncExternalStore keeps every visible star in sync when a
  // favorite is toggled anywhere (same tab via a custom event, other tabs
  // via the storage event).
  const favorites = useSyncExternalStore(
    subscribeToFavoriteChanges,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );
  const [query, setQuery] = React.useState('');
  const [prevLanguage, setPrevLanguage] = React.useState(selectedLanguage);
  // Reset the search when the language changes. This is the documented
  // render-phase adjustment pattern for resetting state when a prop changes
  // (an effect calling setQuery here trips the set-state-in-effect rule).
  if (prevLanguage !== selectedLanguage) {
    setPrevLanguage(selectedLanguage);
    setQuery('');
  }

  // Stop preview when the language changes.
  React.useEffect(() => {
    stopPreview();
  }, [selectedLanguage, stopPreview]);

  // Edge voices first in the picker (they are the newest catalogue and the
  // recommended default for Bengali); Kokoro voices follow. Stable sort, so
  // the order inside each engine group is unchanged. The default voice is
  // resolved upstream and is not affected by this display order.
  const availableVoices = React.useMemo(
    () => sortVoicesByEngine(filterVoicesForLanguage(voices, selectedLanguage)),
    [voices, selectedLanguage],
  );

  const filteredVoices = React.useMemo(
    () => searchVoices(availableVoices, query, LANGUAGE_LABELS),
    [availableVoices, query],
  );

  const groups = React.useMemo(() => groupVoicesByEngine(filteredVoices), [filteredVoices]);

  // Favorites group, pinned above the engine groups. It shows only the
  // favorited voices for the current language (and current search), and
  // only renders when it is non-empty. A favorited voice appears here in
  // addition to its engine group, never instead of it.
  const displayGroups = React.useMemo(() => {
    const engineGroups = groups.map((group) => ({
      key: group.engine,
      label: group.label,
      voices: group.voices,
    }));
    const favoriteVoices = filteredVoices.filter((voice) => favorites.includes(voice.id));
    return favoriteVoices.length > 0
      ? [{ key: 'favorites', label: 'Favorites', voices: favoriteVoices }, ...engineGroups]
      : engineGroups;
  }, [groups, filteredVoices, favorites]);

  const handleSelectVoice = (voiceId: string) => {
    if (!disabled) {
      onSelectVoice(voiceId);
    }
  };

  // Favoriting never changes the selected voice, and the star must not
  // trigger row selection or preview.
  const handleFavoriteClick = (e: React.MouseEvent, voice: Voice) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      toggleFavorite(voice.id);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent, voice: Voice) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      playPreview(voice.id, voice);
    }
  };

  const isListDisabled = disabled || availableVoices.length === 0;
  const activeErrorVoice = previewStatus === 'error'
    ? availableVoices.find((v) => v.id === activePreviewId)
    : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="tts-voice-search"
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
      >
        Voice
      </label>

      {/* Search — filters display name, accent and language (code or label). */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="tts-voice-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isListDisabled}
          placeholder="Search voices…"
          aria-label="Search voices"
          className="min-h-11 w-full rounded-lg border border-border bg-background pl-9 pr-9 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-not-allowed disabled:opacity-50"
        />
        {query && !isListDisabled && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Voice list, grouped by engine, Edge first. */}
      <div
        aria-label="Voices"
        className="max-h-72 overflow-y-auto rounded-lg border border-border bg-card"
      >
        {availableVoices.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No voices available for this language
          </p>
        ) : filteredVoices.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No voices match &ldquo;{query.trim()}&rdquo;
          </p>
        ) : (
          displayGroups.map((group) => (
            <div key={group.key} role="group" aria-label={`${group.label} · ${group.voices.length}`}>
              <div
                className="sticky top-0 z-10 border-b border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                aria-hidden="true"
              >
                {group.label} · {group.voices.length}
              </div>
              <ul>
                {group.voices.map((voice) => {
                  const isSelected = voice.id === selectedVoiceId;
                  const isPreviewing = activePreviewId === voice.id;
                  const isFavorited = favorites.includes(voice.id);
                  // The Listen button shows only when the voice has a preview:
                  // Kokoro voices use a static clip, Edge voices use the
                  // preview endpoint.
                  const hasPreview = Boolean(voice.previewUrl);
                  return (
                    <li key={voice.id}>
                      {/* Row: a flex row, not nested buttons — the select
                          button takes the text area and the preview and
                          favorite buttons sit beside it. */}
                      <div
                        className={`flex items-center gap-1 border-b border-border/60 last:border-b-0 ${
                          isSelected ? 'bg-accent/10' : 'hover:bg-secondary/40'
                        }`}
                      >
                        <button
                          type="button"
                          id={`tts-voice-${voice.id}`}
                          aria-pressed={isSelected}
                          onClick={() => handleSelectVoice(voice.id)}
                          disabled={disabled}
                          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:cursor-not-allowed"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'border-accent bg-accent text-accent-foreground'
                                : 'border-border text-transparent'
                            }`}
                            aria-hidden="true"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0">
                            <span className={`block truncate text-sm ${isSelected ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                              {voice.displayName}
                              {voice.recommended ? ' (Recommended)' : ''}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {voice.accent}
                            </span>
                          </span>
                        </button>

                        {hasPreview && (
                          <button
                            type="button"
                            onClick={(e) => handlePreviewClick(e, voice)}
                            disabled={disabled}
                            aria-label={
                              isPreviewing && previewStatus === 'playing'
                                ? `Pause ${voice.displayName}`
                                : `Listen to ${voice.displayName}`
                            }
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/30 text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPreviewing && previewStatus === 'loading' ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                            ) : isPreviewing && previewStatus === 'playing' ? (
                              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : isPreviewing && previewStatus === 'error' ? (
                              <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                            ) : (
                              <Play className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleFavoriteClick(e, voice)}
                          disabled={disabled}
                          aria-pressed={isFavorited}
                          aria-label={
                            isFavorited
                              ? `Remove ${voice.displayName} from favorites`
                              : `Add ${voice.displayName} to favorites`
                          }
                          className="mr-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Star
                            className={`h-4 w-4 ${isFavorited ? 'fill-amber-400 text-amber-400' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      {activeErrorVoice && (
        <p className="text-[10px] text-muted-foreground -mt-1">
          Preview unavailable for {activeErrorVoice.displayName}. You can still generate speech with this voice.
        </p>
      )}
    </div>
  );
}
