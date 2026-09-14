import test from 'node:test';
import assert from 'node:assert/strict';

function resolveApiUrls(envApiUrl, nodeEnv) {
  const hostUrl = (
    envApiUrl ||
    (nodeEnv === 'production'
      ? 'https://api.konthora.dev.bd'
      : 'http://localhost:8000')
  ).replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

  const baseUrl = `${hostUrl}/api/v1`;
  return { hostUrl, baseUrl };
}

test('resolves production fallback to api.konthora.dev.bd without localhost in production', () => {
  const { hostUrl, baseUrl } = resolveApiUrls(undefined, 'production');
  assert.equal(hostUrl, 'https://api.konthora.dev.bd');
  assert.equal(baseUrl, 'https://api.konthora.dev.bd/api/v1');
  assert.equal(baseUrl.includes('localhost'), false);
});

test('resolves development fallback to localhost:8000 when unset', () => {
  const { hostUrl, baseUrl } = resolveApiUrls(undefined, 'development');
  assert.equal(hostUrl, 'http://localhost:8000');
  assert.equal(baseUrl, 'http://localhost:8000/api/v1');
});

test('handles explicit NEXT_PUBLIC_API_URL with /api/v1 without path duplication', () => {
  const { hostUrl, baseUrl } = resolveApiUrls('https://api.konthora.dev.bd/api/v1', 'production');
  assert.equal(hostUrl, 'https://api.konthora.dev.bd');
  assert.equal(baseUrl, 'https://api.konthora.dev.bd/api/v1');
});

test('handles explicit NEXT_PUBLIC_API_URL without /api/v1 and appends correctly', () => {
  const { hostUrl, baseUrl } = resolveApiUrls('https://api.konthora.dev.bd', 'production');
  assert.equal(hostUrl, 'https://api.konthora.dev.bd');
  assert.equal(baseUrl, 'https://api.konthora.dev.bd/api/v1');
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
