'use client';

import React from 'react';
import { useSyncExternalStore } from 'react';
import { Star } from 'lucide-react';
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  subscribeToFavoriteChanges,
  toggleFavorite,
} from '@/lib/voiceFavorites';

interface VoiceFavoriteButtonProps {
  voiceId: string;
  displayName: string;
}

/**
 * Star toggle for a single voice card on the /voices page.
 *
 * The page is a server component, so each card renders this client island
 * next to its Listen button. It shares the localStorage key with the voice
 * picker via useSyncExternalStore, so toggling a star here updates the
 * picker (and every other card) immediately, and vice versa.
 *
 * Rendered as a sibling of the card's <Link>, never nested inside it, and
 * it stops propagation so clicking the star never navigates to the voice
 * page.
 */
export function VoiceFavoriteButton({ voiceId, displayName }: VoiceFavoriteButtonProps) {
  const favorites = useSyncExternalStore(
    subscribeToFavoriteChanges,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );
  const isFavorited = favorites.includes(voiceId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(voiceId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorited}
      aria-label={
        isFavorited
          ? `Remove ${displayName} from favorites`
          : `Add ${displayName} to favorites`
      }
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
    >
      <Star
        className={`h-4 w-4 ${isFavorited ? 'fill-amber-400 text-amber-400' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
