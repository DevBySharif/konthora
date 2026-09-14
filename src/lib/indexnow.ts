import sitemap from '@/app/sitemap';

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const INDEXNOW_HOST = 'konthora.dev.bd';
export const INDEXNOW_ORIGIN = `https://${INDEXNOW_HOST}`;
export const INDEXNOW_KEY = 'ff904654fd97c20407266dd4f36709dad68735eda40b31f7bd84ac4b0bfe3478';
export const INDEXNOW_KEY_LOCATION = `${INDEXNOW_ORIGIN}/${INDEXNOW_KEY}.txt`;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowResponse {
  accepted: boolean;
  status: number;
  statusMessage: string;
  urlCount: number;
  payload: IndexNowPayload;
}

const STATUS_MESSAGES: Record<number, string> = {
  200: 'OK - URLs submitted successfully',
  202: 'Accepted - Key validation is pending',
  400: 'Bad Request - Invalid format or parameters',
  403: 'Forbidden - Key not valid for host',
  422: 'Unprocessable Entity - URLs do not match host or key location',
  429: 'Too Many Requests - Rate limited by IndexNow',
};

/**
 * Returns all canonical URLs configured in sitemap.ts.
 */
export function getAllSitemapUrls(): string[] {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  return Array.from(new Set(urls));
}

/**
 * Builds the standard IndexNow JSON payload for a list of URLs.
 */
export function buildIndexNowPayload(urls: string[]): IndexNowPayload {
  const normalizedUrls = Array.from(
    new Set(
      urls.map((u) => {
        const trimmed = u.trim();
        if (trimmed.startsWith('/')) {
          return `${INDEXNOW_ORIGIN}${trimmed === '/' ? '' : trimmed}`;
        }
        return trimmed.replace(/\/+$/, '');
      })
    )
  );

  return {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: normalizedUrls,
  };
}

/**
 * Submits a batch of URLs to the official IndexNow endpoint.
 */
export async function submitToIndexNow(
  urls: string[],
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<IndexNowResponse> {
  const payload = buildIndexNowPayload(urls);

  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const status = response.status;
  const accepted = status === 200 || status === 202;
  const statusMessage = STATUS_MESSAGES[status] || `HTTP ${status}`;

  return {
    accepted,
    status,
    statusMessage,
    urlCount: payload.urlList.length,
    payload,
  };
}

/**
 * Automatically gathers all URLs from sitemap.ts and pings IndexNow.
 */
export async function pingIndexNowAllUrls(
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<IndexNowResponse> {
  const allUrls = getAllSitemapUrls();
  return submitToIndexNow(allUrls, fetchImpl);
}
