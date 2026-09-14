import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const INDEXNOW_HOST = 'konthora.dev.bd';
export const INDEXNOW_ORIGIN = `https://${INDEXNOW_HOST}`;

// IndexNow verification keys are intentionally public: this value must match
// the UTF-8 text served at /<key>.txt on the canonical host.
export const INDEXNOW_KEY = 'ff904654fd97c20407266dd4f36709dad68735eda40b31f7bd84ac4b0bfe3478';
export const INDEXNOW_KEY_LOCATION = `${INDEXNOW_ORIGIN}/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_MAX_URLS_PER_BATCH = 10_000;

const STATUS_MESSAGES = {
  200: 'accepted by IndexNow',
  202: 'accepted; key validation is pending',
  400: 'bad request; verify URL and payload formatting',
  403: 'forbidden; verify the public key file and key value',
  422: 'unprocessable; verify host, key location, and canonical URLs',
  429: 'rate limited; wait before retrying',
};

function invalidUrl(message) {
  throw new TypeError(`Invalid IndexNow URL: ${message}`);
}

/**
 * Converts an explicit Konthora path or canonical URL into a clean canonical
 * URL. IndexNow is only for the public canonical host and never query/preset
 * or fragment URLs.
 */
export function normalizeIndexNowUrl(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    invalidUrl('a non-empty path or URL is required');
  }

  const value = input.trim();
  if (value.includes('?') || value.includes('#')) {
    invalidUrl('query strings and fragments are not canonical submission URLs');
  }

  let url;
  try {
    url = value.startsWith('/') ? new URL(value, INDEXNOW_ORIGIN) : new URL(value);
  } catch {
    invalidUrl('malformed URL');
  }

  if (url.protocol !== 'https:' || url.hostname !== INDEXNOW_HOST || url.username || url.password) {
    invalidUrl(`only ${INDEXNOW_ORIGIN} URLs are allowed`);
  }

  const pathname = url.pathname.replace(/\/+$/u, '') || '/';
  return `${INDEXNOW_ORIGIN}${pathname}`;
}

export function normalizeIndexNowUrls(inputs) {
  if (!Array.isArray(inputs)) {
    throw new TypeError('IndexNow URLs must be supplied as an array');
  }

  const urls = [...new Set(inputs.map(normalizeIndexNowUrl))];
  if (urls.length === 0) {
    throw new TypeError('At least one IndexNow URL is required');
  }
  if (urls.length > INDEXNOW_MAX_URLS_PER_BATCH) {
    throw new RangeError(`IndexNow batches are limited to ${INDEXNOW_MAX_URLS_PER_BATCH} URLs`);
  }

  return urls;
}

export function buildIndexNowPayload(inputs) {
  const urlList = normalizeIndexNowUrls(inputs);
  return {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList,
  };
}

export function describeIndexNowStatus(status) {
  return STATUS_MESSAGES[status] || `unexpected HTTP ${status}`;
}

/**
 * Sends only explicitly requested canonical URLs. Callers decide which URLs
 * are new, updated, or removed; this utility never reads Git changes or the
 * sitemap to infer a batch.
 */
export async function submitIndexNowUrls(inputs, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('A fetch implementation is required for IndexNow submission');
  }

  const payload = buildIndexNowPayload(inputs);
  let response;
  try {
    response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'network request failed';
    throw new Error(`IndexNow request failed: ${message}`);
  }

  return {
    accepted: response.status === 200 || response.status === 202,
    payload,
    status: response.status,
    statusMessage: describeIndexNowStatus(response.status),
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function getAllSitemapUrlsFromArtifact() {
  const sitemapBodyPath = path.join(rootDir, '.next/server/app/sitemap.xml.body');
  if (fs.existsSync(sitemapBodyPath)) {
    const xml = fs.readFileSync(sitemapBodyPath, 'utf8');
    const matches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
    if (matches.length > 0) return normalizeIndexNowUrls(matches);
  }
  const sitemapTs = fs.readFileSync(path.join(rootDir, 'src/app/sitemap.ts'), 'utf8');
  const routesMatch = sitemapTs.match(/const routes = \[([\s\S]*?)\];/);
  if (routesMatch) {
    const lines = routesMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith("'") || l.startsWith('"'))
      .map((l) => l.replace(/^['"]|['"],?$/g, ''));
    return normalizeIndexNowUrls(lines.map((r) => (r ? `${INDEXNOW_ORIGIN}${r}` : `${INDEXNOW_ORIGIN}/`)));
  }
  return [`${INDEXNOW_ORIGIN}/`];
}

function printUsage() {
  console.error('Usage: npm run indexnow -- /path [/another-path | https://konthora.dev.bd/path]');
  console.error('       npm run indexnow -- --all  (submits all sitemap URLs)');
}

async function runCli() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0 || inputs.includes('--help') || inputs.includes('-h')) {
    printUsage();
    process.exitCode = inputs.length === 0 ? 64 : 0;
    return;
  }

  const targets = inputs.includes('--all')
    ? getAllSitemapUrlsFromArtifact()
    : inputs;

  try {
    const result = await submitIndexNowUrls(targets);
    console.log(`IndexNow HTTP ${result.status}: ${result.statusMessage}. Submitted ${result.payload.urlList.length} URL(s).`);
    if (!result.accepted) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error(`IndexNow submission was not sent: ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli();
}
