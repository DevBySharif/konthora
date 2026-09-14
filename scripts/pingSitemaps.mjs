import { pathToFileURL } from 'node:url';

export const SITEMAP_URL = 'https://konthora.dev.bd/sitemap.xml';
export const GOOGLE_PING_URL = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
export const BING_PING_URL = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;

/**
 * Pings a search engine sitemap submission endpoint safely.
 */
export async function pingSearchEngine(name, pingUrl, fetchImpl = globalThis.fetch) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetchImpl(pingUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Google officially deprecated the /ping endpoint (HTTP 404/410), while Bing accepts it
    const isSuccess = response.status >= 200 && response.status < 400;
    return {
      name,
      url: pingUrl,
      status: response.status,
      success: isSuccess,
      message: isSuccess
        ? `HTTP ${response.status} OK`
        : `HTTP ${response.status} (Endpoint may be deprecated or restricted)`,
    };
  } catch (err) {
    return {
      name,
      url: pingUrl,
      status: 0,
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

/**
 * Pings all configured search engines with the live sitemap URL.
 */
export async function pingAllSearchEngines(fetchImpl = globalThis.fetch) {
  const targets = [
    { name: 'Google', url: GOOGLE_PING_URL },
    { name: 'Bing', url: BING_PING_URL },
  ];

  const results = await Promise.all(
    targets.map((target) => pingSearchEngine(target.name, target.url, fetchImpl))
  );

  return results;
}

async function runCli() {
  console.log(`[Sitemap Ping] Notifying search engines for: ${SITEMAP_URL}`);
  const results = await pingAllSearchEngines();

  for (const res of results) {
    console.log(`[Sitemap Ping] ${res.name}: ${res.message}`);
  }

  // Safe exit: never fail build step on external ping issues
  process.exitCode = 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli();
}
