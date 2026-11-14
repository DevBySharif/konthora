/**
 * Shared voice-favorites store.
 *
 * Favorites are plain voice ids persisted in localStorage (unlike job
 * tokens, which stay in sessionStorage): they are not secrets, and the
 * whole point is that they survive across sessions. The voice picker
 * (VoicePicker.tsx) and the /voices page cards (VoiceFavoriteButton.tsx)
 * share this one key, so a star toggled in either place updates the
 * other.
 *
 * Kept free of component code and `@/` imports so the node:test suite can
 * import this module directly, the same way it imports voicePicker.ts.
 * Components subscribe with React's useSyncExternalStore using
 * subscribeToFavoriteChanges / getFavoritesSnapshot below.
 *
 * Storage access goes through `globalThis.localStorage` (guarded): on the
 * server it is absent and every read returns [], and in the node tests it
 * can be stubbed. Every read/write is wrapped in try/catch because
 * storage can be unavailable (private mode, quota, disabled cookies).
 */

export const VOICE_FAVORITES_STORAGE_KEY = 'konthora:voice-favorites:v1';

/** Dispatched on globalThis after a successful write, for same-tab sync. */
export const VOICE_FAVORITES_CHANGED_EVENT = 'konthora:voice-favorites:changed';

function getStorage(): Storage | null {
  try {
    const storage = (globalThis as { localStorage?: unknown }).localStorage;
    if (
      storage &&
      typeof (storage as Storage).getItem === 'function' &&
      typeof (storage as Storage).setItem === 'function'
    ) {
      return storage as Storage;
    }
    return null;
  } catch {
    return null;
  }
}

function readRaw(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(VOICE_FAVORITES_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Parse a stored value into a clean id list: only non-empty strings,
 * deduplicated, order preserved. Anything else (corrupt JSON, a
 * non-array, non-string entries) yields [] rather than throwing.
 */
export function parseVoiceFavorites(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const favorites: string[] = [];
    for (const entry of parsed) {
      if (typeof entry === 'string' && entry.trim() && !seen.has(entry)) {
        seen.add(entry);
        favorites.push(entry);
      }
    }
    return favorites;
  } catch {
    return [];
  }
}

/** Current favorites, in the order they were added. Never throws. */
export function loadFavorites(): string[] {
  return parseVoiceFavorites(readRaw());
}

/** Whether a voice id is currently favorited. Never throws. */
export function isFavorite(voiceId: string): boolean {
  return loadFavorites().includes(voiceId);
}

function notifyFavoritesChanged(): void {
  // Same-tab sync: a custom event on window (in non-DOM runtimes there is
  // no window, so there is nothing to notify — the stored value is still
  // correct and listeners re-read on their next render).
  const target = getEventTarget();
  if (!target) return;
  try {
    target.dispatchEvent(new CustomEvent(VOICE_FAVORITES_CHANGED_EVENT));
  } catch {
    // No CustomEvent support — see above.
  }
}

/**
 * Toggle a voice id in the favorites list and persist the result.
 * Returns the new list. If storage is unavailable the list is left
 * unchanged and the previous list is returned. Favoriting never changes
 * the selected voice — callers only call this from the star button.
 */
export function toggleFavorite(voiceId: string): string[] {
  const current = loadFavorites();
  const next = current.includes(voiceId)
    ? current.filter((id) => id !== voiceId)
    : [...current, voiceId];
  const storage = getStorage();
  if (!storage) return current;
  try {
    storage.setItem(VOICE_FAVORITES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return current;
  }
  notifyFavoritesChanged();
  return next;
}

/**
 * Snapshot getter for useSyncExternalStore. Returns the same array
 * reference while the stored raw value is unchanged (required by
 * useSyncExternalStore), and a fresh parsed array when it changes.
 */
let snapshotCache: { raw: string | null; favorites: string[] } | null = null;

export function getFavoritesSnapshot(): string[] {
  const raw = readRaw();
  if (snapshotCache && snapshotCache.raw === raw) {
    return snapshotCache.favorites;
  }
  const favorites = parseVoiceFavorites(raw);
  snapshotCache = { raw, favorites };
  return favorites;
}

/** Server snapshot for useSyncExternalStore: no favorites before hydration. */
export function getServerFavoritesSnapshot(): string[] {
  return [];
}

function isRelevantStorageEvent(event: Event): boolean {
  // A storage event with no key means storage was cleared; a key that is
  // not ours belongs to another feature. (A plain Event has no key and
  // counts as relevant, which also keeps this testable in node.)
  const key = (event as StorageEvent).key;
  return key === null || key === undefined || key === VOICE_FAVORITES_STORAGE_KEY;
}

/**
 * The event target for change notifications: window in browsers (where
 * real storage events fire), absent on the server and in plain node.
 */
function getEventTarget(): EventTarget | null {
  try {
    const target = (globalThis as { window?: unknown }).window;
    if (
      target &&
      typeof (target as EventTarget).addEventListener === 'function' &&
      typeof (target as EventTarget).removeEventListener === 'function' &&
      typeof (target as EventTarget).dispatchEvent === 'function'
    ) {
      return target as EventTarget;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to favorite changes: the custom event fired by toggleFavorite
 * (same tab) and the storage event (other tabs). Returns an unsubscribe
 * function. Safe to call where there is no event target.
 */
export function subscribeToFavoriteChanges(listener: () => void): () => void {
  const target = getEventTarget();
  if (!target) return () => {};
  const onChanged = () => listener();
  const onStorage = (event: Event) => {
    if (isRelevantStorageEvent(event)) listener();
  };
  target.addEventListener(VOICE_FAVORITES_CHANGED_EVENT, onChanged);
  target.addEventListener('storage', onStorage);
  return () => {
    target.removeEventListener(VOICE_FAVORITES_CHANGED_EVENT, onChanged);
    target.removeEventListener('storage', onStorage);
  };
}
