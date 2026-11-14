import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function resolveApiUrls(envApiUrl, nodeEnv) {
  const hostUrl = (
    envApiUrl ||
    (nodeEnv === 'production'
      ? 'https://devsharif-konthora-api.hf.space'
      : 'http://localhost:8000')
  ).replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

  const baseUrl = `${hostUrl}/api/v1`;
  return { hostUrl, baseUrl };
}

test('resolves production fallback to the Hugging Face Space without localhost in production', () => {
  const { hostUrl, baseUrl } = resolveApiUrls(undefined, 'production');
  assert.equal(hostUrl, 'https://devsharif-konthora-api.hf.space');
  assert.equal(baseUrl, 'https://devsharif-konthora-api.hf.space/api/v1');
  assert.equal(baseUrl.includes('localhost'), false);
});

test('resolves development fallback to localhost:8000 when unset', () => {
  const { hostUrl, baseUrl } = resolveApiUrls(undefined, 'development');
  assert.equal(hostUrl, 'http://localhost:8000');
  assert.equal(baseUrl, 'http://localhost:8000/api/v1');
});

test('handles explicit NEXT_PUBLIC_API_URL with /api/v1 without path duplication', () => {
  const { hostUrl, baseUrl } = resolveApiUrls('https://devsharif-konthora-api.hf.space/api/v1', 'production');
  assert.equal(hostUrl, 'https://devsharif-konthora-api.hf.space');
  assert.equal(baseUrl, 'https://devsharif-konthora-api.hf.space/api/v1');
});

test('handles explicit NEXT_PUBLIC_API_URL without /api/v1 and appends correctly', () => {
  const { hostUrl, baseUrl } = resolveApiUrls('https://devsharif-konthora-api.hf.space', 'production');
  assert.equal(hostUrl, 'https://devsharif-konthora-api.hf.space');
  assert.equal(baseUrl, 'https://devsharif-konthora-api.hf.space/api/v1');
});

test('handles trailing slashes on custom endpoints (e.g. HuggingFace Spaces)', () => {
  const { hostUrl, baseUrl } = resolveApiUrls('https://devsharif-konthora-api.hf.space/', 'production');
  assert.equal(hostUrl, 'https://devsharif-konthora-api.hf.space');
  assert.equal(baseUrl, 'https://devsharif-konthora-api.hf.space/api/v1');
});

test('src/lib/api.ts exports API_HOST_URL and API_BASE_URL', async () => {
  const apiModule = await import('../../src/lib/api.ts');
  assert.ok(typeof apiModule.API_HOST_URL === 'string');
  assert.ok(typeof apiModule.API_BASE_URL === 'string');
  assert.ok(apiModule.API_BASE_URL.endsWith('/api/v1'));
});

test('withDevBypassHeaders includes X-Dev-Bypass-Key when NEXT_PUBLIC_DEV_BYPASS_KEY is set', async () => {
  const apiModule = await import('../../src/lib/api.ts');
  const originalEnv = process.env.NEXT_PUBLIC_DEV_BYPASS_KEY;

  try {
    // When unset
    delete process.env.NEXT_PUBLIC_DEV_BYPASS_KEY;
    const plainHeaders = apiModule.withDevBypassHeaders({ 'Accept': 'application/json' });
    assert.deepEqual(plainHeaders, { 'Accept': 'application/json' });

    // When set
    process.env.NEXT_PUBLIC_DEV_BYPASS_KEY = 'secret-dev-bypass-123';
    const bypassed = apiModule.withDevBypassHeaders({ 'Accept': 'application/json' });
    assert.deepEqual(bypassed, {
      'Accept': 'application/json',
      'X-Dev-Bypass-Key': 'secret-dev-bypass-123',
    });

    // When headers is empty / undefined
    const bypassedEmpty = apiModule.withDevBypassHeaders();
    assert.deepEqual(bypassedEmpty, {
      'X-Dev-Bypass-Key': 'secret-dev-bypass-123',
    });

    // With Headers object
    if (typeof Headers !== 'undefined') {
      const headersObj = new Headers({ 'Content-Type': 'application/json' });
      const bypassedHeadersObj = apiModule.withDevBypassHeaders(headersObj);
      assert.equal(bypassedHeadersObj.get('X-Dev-Bypass-Key'), 'secret-dev-bypass-123');
      assert.equal(bypassedHeadersObj.get('Content-Type'), 'application/json');
    }
  } finally {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_DEV_BYPASS_KEY = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_DEV_BYPASS_KEY;
    }
  }
});

test('CSP media-src allows the API origin so Edge voice previews can play', () => {
  // Regression: Nov 15 2026 — the Listen button for Edge voices showed
  // "Preview unavailable" because media-src was "'self' blob:" and the
  // preview MP3 streams cross-origin from the API (HF Space). A media
  // element blocked by CSP fires error code 4 and no request is ever made.
  // connect-src already allows the same origin; media-src must too.
  const config = readFileSync(new URL('../../next.config.ts', import.meta.url), 'utf8');
  // Match the directive itself (a comment above it also mentions media-src).
  assert.ok(
    config.includes("`media-src 'self' blob: ${apiOrigin}`"),
    'media-src must allow the API origin (${apiOrigin}) alongside \'self\' and blob:',
  );
  assert.match(config, /connect-src[^,\n]*\$\{apiOrigin\}/, 'connect-src must keep allowing the API origin');
});
