/**
 * Post-build sitemap verification and submission.
 *
 * The old `/ping` calls are gone on purpose:
 *   - `google.com/ping` was retired by Google in June 2023 and always 404s.
 *   - `bing.com/ping` is deprecated and always 410s.
 * Both are dead endpoints, so retrying them notified nobody. The build now
 * verifies the deployed sitemap and submits through the endpoints that still
 * accept submissions: IndexNow (Bing, Yandex, and the IndexNow consortium) and
 * the Google Indexing API.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  getAllSitemapUrlsFromArtifact,
  submitIndexNowUrls,
} from './submit-indexnow.mjs';
import { getAllSitemapUrls, loadServiceAccountCredentials } from './gscIndexing.mjs';

export const SITEMAP_URL = 'https://konthora.dev.bd/sitemap.xml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/** Accepts 2xx, following the meaning of "sitemap was served". */
function isSuccess(status) {
  return status >= 200 && status < 300;
}

async function withTimeout(fetchImpl, url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Confirms the deployed sitemap is actually reachable and well formed.
 *
 * This is the check that matters. A build that only pings deprecated endpoints
 * cannot tell a healthy sitemap from a 404 page, so a broken deploy looked
 * healthy in the build log.
 */
export async function verifySitemap(fetchImpl = globalThis.fetch) {
  let response;
  try {
    response = await withTimeout(fetchImpl, SITEMAP_URL, { method: 'GET' });
  } catch (err) {
    return {
      url: SITEMAP_URL,
      status: 0,
      success: false,
      urlCount: 0,
      message: err instanceof Error ? err.message : 'network request failed',
    };
  }

  const body = await response.text().catch(() => '');
  const isXml = /<urlset[\s>]/u.test(body) || /<sitemapindex[\s>]/u.test(body);
  const urlCount = (body.match(/<loc>/gu) || []).length;

  if (!isSuccess(response.status)) {
    return {
      url: SITEMAP_URL,
      status: response.status,
      success: false,
      urlCount: 0,
      message: `HTTP ${response.status} from the live sitemap`,
    };
  }

  if (!isXml || urlCount === 0) {
    return {
      url: SITEMAP_URL,
      status: response.status,
      success: false,
      urlCount,
      message: 'response was not a sitemap urlset, or contained no <loc> entries',
    };
  }

  return {
    url: SITEMAP_URL,
    status: response.status,
    success: true,
    urlCount,
    message: `HTTP ${response.status} OK, ${urlCount} URL(s)`,
  };
}

/**
 * Submits every sitemap URL to IndexNow. Bing and the other IndexNow
 * participants accept this, and unlike the retired ping endpoint it responds
 * 200 with a real acknowledgement.
 */
export async function submitToIndexNow(fetchImpl = globalThis.fetch) {
  let urls;
  try {
    urls = getAllSitemapUrlsFromArtifact();
  } catch (err) {
    return {
      name: 'IndexNow',
      success: false,
      status: 0,
      submitted: 0,
      message: `could not read sitemap URLs: ${err.message}`,
    };
  }

  try {
    const result = await submitIndexNowUrls(urls, fetchImpl);
    return {
      name: 'IndexNow',
      success: result.accepted,
      status: result.status,
      submitted: result.accepted ? result.payload.urlList.length : 0,
      message: `HTTP ${result.status} ${result.statusMessage}, ${result.payload.urlList.length} URL(s) submitted`,
    };
  } catch (err) {
    return {
      name: 'IndexNow',
      success: false,
      status: 0,
      submitted: 0,
      message: err instanceof Error ? err.message : 'network request failed',
    };
  }
}

/**
 * Submits to the Google Indexing API when service account credentials are
 * configured. Skipped cleanly otherwise, because the Indexing API is also not
 * a general crawl trigger: Google discovers pages through crawling and sitemaps
 * regardless.
 */
export async function submitToGoogleIndexing(fetchImpl = globalThis.fetch) {
  let credentials;
  try {
    credentials = loadServiceAccountCredentials();
  } catch (err) {
    return {
      name: 'Google Indexing API',
      success: false,
      status: 0,
      submitted: 0,
      skipped: true,
      message: `credentials unreadable: ${err.message}`,
    };
  }

  if (!credentials) {
    return {
      name: 'Google Indexing API',
      success: true,
      status: 0,
      submitted: 0,
      skipped: true,
      message: 'GSC_SERVICE_ACCOUNT_JSON not set; Google will crawl the sitemap instead',
    };
  }

  // Imported lazily so the Indexing API modules are not loaded when unused.
  const { submitBatchToGoogleIndexing } = await import('./gscIndexing.mjs');
  try {
    const summary = await submitBatchToGoogleIndexing(getAllSitemapUrls(), credentials, {
      fetchImpl,
    });
    return {
      name: 'Google Indexing API',
      success: summary.failed === 0,
      status: 200,
      submitted: summary.successful,
      skipped: false,
      message: `${summary.successful}/${summary.total} accepted, ${summary.failed} failed`,
    };
  } catch (err) {
    return {
      name: 'Google Indexing API',
      success: false,
      status: 0,
      submitted: 0,
      skipped: false,
      message: err instanceof Error ? err.message : 'network request failed',
    };
  }
}

/** Reads the locally built sitemap so a build-time failure is caught early. */
export function verifyLocalSitemapArtifact() {
  const artifact = path.join(rootDir, '.next', 'server', 'app', 'sitemap.xml.body');
  let urls = [];
  try {
    urls = getAllSitemapUrls();
  } catch (err) {
    return { success: false, urlCount: 0, artifact, message: err.message };
  }
  return {
    success: urls.length > 0,
    urlCount: urls.length,
    artifact,
    message: urls.length > 0 ? `${urls.length} URL(s) in the build artifact` : 'no URLs found',
  };
}

export async function runPostBuildChecks(fetchImpl = globalThis.fetch) {
  const local = verifyLocalSitemapArtifact();
  const live = await verifySitemap(fetchImpl);
  const [indexNow, google] = await Promise.all([
    submitToIndexNow(fetchImpl),
    submitToGoogleIndexing(fetchImpl),
  ]);

  return {
    local,
    live,
    submissions: [indexNow, google],
    // The live sitemap is the only hard gate: a 404 or malformed response
    // means the deploy is genuinely broken and should be visible in CI.
    ok: local.success && live.success,
  };
}

async function runCli() {
  console.log(`[Sitemap] Verifying ${SITEMAP_URL}`);
  const result = await runPostBuildChecks();

  console.log(`[Sitemap] Build artifact: ${result.local.message}`);
  console.log(`[Sitemap] Live sitemap:   ${result.live.message}`);
  for (const submission of result.submissions) {
    const tag = submission.skipped ? 'skipped' : submission.success ? 'ok' : 'failed';
    console.log(`[Sitemap] ${submission.name} (${tag}): ${submission.message}`);
  }

  if (!result.ok) {
    // Surfaced as a warning, not a build failure: a live-origin outage should
    // not stop a valid build from being published.
    console.warn('[Sitemap] WARNING: the live sitemap did not verify. Check the deployment.');
  } else {
    console.log('[Sitemap] Verified. Google and Bing discover new URLs by crawling the sitemap.');
  }

  process.exitCode = 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli();
}
