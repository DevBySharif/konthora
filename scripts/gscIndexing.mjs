import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const GSC_INDEXING_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
export const GSC_OAUTH_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const GSC_INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
export const CANONICAL_ORIGIN = 'https://konthora.dev.bd';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Base64URL encoding helper
 */
export function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Reads Google Service Account credentials from JSON string or file path
 */
export function loadServiceAccountCredentials(rawInput = process.env.GSC_SERVICE_ACCOUNT_JSON) {
  if (!rawInput || typeof rawInput !== 'string' || rawInput.trim() === '') {
    return null;
  }

  const trimmed = rawInput.trim();

  // If path to existing JSON file
  if (!trimmed.startsWith('{') && fs.existsSync(trimmed)) {
    try {
      const fileContent = fs.readFileSync(trimmed, 'utf8');
      return JSON.parse(fileContent);
    } catch (err) {
      throw new Error(`Failed to read credentials file from path "${trimmed}": ${err.message}`);
    }
  }

  // Parse raw JSON string
  try {
    return JSON.parse(trimmed);
  } catch (err) {
    throw new Error(`Failed to parse GSC_SERVICE_ACCOUNT_JSON as JSON: ${err.message}`);
  }
}

/**
 * Creates a signed RS256 JWT for Google OAuth2 token exchange
 */
