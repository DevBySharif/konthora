import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');

// In-memory localStorage stub. Node has no localStorage, and the store
// reads it through globalThis, so stubbing here exercises the real
// persistence path (including the JSON round-trip) without a browser.
function createStorageStub(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (index) => [...store.keys()][index] ?? null,
  };
}

const storageStub = createStorageStub();
globalThis.localStorage = storageStub;

// Node's globalThis is not an EventTarget, but a browser window is —
// stub window as one so the store's custom/storage event sync can be
// exercised the same way it runs in the browser.
globalThis.window = new EventTarget();

const KEY = 'konthora:voice-favorites:v1';

const {
  VOICE_FAVORITES_STORAGE_KEY,
  loadFavorites,
  toggleFavorite,
  isFavorite,
  parseVoiceFavorites,
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  subscribeToFavoriteChanges,
} = await import('../../src/lib/voiceFavorites.ts');

function resetStorage() {
  storageStub.clear();
}

test('store uses the konthora favorites key', () => {
  assert.equal(VOICE_FAVORITES_STORAGE_KEY, KEY);
});

test('loadFavorites returns [] when nothing is stored', () => {
  resetStorage();
  assert.deepEqual(loadFavorites(), []);
});

test('toggleFavorite adds a voice, persists it, and isFavorite reflects it', () => {
  resetStorage();
  assert.deepEqual(toggleFavorite('af_heart'), ['af_heart']);
  assert.deepEqual(loadFavorites(), ['af_heart']);
  assert.equal(isFavorite('af_heart'), true);
  assert.equal(isFavorite('bf_emma'), false);
  // The stored value is a JSON array under the shared key.
  assert.equal(storageStub.getItem(KEY), JSON.stringify(['af_heart']));
});

test('toggleFavorite removes an already-favorited voice and keeps the rest in order', () => {
  resetStorage();
  toggleFavorite('af_heart');
  toggleFavorite('bn-BD-NabanitaNeural');
  toggleFavorite('en-US-AndrewNeural');
  assert.deepEqual(toggleFavorite('bn-BD-NabanitaNeural'), [
    'af_heart',
    'en-US-AndrewNeural',
  ]);
  assert.deepEqual(loadFavorites(), ['af_heart', 'en-US-AndrewNeural']);
  // Re-adding appends at the end, never duplicates.
  toggleFavorite('bn-BD-NabanitaNeural');
  assert.deepEqual(loadFavorites(), [
    'af_heart',
    'en-US-AndrewNeural',
    'bn-BD-NabanitaNeural',
  ]);
});

test('parseVoiceFavorites tolerates corrupt or malformed stored values', () => {
  assert.deepEqual(parseVoiceFavorites(null), []);
  assert.deepEqual(parseVoiceFavorites(''), []);
  assert.deepEqual(parseVoiceFavorites('not-json{{'), []);
  assert.deepEqual(parseVoiceFavorites('{"a":1}'), []);
  assert.deepEqual(parseVoiceFavorites('42'), []);
  // Non-string and empty entries are dropped, duplicates are collapsed,
  // order is preserved.
  assert.deepEqual(
    parseVoiceFavorites(JSON.stringify(['af_heart', 7, null, '', '  ', 'af_heart', 'bf_emma'])),
    ['af_heart', 'bf_emma'],
  );
});

test('loadFavorites returns [] instead of throwing when storage is unavailable', () => {
  const original = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('denied');
    },
  };
  try {
    assert.deepEqual(loadFavorites(), []);
    assert.equal(isFavorite('af_heart'), false);
    // A failed write leaves the (empty) list unchanged and does not throw.
    assert.deepEqual(toggleFavorite('af_heart'), []);
  } finally {
    globalThis.localStorage = original;
  }
});

test('loadFavorites returns [] when localStorage itself is absent (SSR)', () => {
  const original = globalThis.localStorage;
  delete globalThis.localStorage;
  try {
    assert.deepEqual(loadFavorites(), []);
    assert.deepEqual(toggleFavorite('af_heart'), []);
  } finally {
    globalThis.localStorage = original;
  }
});

test('getFavoritesSnapshot is referentially stable while storage is unchanged', () => {
  resetStorage();
  toggleFavorite('af_heart');
  const first = getFavoritesSnapshot();
  const second = getFavoritesSnapshot();
  assert.equal(first, second);
  assert.deepEqual(first, ['af_heart']);

  toggleFavorite('bf_emma');
  const third = getFavoritesSnapshot();
  assert.notEqual(third, first);
  assert.deepEqual(third, ['af_heart', 'bf_emma']);

  // Server snapshot is always empty (no favorites before hydration).
  assert.deepEqual(getServerFavoritesSnapshot(), []);
});

test('subscribers are notified when a favorite is toggled in the same tab', () => {
  resetStorage();
  let calls = 0;
  const unsubscribe = subscribeToFavoriteChanges(() => {
    calls += 1;
  });
  try {
    toggleFavorite('af_heart');
    assert.equal(calls, 1);
    toggleFavorite('af_heart');
    assert.equal(calls, 2);
  } finally {
    unsubscribe();
  }
  toggleFavorite('af_heart');
  assert.equal(calls, 2, 'unsubscribed listener must not fire again');
});

