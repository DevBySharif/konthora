import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  base64url,
  loadServiceAccountCredentials,
  normalizeGscUrl,
  getAllSitemapUrls,
  createServiceAccountJwt,
  getGoogleAccessToken,
  submitUrlToGoogleIndexing,
  submitBatchToGoogleIndexing,
} from '../../scripts/gscIndexing.mjs';
import {
  GOOGLE_PING_URL,
  BING_PING_URL,
  pingSearchEngine,
  pingAllSearchEngines,
} from '../../scripts/pingSitemaps.mjs';

test('loadServiceAccountCredentials returns null when input is empty or unset', () => {
  assert.equal(loadServiceAccountCredentials(''), null);
  assert.equal(loadServiceAccountCredentials('   '), null);
  assert.equal(loadServiceAccountCredentials(undefined), null);
});

test('loadServiceAccountCredentials parses valid JSON credentials string', () => {
  const dummy = {
    type: 'service_account',
    client_email: 'test@konthora-project.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n',
  };
  const result = loadServiceAccountCredentials(JSON.stringify(dummy));
  assert.deepEqual(result, dummy);
});

test('normalizeGscUrl standardizes paths to canonical konthora.dev.bd origin', () => {
  assert.equal(normalizeGscUrl('/text-to-speech'), 'https://konthora.dev.bd/text-to-speech');
  assert.equal(normalizeGscUrl('https://konthora.dev.bd/voices/af-heart/'), 'https://konthora.dev.bd/voices/af-heart');
  assert.equal(normalizeGscUrl('/'), 'https://konthora.dev.bd/');
});

test('normalizeGscUrl throws on non-canonical hosts or invalid inputs', () => {
  assert.throws(() => normalizeGscUrl('https://evil.com/phish'), /Only canonical/);
  assert.throws(() => normalizeGscUrl(''), /non-empty URL string/);
});

test('getAllSitemapUrls extracts valid canonical URLs from build artifact or fallback', () => {
  const urls = getAllSitemapUrls();
  assert.ok(Array.isArray(urls));
  assert.ok(urls.length > 0);
  assert.ok(urls.includes('https://konthora.dev.bd/'));
  assert.ok(urls.includes('https://konthora.dev.bd/text-to-speech'));
  for (const url of urls) {
    assert.ok(url.startsWith('https://konthora.dev.bd'));
  }
});

test('createServiceAccountJwt produces valid 3-part RS256 token', () => {
  const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });

  const creds = {
    client_email: 'indexer@konthora-prod.iam.gserviceaccount.com',
    private_key: pem,
  };

  const token = createServiceAccountJwt(creds);
  const parts = token.split('.');
  assert.equal(parts.length, 3);

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

  assert.equal(header.alg, 'RS256');
  assert.equal(payload.iss, creds.client_email);
  assert.equal(payload.scope, 'https://www.googleapis.com/auth/indexing');
  assert.ok(payload.exp > payload.iat);
});

test('getGoogleAccessToken exchanges signed JWT for bearer token', async () => {
  const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });

  const creds = {
    client_email: 'indexer@konthora-prod.iam.gserviceaccount.com',
    private_key: pem,
    token_uri: 'https://oauth2.googleapis.com/token',
  };

  const mockFetch = async (url, opts) => {
    assert.equal(url, 'https://oauth2.googleapis.com/token');
    assert.equal(opts.method, 'POST');
    return {
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'mock-google-bearer-token', token_type: 'Bearer', expires_in: 3600 }),
    };
  };

  const token = await getGoogleAccessToken(creds, mockFetch);
  assert.equal(token, 'mock-google-bearer-token');
});

test('submitUrlToGoogleIndexing sends URL_UPDATED notification', async () => {
  let requestedBody;
  let requestedHeaders;

  const mockFetch = async (url, opts) => {
    assert.equal(url, 'https://indexing.googleapis.com/v3/urlNotifications:publish');
    assert.equal(opts.method, 'POST');
    requestedHeaders = opts.headers;
    requestedBody = JSON.parse(opts.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        urlNotificationMetadata: {
          latestUpdate: {
            url: 'https://konthora.dev.bd/text-to-speech',
            type: 'URL_UPDATED',
            notifyTime: '2026-09-15T02:00:00Z',
          },
        },
      }),
    };
  };

  const result = await submitUrlToGoogleIndexing(
    'https://konthora.dev.bd/text-to-speech',
    'mock-bearer-token',
    mockFetch
  );

  assert.equal(result.success, true);
  assert.equal(result.status, 200);
  assert.equal(requestedHeaders['Authorization'], 'Bearer mock-bearer-token');
  assert.equal(requestedBody.url, 'https://konthora.dev.bd/text-to-speech');
  assert.equal(requestedBody.type, 'URL_UPDATED');
});

test('submitBatchToGoogleIndexing skips gracefully without credentials', async () => {
  const result = await submitBatchToGoogleIndexing(['https://konthora.dev.bd/'], null);
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'CREDENTIALS_MISSING');
});

test('pingSearchEngine handles successful and deprecation responses gracefully', async () => {
  const mockFetchOk = async () => ({ ok: true, status: 200 });
  const resOk = await pingSearchEngine('TestEngine', 'https://example.com/ping', mockFetchOk);
  assert.equal(resOk.success, true);
  assert.equal(resOk.status, 200);

  const mockFetch404 = async () => ({ ok: false, status: 404 });
  const res404 = await pingSearchEngine('Google', GOOGLE_PING_URL, mockFetch404);
  assert.equal(res404.success, false);
  assert.equal(res404.status, 404);
  assert.ok(res404.message.includes('404'));
});

test('pingAllSearchEngines pings Google and Bing URLs', async () => {
  const pingedUrls = [];
  const mockFetch = async (url) => {
    pingedUrls.push(url);
    return { ok: true, status: 200 };
  };

  const results = await pingAllSearchEngines(mockFetch);
  assert.equal(results.length, 2);
  assert.ok(pingedUrls.some((u) => u.includes('google.com/ping')));
  assert.ok(pingedUrls.some((u) => u.includes('bing.com/ping')));
});
