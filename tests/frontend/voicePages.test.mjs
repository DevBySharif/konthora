import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAllVoices,
  getVoiceBySlug,
  getVoiceBySlugOrId,
  getVoiceIdFromSlug,
  getVoiceSlugFromId,
  getVoiceUrl,
  getRelatedVoices,
  getLanguageVoicePages,
  getLanguagePage,
} from '../../src/config/voices.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Per-voice landing pages (feature #3): the catalogue behind
 * /voices/[voiceId] must cover all 129 voices the live API exposes
 * (41 Kokoro + 88 Edge, verified against GET /api/v1/tts/voices
 * 2026-11-15). Slugs, titles, descriptions, related links, and the
 * sitemap all derive from this one list, so the tests below pin it.
 */

test('getAllVoices returns 129 voices: 41 Kokoro + 88 Edge', () => {
  const all = getAllVoices();
  assert.equal(all.length, 129, `expected 129 voices, got ${all.length}`);
  const edge = all.filter((v) => v.engine === 'edge');
  assert.equal(edge.length, 88, `expected 88 Edge voices, got ${edge.length}`);
  const kokoro = all.filter((v) => v.engine !== 'edge');
  assert.equal(kokoro.length, 41, `expected 41 Kokoro voices, got ${kokoro.length}`);
});

test('every voice has a unique id and a unique URL-safe slug', () => {
  const all = getAllVoices();
  const ids = new Set(all.map((v) => v.id));
  const slugs = new Set(all.map((v) => v.slug));
  assert.equal(ids.size, all.length, 'duplicate voice id in catalogue');
  assert.equal(slugs.size, all.length, 'duplicate voice slug in catalogue');
  for (const v of all) {
    assert.match(v.slug, /^[a-z0-9-]+$/, `${v.id} slug is not URL-safe: ${v.slug}`);
  }
});

test('Edge slugs are the lowercased voice id; Kokoro slugs are unchanged', () => {
  const all = getAllVoices();
  for (const v of all.filter((v) => v.engine === 'edge')) {
    assert.equal(v.slug, v.id.toLowerCase(), `Edge slug for ${v.id}`);
    assert.equal(getVoiceSlugFromId(v.id), v.id.toLowerCase());
  }
  // Spot-check the long-standing Kokoro slugs byte-for-byte.
  assert.equal(getVoiceBySlug('af-heart')?.id, 'af_heart');
  assert.equal(getVoiceBySlug('bf-emma')?.id, 'bf_emma');
  assert.equal(getVoiceBySlug('hm-omega')?.id, 'hm_omega');
  assert.equal(getVoiceBySlug('pm-santa')?.id, 'pm_santa');
});

test('Edge slugs resolve back to the mixed-case voice id', () => {
  assert.equal(getVoiceBySlug('bn-bd-nabanitaneural')?.id, 'bn-BD-NabanitaNeural');
  assert.equal(getVoiceBySlug('es-do-ramonaneural')?.id, 'es-DO-RamonaNeural');
  assert.equal(getVoiceIdFromSlug('bn-bd-nabanitaneural'), 'bn-BD-NabanitaNeural');
  assert.equal(getVoiceIdFromSlug('af-heart'), 'af_heart');
  assert.equal(getVoiceBySlugOrId('bn-BD-NabanitaNeural')?.slug, 'bn-bd-nabanitaneural');
  assert.equal(getVoiceBySlug('no-such-voice'), undefined);
});

test('per-language counts match the live API catalogue', () => {
  const expected = {
    'en-US': 37,
    'en-GB': 8,
    es: 48,
    'fr-FR': 14,
    'hi-IN': 6,
    it: 6,
    'pt-BR': 6,
    'bn-BD': 4,
  };
  for (const [language, count] of Object.entries(expected)) {
    assert.equal(
      getLanguageVoicePages(language).length,
      count,
      `${language} should have ${count} voices`
    );
  }
});

