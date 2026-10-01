import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  loadServiceAccountCredentials,
  normalizeGscUrl,
  getAllSitemapUrls,
  createServiceAccountJwt,
  getGoogleAccessToken,
  submitUrlToGoogleIndexing,
  submitBatchToGoogleIndexing,
} from '../../scripts/gscIndexing.mjs';
import {
  SITEMAP_URL,
  verifySitemap,
  submitToIndexNow,
  submitToGoogleIndexing,
  verifyLocalSitemapArtifact,
  runPostBuildChecks,
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

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<loc>https://konthora.dev.bd</loc>
<loc>https://konthora.dev.bd/text-to-speech</loc>
</urlset>`;

function xmlResponse(body = SITEMAP_XML, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
    json: async () => ({}),
  };
}

test('verifySitemap accepts a healthy live sitemap and counts its URLs', async () => {
  const result = await verifySitemap(async () => xmlResponse());
  assert.equal(result.success, true);
  assert.equal(result.status, 200);
  assert.equal(result.urlCount, 2);
  assert.equal(result.url, SITEMAP_URL);
});

test('verifySitemap fails when the live sitemap 404s', async () => {
  // The old script pinged retired endpoints and could not tell this apart from
  // success, so a broken deploy looked healthy in the build log.
  const result = await verifySitemap(async () => xmlResponse('Not found', 404));
  assert.equal(result.success, false);
  assert.equal(result.status, 404);
  assert.equal(result.urlCount, 0);
});

test('verifySitemap rejects a 200 response that is not a sitemap', async () => {
  const result = await verifySitemap(async () => xmlResponse('<html><body>hello</body></html>', 200));
  assert.equal(result.success, false);
  assert.match(result.message, /not a sitemap urlset/u);
});

test('verifySitemap rejects an empty urlset', async () => {
  const result = await verifySitemap(async () =>
    xmlResponse('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'),
  );
  assert.equal(result.success, false);
  assert.equal(result.urlCount, 0);
});

test('verifySitemap reports a network failure without throwing', async () => {
  const result = await verifySitemap(async () => {
    throw new Error('getaddrinfo ENOTFOUND');
  });
  assert.equal(result.success, false);
  assert.equal(result.status, 0);
  assert.match(result.message, /ENOTFOUND/u);
});

test('verifySitemap accepts a sitemapindex document', async () => {
  const result = await verifySitemap(async () =>
    xmlResponse('<?xml version="1.0"?><sitemapindex><sitemap><loc>x</loc></sitemap></sitemapindex>'),
  );
  assert.equal(result.success, true);
});

test('submitToIndexNow posts the real IndexNow endpoint and reports acceptance', async () => {
  const seen = [];
  const result = await submitToIndexNow(async (url, init) => {
    seen.push({ url, body: JSON.parse(init.body) });
    return { ok: true, status: 200, text: async () => '', json: async () => ({}) };
  });

  assert.equal(seen[0].url, 'https://api.indexnow.org/indexnow');
  assert.ok(seen[0].body.urlList.length > 0, 'IndexNow must receive the sitemap URLs');
  assert.equal(result.name, 'IndexNow');
  assert.equal(result.success, true);
  assert.equal(result.status, 200);
  assert.ok(result.submitted > 0);
});

test('submitToIndexNow surfaces a rejection instead of claiming success', async () => {
  const result = await submitToIndexNow(async () => ({
    ok: false,
    status: 403,
    text: async () => '',
    json: async () => ({}),
  }));
  assert.equal(result.success, false);
  assert.equal(result.status, 403);
  assert.equal(result.submitted, 0);
});

test('submitToGoogleIndexing skips cleanly when no credentials are configured', async () => {
  const previous = process.env.GSC_SERVICE_ACCOUNT_JSON;
  delete process.env.GSC_SERVICE_ACCOUNT_JSON;
  try {
    const result = await submitToGoogleIndexing(async () => {
      throw new Error('should not be called without credentials');
    });
    assert.equal(result.skipped, true);
    assert.equal(result.success, true);
    assert.match(result.message, /GSC_SERVICE_ACCOUNT_JSON/u);
  } finally {
    if (previous !== undefined) process.env.GSC_SERVICE_ACCOUNT_JSON = previous;
  }
});

test('the local build artifact exposes a non-empty URL list', () => {
  const result = verifyLocalSitemapArtifact();
  // Reads the built artifact when present, otherwise the sitemap route list.
  assert.equal(result.success, true);
  assert.ok(result.urlCount > 0);
});

test('runPostBuildChecks gates on the live sitemap, not on deprecated pings', async () => {
  const calls = [];
  const result = await runPostBuildChecks(async (url) => {
    calls.push(url);
    if (url === SITEMAP_URL) return xmlResponse();
    return { ok: true, status: 200, text: async () => '', json: async () => ({}) };
  });

  assert.equal(result.ok, true);
  assert.equal(result.live.success, true);
  assert.equal(result.submissions.length, 2);
  assert.deepEqual(
    result.submissions.map((s) => s.name),
    ['IndexNow', 'Google Indexing API'],
  );
  assert.ok(
    !calls.some((u) => u.includes('/ping')),
    'the retired ping endpoints must not be called',
  );
});

test('runPostBuildChecks reports failure when the live sitemap is broken', async () => {
  const result = await runPostBuildChecks(async (url) => {
    if (url === SITEMAP_URL) return xmlResponse('Not found', 404);
    return { ok: true, status: 200, text: async () => '', json: async () => ({}) };
  });
  assert.equal(result.ok, false);
  assert.equal(result.live.success, false);
  assert.equal(result.live.status, 404);
});
