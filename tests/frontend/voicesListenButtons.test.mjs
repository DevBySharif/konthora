import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');

test('VoiceCardPreview is a client island using useVoicePreview with Listen/Pause states', () => {
  const src = read('src/components/tools/VoiceCardPreview.tsx');

  assert.ok(src.startsWith("'use client';"), 'component must be a client component');
  assert.match(src, /useVoicePreview/, 'must use the shared useVoicePreview hook');
  assert.match(src, /previewUrl/, 'must accept a previewUrl prop (static MP3 or API endpoint)');
  assert.match(src, /Listen/, 'must render a Listen label');
  assert.match(src, /Pause/, 'must render a Pause label for the playing state');
  assert.match(src, /stopPropagation/, 'click must not bubble to the card link');
  assert.match(src, /playPreview\(voiceId/, 'must play the preview for its own voiceId');
  assert.match(src, /aria-label/, 'button must expose an accessible label');
});

test('/voices page renders a VoiceCardPreview on every individual voice card', () => {
  const src = read('src/app/voices/page.tsx');

  assert.match(src, /import \{ VoiceCardPreview \}/, 'page must import VoiceCardPreview');
  const usages = src.match(/<VoiceCardPreview/g) || [];
  // American grid + British grid + multilingual grid + 7 language-group cards.
  assert.ok(usages.length >= 4,
    `expected VoiceCardPreview in all four card areas, found ${usages.length} usages`);

  // Kokoro cards preview via the static MP3 helper; the button is a sibling
  // of the card link, never nested inside it.
  assert.match(src, /getVoicePreviewSource\(voice\.id\)/, 'Kokoro cards must use the static preview source');
  assert.doesNotMatch(src, /<Link[^>]*>\s*<VoiceCardPreview/, 'preview button must not be nested inside a Link');
});

test('/voices page shows one unified total per language with the engine split', () => {
  const src = read('src/app/voices/page.tsx');

  // English: one total, split as subtitle.
  assert.match(src, /45 English voices/, 'English section must read 45 voices');
  assert.match(src, /28 Kokoro · 17 Edge/, 'English split must be 28 Kokoro · 17 Edge');

  // Other languages, totals from the page FAQ (129 total).
  assert.match(src, /Spanish 48 \(3 Kokoro · 45 Edge\)/, 'Spanish total must be 48');
  assert.match(src, /French 14 \(1 Kokoro · 13 Edge\)/, 'French total must be 14');
  assert.match(src, /Hindi 6 \(4 Kokoro · 2 Edge\)/, 'Hindi total must be 6');
  assert.match(src, /Italian 6 \(2 Kokoro · 4 Edge\)/, 'Italian total must be 6');
  assert.match(src, /Portuguese 6 \(3 Kokoro · 3 Edge\)/, 'Portuguese total must be 6');
  assert.match(src, /Bengali 4 \(0 Kokoro · 4 Edge\)/, 'Bengali total must be 4');

  // The old split presentation must be gone.
  assert.doesNotMatch(src, /28 English voices/, 'must not say 28 English voices any more');
  assert.doesNotMatch(src, /· 17 Edge voices/, 'must not show a separate Edge-only English card');
  assert.doesNotMatch(src, /Edge Voices<\/h2>/, 'Edge section must not keep the old heading');
});

test('language-group cards preview a real Edge voice via the preview endpoint', () => {
  const src = read('src/app/voices/page.tsx');

  assert.match(src, /\/tts\/preview\//, 'group previews must hit the preview endpoint');
  assert.match(src, /API_BASE_URL/, 'preview URL must be built from the shared API base');

  // Representative Edge voiceIds, verified present in GET /api/v1/tts/voices
  // on 2026-11-15. Giuseppe and Thalita are the *MultilingualNeural
  // variants — the plain *Neural names do not exist.
  const representatives = [
    'en-US-AndrewNeural',
    'es-ES-AlvaroNeural',
    'fr-FR-DeniseNeural',
    'hi-IN-MadhurNeural',
    'it-IT-GiuseppeMultilingualNeural',
    'pt-BR-ThalitaMultilingualNeural',
    'bn-BD-NabanitaNeural',
  ];
  for (const id of representatives) {
    assert.ok(src.includes(id), `representative Edge voice ${id} must be present`);
  }
  assert.doesNotMatch(src, /it-IT-GiuseppeNeural'/, 'plain it-IT-GiuseppeNeural must not be used');
  assert.doesNotMatch(src, /pt-BR-ThalitaNeural'/, 'plain pt-BR-ThalitaNeural must not be used');
});

test('footer ALL AI VOICES chips render every voice getAllVoices() returns, uncapped', () => {
  const src = read('src/components/layout/Footer.tsx');

  assert.match(src, /getAllVoices\(\)/, 'footer must source chips from getAllVoices()');
  assert.match(src, /allVoices\.map\(/, 'footer must map over the full catalogue');
  assert.doesNotMatch(src, /\.slice\(/, 'footer must not cap the voice chips');
  assert.doesNotMatch(src, /allVoices\.filter\(/, 'footer must not filter the voice chips down');
});