test('every title fits 65 chars and every description fits 155 chars', () => {
  for (const v of getAllVoices()) {
    assert.ok(v.title.length <= 65, `${v.id} title is ${v.title.length} chars: ${v.title}`);
    assert.ok(
      v.description.length <= 155,
      `${v.id} description is ${v.description.length} chars: ${v.description}`
    );
  }
});

test('Edge voices carry engine=edge, 1.0× default speed and the 0.75–1.25 range', () => {
  for (const v of getAllVoices().filter((v) => v.engine === 'edge')) {
    assert.equal(v.defaultSpeed, 1.0, `${v.id} defaultSpeed`);
    assert.equal(v.minimumSpeed, 0.75, `${v.id} minimumSpeed`);
    assert.equal(v.maximumSpeed, 1.25, `${v.id} maximumSpeed`);
  }
});

test('recommended flags match the live list (8 Edge voices recommended)', () => {
  const recommendedEdge = getAllVoices()
    .filter((v) => v.engine === 'edge' && v.recommended)
    .map((v) => v.id)
    .sort();
  assert.deepEqual(recommendedEdge, [
    'bn-BD-NabanitaNeural',
    'bn-BD-PradeepNeural',
    'bn-IN-BashkarNeural',
    'bn-IN-TanishaaNeural',
    'en-US-AndrewNeural',
    'en-US-AriaNeural',
    'hi-IN-MadhurNeural',
    'hi-IN-SwaraNeural',
  ]);
});

test('related voices are real catalogue entries in the same language (up to 3)', () => {
  for (const v of getAllVoices()) {
    const related = getRelatedVoices(v);
    assert.equal(
      related.length,
      v.related.length,
      `${v.id} has unresolvable related ids: ${v.related.join(', ')}`
    );
    assert.ok(related.length <= 3, `${v.id} has more than 3 related voices`);
    for (const rel of related) {
      assert.equal(rel.language, v.language, `${v.id} related ${rel.id} is another language`);
    }
  }
});

test('Bengali voices point at the Bengali language page', () => {
  assert.equal(getLanguagePage('bn-BD'), '/text-to-speech/bengali');
  assert.equal(
    getVoiceBySlug('bn-bd-nabanitaneural')?.language,
    'bn-BD'
  );
});

test('generateStaticParams covers 129 slugs and the sitemap derives from getAllVoices', () => {
  const slugs = getAllVoices().map((v) => v.slug);
  assert.equal(new Set(slugs).size, 129);
  // The [voiceId] page's generateStaticParams is getAllVoices().map(slug);
  // the sitemap must stay wired to the same list, or new voices go missing.
  const sitemap = fs.readFileSync(path.join(rootDir, 'src/app/sitemap.ts'), 'utf8');
  assert.ok(
    sitemap.includes('getAllVoices().map((voice) => getVoiceUrl(voice.slug))'),
    'sitemap.ts must build its voice routes from getAllVoices()'
  );
  // Spot-check the voice URLs the sitemap will emit.
  assert.equal(getVoiceUrl('bn-bd-nabanitaneural'), '/voices/bn-bd-nabanitaneural');
  assert.equal(getVoiceUrl('af-heart'), '/voices/af-heart');
});

test('voice page links the studio with ?voice= and renders a Listen preview', () => {
  const page = fs.readFileSync(
    path.join(rootDir, 'src/app/voices/[voiceId]/page.tsx'),
    'utf8'
  );
  assert.ok(
    page.includes('?voice=${encodeURIComponent(voice.id)}'),
    'voice page must link the studio with ?voice=<voice id>'
  );
  assert.ok(page.includes('Open this voice in the TTS Studio'), 'studio link text missing');
  assert.ok(page.includes('VoicePagePreview'), 'voice page must render the preview button');
  const preview = fs.readFileSync(
    path.join(rootDir, 'src/components/tools/VoicePagePreview.tsx'),
    'utf8'
  );
  assert.ok(
    preview.includes('/tts/preview/'),
    'Edge previews must use the API preview endpoint'
  );
});