test('subscribers are notified by storage events for this key only', () => {
  resetStorage();
  let calls = 0;
  const unsubscribe = subscribeToFavoriteChanges(() => {
    calls += 1;
  });
  try {
    // A storage event naming another key must not notify; a key-less
    // event (storage cleared) is relevant and must notify.
    const otherKey = Object.assign(new Event('storage'), { key: 'konthora:other-key' });
    globalThis.window.dispatchEvent(otherKey);
    assert.equal(calls, 0, 'other keys must not notify');

    const ourKey = Object.assign(new Event('storage'), { key: KEY });
    globalThis.window.dispatchEvent(ourKey);
    assert.equal(calls, 1, 'our key must notify (cross-tab sync)');

    globalThis.window.dispatchEvent(new Event('storage'));
    assert.equal(calls, 2, 'key-less storage event (cleared) must notify');
  } finally {
    unsubscribe();
  }
  resetStorage();
});

/* ── Component wiring (source-level, same style as voicesListenButtons) ── */

test('VoicePicker has a star toggle per row and a pinned Favorites group', () => {
  const picker = read('src/components/tools/VoicePicker.tsx');

  assert.ok(picker.includes('Star'), 'picker must render a Star icon');
  assert.match(picker, /from '@\/lib\/voiceFavorites'/, 'picker must use the shared favorites store');
  assert.match(picker, /toggleFavorite\(voice\.id\)/, 'star must toggle that voice');
  assert.match(picker, /label: 'Favorites'/, 'picker must define a Favorites group');
  assert.match(
    picker,
    /Favorites.*voices: favoriteVoices/,
    'Favorites group must hold the favorited voices',
  );
  // The group is pinned above the engine groups and only renders non-empty.
  assert.match(picker, /\{ key: 'favorites'.*\}, \.\.\.engineGroups/s, 'Favorites must be first');
  assert.match(picker, /favoriteVoices\.length > 0/, 'Favorites group must render only when non-empty');
  // Accessible labels, and the star never selects or previews.
  assert.match(picker, /Add \$\{voice\.displayName\} to favorites/, 'star must label the add action');
  assert.match(picker, /Remove \$\{voice\.displayName\} from favorites/, 'star must label the remove action');
  assert.match(picker, /aria-pressed=\{isFavorited\}/, 'star must expose its pressed state');
  assert.ok(picker.includes('handleFavoriteClick'), 'star must have its own click handler');
  const handlerStart = picker.indexOf('const handleFavoriteClick');
  const handler = picker.slice(handlerStart, picker.indexOf('\n  };', handlerStart));
  assert.match(handler, /stopPropagation/, 'star click must not bubble to row selection');
  assert.doesNotMatch(handler, /onSelectVoice/, 'favoriting must not change the selected voice');
  assert.doesNotMatch(handler, /playPreview/, 'favoriting must not start a preview');
});

test('VoiceFavoriteButton is a client island sharing the favorites store', () => {
  const src = read('src/components/tools/VoiceFavoriteButton.tsx');

  assert.ok(src.startsWith("'use client';"), 'button must be a client component');
  assert.match(src, /useSyncExternalStore/, 'button must subscribe to the shared store');
  assert.match(src, /subscribeToFavoriteChanges/, 'button must subscribe to favorite changes');
  assert.match(src, /getFavoritesSnapshot/, 'button must read the shared snapshot');
  assert.match(src, /toggleFavorite\(voiceId\)/, 'button must toggle its own voiceId');
  assert.match(src, /Star/, 'button must render a Star icon');
  assert.match(src, /Add \$\{displayName\} to favorites/, 'button must label the add action');
  assert.match(src, /Remove \$\{displayName\} from favorites/, 'button must label the remove action');
  assert.match(src, /aria-pressed=\{isFavorited\}/, 'button must expose its pressed state');
  assert.match(src, /stopPropagation/, 'click must not bubble to the card link');
});

test('/voices page puts a favorite star on every individual voice card, not on language groups', () => {
  const src = read('src/app/voices/page.tsx');

  assert.match(src, /import \{ VoiceFavoriteButton \}/, 'page must import VoiceFavoriteButton');
  const usages = src.match(/<VoiceFavoriteButton/g) || [];
  // American grid + British grid + multilingual grid.
  assert.equal(usages.length, 3, `expected a star in all three individual-voice grids, found ${usages.length}`);
  assert.match(src, /<VoiceFavoriteButton voiceId=\{voice\.id\} displayName=\{voice\.name\} \/>/, 'English cards must star by voice id');
  assert.match(src, /<VoiceFavoriteButton voiceId=\{voice\.id\} displayName=\{voice\.shortName\} \/>/, 'multilingual cards must star by voice id');

  // The Edge language-GROUP cards are groups, not voices: no stars there.
  const languageGroupsSection = src.slice(src.indexOf('languageGroups.map'));
  assert.doesNotMatch(languageGroupsSection, /VoiceFavoriteButton/, 'language-group cards must not get stars');
});