export function createServiceAccountJwt(credentials) {
  if (!credentials || !credentials.client_email || !credentials.private_key) {
    throw new TypeError('Credentials must include client_email and private_key');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const claim = {
    iss: credentials.client_email,
    scope: GSC_INDEXING_SCOPE,
    aud: credentials.token_uri || GSC_OAUTH_TOKEN_ENDPOINT,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  signer.end();

  const signature = signer.sign(credentials.private_key);
  const encodedSignature = base64url(signature);

  return `${signInput}.${encodedSignature}`;
}

/**
 * Exchanges signed JWT for a Google OAuth2 Bearer Access Token
 */
export async function getGoogleAccessToken(credentials, fetchImpl = globalThis.fetch) {
  const jwt = createServiceAccountJwt(credentials);
  const tokenUri = credentials.token_uri || GSC_OAUTH_TOKEN_ENDPOINT;

  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  const response = await fetchImpl(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Google OAuth token exchange failed (HTTP ${response.status}): ${errorText}`);
  }

  const data = await response.json().catch(() => ({}));
  if (!data.access_token) {
    throw new Error('Google OAuth token response did not include an access_token');
  }

  return data.access_token;
}

/**
 * Normalizes URL into canonical konthora.dev.bd URL
 */
export function normalizeGscUrl(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new TypeError('A non-empty URL string is required');
  }
  const value = input.trim();
  const parsed = value.startsWith('/') ? new URL(value, CANONICAL_ORIGIN) : new URL(value);

  if (parsed.origin !== CANONICAL_ORIGIN) {
    throw new TypeError(`Only canonical ${CANONICAL_ORIGIN} URLs are allowed, got: ${parsed.origin}`);
  }

  const cleanPath = parsed.pathname.replace(/\/+$/u, '') || '/';
  return `${CANONICAL_ORIGIN}${cleanPath}`;
}

/**
 * Collects all sitemap URLs from Next.js build artifact or sitemap.ts
 */
export function getAllSitemapUrls() {
  const sitemapBodyPath = path.join(rootDir, '.next/server/app/sitemap.xml.body');
  if (fs.existsSync(sitemapBodyPath)) {
    const xml = fs.readFileSync(sitemapBodyPath, 'utf8');
    const matches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
    if (matches.length > 0) {
      return [...new Set(matches.map(normalizeGscUrl))];
    }
  }

  // Fallback: parse src/app/sitemap.ts
  const sitemapTsPath = path.join(rootDir, 'src/app/sitemap.ts');
  if (fs.existsSync(sitemapTsPath)) {
    const sitemapTs = fs.readFileSync(sitemapTsPath, 'utf8');
    const routesMatch = sitemapTs.match(/const routes = \[([\s\S]*?)\];/);
    if (routesMatch) {
      const lines = routesMatch[1]
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith("'") || l.startsWith('"'))
        .map((l) => l.replace(/^['"]|['"],?$/g, ''));
      return [...new Set(lines.map((r) => normalizeGscUrl(r ? `${CANONICAL_ORIGIN}${r}` : `${CANONICAL_ORIGIN}/`)))];
    }
  }

  return [`${CANONICAL_ORIGIN}/`];
}

/**
 * Submits a single URL notification to Google Indexing API
 */
export async function submitUrlToGoogleIndexing(url, accessToken, fetchImpl = globalThis.fetch) {
  const normalized = normalizeGscUrl(url);

  try {
    const response = await fetchImpl(GSC_INDEXING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: normalized,
        type: 'URL_UPDATED',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return {
        url: normalized,
        success: false,
        status: response.status,
        error: errorText || `HTTP ${response.status}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      url: normalized,
      success: true,
      status: response.status,
      notifyTime: data.urlNotificationMetadata?.latestUpdate?.notifyTime || new Date().toISOString(),
    };
  } catch (err) {
    return {
      url: normalized,
      success: false,
      status: 0,
      error: err instanceof Error ? err.message : 'Network request failed',
    };
  }
}

/**
 * Batch submits a list of URLs to Google Indexing API with concurrency control
 */
export async function submitBatchToGoogleIndexing(urls, credentials, options = {}) {
  const { fetchImpl = globalThis.fetch, concurrency = 5, delayMs = 50 } = options;

  if (!credentials) {
    console.log('[GSC Indexing] GSC_SERVICE_ACCOUNT_JSON not provided. Skipping Google Indexing API submission.');
    return {
      skipped: true,
      reason: 'CREDENTIALS_MISSING',
      results: [],
    };
  }

  const accessToken = await getGoogleAccessToken(credentials, fetchImpl);
  const normalizedUrls = [...new Set(urls.map(normalizeGscUrl))];
  const results = [];

  for (let i = 0; i < normalizedUrls.length; i += concurrency) {
    const chunk = normalizedUrls.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((url) => submitUrlToGoogleIndexing(url, accessToken, fetchImpl))
    );
    results.push(...chunkResults);

    if (i + concurrency < normalizedUrls.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    skipped: false,
    total: normalizedUrls.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

async function runCli() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const targetUrls = args.filter((a) => !a.startsWith('--'));

  const urls = targetUrls.length > 0 ? targetUrls : getAllSitemapUrls();

  if (isDryRun) {
    console.log(`[GSC Indexing DRY-RUN] Would submit ${urls.length} URL(s) to Google Indexing API:`);
    urls.slice(0, 10).forEach((u) => console.log(`  - ${u}`));
    if (urls.length > 10) console.log(`  ... and ${urls.length - 10} more`);
    return;
  }

  let credentials;
  try {
    credentials = loadServiceAccountCredentials();
  } catch (err) {
    console.warn(`[GSC Indexing] Warning reading credentials: ${err.message}`);
    return;
  }

  if (!credentials) {
    console.log('[GSC Indexing] GSC_SERVICE_ACCOUNT_JSON not configured. Set this env var to publish URLs to Google Indexing API.');
    return;
  }

  console.log(`[GSC Indexing] Submitting ${urls.length} URLs to Google Indexing API...`);
  try {
    const summary = await submitBatchToGoogleIndexing(urls, credentials);
    if (summary.skipped) {
      console.log(`[GSC Indexing] Skipped: ${summary.reason}`);
    } else {
      console.log(`[GSC Indexing] Completed: ${summary.successful}/${summary.total} successful, ${summary.failed} failed.`);
    }
  } catch (err) {
    console.error(`[GSC Indexing] Execution error: ${err.message}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli();
}
