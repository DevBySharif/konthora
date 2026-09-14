import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildIndexNowPayload,
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
  normalizeIndexNowUrl,
  normalizeIndexNowUrls,
  submitIndexNowUrls,
} from '../../scripts/submit-indexnow.mjs';

test('normalizes valid Konthora paths and canonical URLs', () => {
  assert.equal(normalizeIndexNowUrl('/audio-to-text'), 'https://konthora.dev.bd/audio-to-text');
  assert.equal(normalizeIndexNowUrl('https://konthora.dev.bd/about/'), 'https://konthora.dev.bd/about');
});

test('deduplicates multiple canonical URLs', () => {
  assert.deepEqual(normalizeIndexNowUrls(['/', '/about', 'https://konthora.dev.bd/about/']), [
    'https://konthora.dev.bd/',
    'https://konthora.dev.bd/about',
  ]);
});

test('rejects external, malformed, query, and fragment URLs', () => {
  assert.throws(() => normalizeIndexNowUrl('https://example.com/about'), /only https:\/\/konthora\.dev\.bd URLs/u);
  assert.throws(() => normalizeIndexNowUrl('https://api.konthora.dev.bd/api/v1/health'), /only https:\/\/konthora\.dev\.bd URLs/u);
  assert.throws(() => normalizeIndexNowUrl('/text-to-speech?voice=af_heart'), /query strings/u);
  assert.throws(() => normalizeIndexNowUrl('/about#team'), /query strings and fragments/u);
  assert.throws(() => normalizeIndexNowUrl('not a URL'), /malformed URL/u);
});

test('builds the documented batch payload and root key location', async () => {
  const payload = buildIndexNowPayload(['/audio-to-text', '/audio-to-text', '/about']);
  assert.equal(payload.host, 'konthora.dev.bd');
  assert.equal(payload.key, INDEXNOW_KEY);
  assert.equal(payload.keyLocation, INDEXNOW_KEY_LOCATION);
  assert.deepEqual(payload.urlList, [
    'https://konthora.dev.bd/audio-to-text',
    'https://konthora.dev.bd/about',
  ]);

  const keyFile = await readFile(new URL('../../public/ff904654fd97c20407266dd4f36709dad68735eda40b31f7bd84ac4b0bfe3478.txt', import.meta.url), 'utf8');
  assert.equal(keyFile.trim(), INDEXNOW_KEY);
});

test('submits one mocked batch to the official endpoint', async () => {
  let request;
  const result = await submitIndexNowUrls(['/', '/about'], async (url, options) => {
    request = { url, options };
    return new Response('', { status: 202 });
  });

  assert.equal(request.url, INDEXNOW_ENDPOINT);
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers['content-type'], 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(request.options.body), result.payload);
  assert.equal(result.accepted, true);
  assert.equal(result.status, 202);
});

test('getAllSitemapUrlsFromArtifact extracts all sitemap canonical URLs', async () => {
  const { getAllSitemapUrlsFromArtifact } = await import('../../scripts/submit-indexnow.mjs');
  const urls = getAllSitemapUrlsFromArtifact();
  assert.ok(urls.length >= 91, `Sitemap must contain all routes (found ${urls.length})`);
  assert.ok(urls.includes('https://konthora.dev.bd/'), 'Must include homepage');
  assert.ok(urls.includes('https://konthora.dev.bd/text-to-speech'), 'Must include text-to-speech');
  assert.ok(urls.includes('https://konthora.dev.bd/audio-to-text'), 'Must include audio-to-text');
  assert.ok(urls.includes('https://konthora.dev.bd/voices/af-heart'), 'Must include voice profile');
});

test('API route /api/indexnow and static key file return matching verification key', async () => {
  const keyFile = await readFile(new URL('../../public/ff904654fd97c20407266dd4f36709dad68735eda40b31f7bd84ac4b0bfe3478.txt', import.meta.url), 'utf8');
  const routeFile = await readFile(new URL('../../src/app/api/indexnow/route.ts', import.meta.url), 'utf8');
  const libFile = await readFile(new URL('../../src/lib/indexnow.ts', import.meta.url), 'utf8');

  assert.ok(routeFile.includes(keyFile.trim()), 'API route must return the verification key');
  assert.ok(libFile.includes(keyFile.trim()), 'src/lib/indexnow.ts must declare the verification key');
});

