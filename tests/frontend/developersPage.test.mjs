import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const pagePath = path.join(rootDir, 'src/app/developers/page.tsx');
const content = fs.readFileSync(pagePath, 'utf8');

test('Developers page exists with accurate metadata for /developers', () => {
  assert.ok(fs.existsSync(pagePath), 'src/app/developers/page.tsx must exist');

  const pathMatch = content.match(/path:\s*['"]([^'"]*)['"]/);
  assert.ok(pathMatch, 'Developers page must specify path in constructMetadata');
  assert.equal(pathMatch[1], '/developers', 'Developers page canonical path must be /developers');

  const titleMatch = content.match(/title:\s*`([^`]*)`/);
  assert.ok(titleMatch, 'Developers page must set a title');
  assert.match(titleMatch[1], /Konthora API/, 'Developers page title must name the Konthora API');
  assert.ok(
    titleMatch[1].length <= 65,
    `Developers page title must stay within the 65-char SERP budget (got ${titleMatch[1].length})`
  );

  const descMatch = content.match(/description:\s*\n?\s*'([^']*)'/);
  assert.ok(descMatch, 'Developers page must set a description');
  assert.ok(
    descMatch[1].length <= 155,
    `Developers page description must stay within the 155-char SERP budget (got ${descMatch[1].length})`
  );
});

test('Developers page declares BreadcrumbList schema like other static pages', () => {
  assert.ok(
    content.includes("'@type': 'BreadcrumbList'"),
    'Developers page must declare BreadcrumbList schema'
  );
  assert.ok(
    content.includes('breadcrumbSchema'),
    'Developers page must render breadcrumb schema in JsonLd component'
  );
});

test('Developers page documents the real API surface', () => {
  assert.ok(
    content.includes('https://devsharif-konthora-api.hf.space/api/v1'),
    'Developers page must point at the production API host'
  );

  // Every route the backend actually serves, and no invented ones.
  for (const endpoint of [
    '/tts/voices',
    '/tts/jobs',
    '/tts/jobs/{jobId}',
    '/tts/jobs/{jobId}/audio',
    '/tts/preview/{voice_id}',
    '/transcription/capabilities',
    '/transcription/jobs',
    '/transcription/jobs/{jobId}',
    '/transcription/jobs/{jobId}/transcript',
    '/transcription/jobs/{jobId}/result',
  ]) {
    assert.ok(content.includes(endpoint), `Developers page must document ${endpoint}`);
  }

  // Rate limits as enforced in backend/app/core/config.py — do not drift.
  assert.ok(content.includes('30 job creations'), 'Developers page must state the 30/hr TTS limit');
  assert.ok(content.includes('15 job creations'), 'Developers page must state the 15/hr transcription limit');
  assert.ok(content.includes('120 previews'), 'Developers page must state the 120/hr preview bucket');
  assert.ok(content.includes('60 minutes'), 'Developers page must state the 60-minute retention');
});

test('Developers page copy is English only', () => {
  // The site's developer copy is English; Bangla script must not slip in.
  assert.ok(!/[\u0980-\u09FF]/u.test(content), 'Developers page must contain no Bangla characters');
});
