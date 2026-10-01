import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `script-src` needs 'unsafe-inline' because Next.js emits inline bootstrap
 * scripts and the Open Graph image routes run Satori, which injects styles.
 * GA4 and Clarity are listed explicitly so tightening this stays a deliberate
 * edit rather than a silent breakage.
 *
 * `connect-src` allows the FastAPI backend. Set NEXT_PUBLIC_API_URL to the
 * production origin (https://api.konthora.dev.bd); the localhost entries are
 * development conveniences and are ignored by browsers on https pages.
 */
/**
 * next.config is evaluated once at build time and cached into
 * `.next/required-server-files.json`, so `process.env.NODE_ENV` cannot be used
 * here to decide environment-specific headers — it reflects the build machine,
 * not the request. Detect a development configuration from the API origin
 * instead, which is what actually differs between local and deployed setups.
 */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const apiOrigin = (() => {
  try {
    return new URL(rawApiUrl.replace(/\/api\/v1\/?$/, "")).origin;
  } catch {
    return "http://localhost:8000";
  }
})();

const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/i.test(apiOrigin);

/** Origins the dev server may legitimately be reached from. */
const LOCAL_ORIGINS =
  " http://localhost:3000 http://localhost:3001 http://127.0.0.1:3000 http://127.0.0.1:3001 ws://localhost:3000 ws://localhost:3001 ws://127.0.0.1:3001";

const csp = [
  "default-src 'self'",
  // Next.js emits inline bootstrap scripts; Satori needs inline styles.
  // React only calls eval() in development (for call-stack reconstruction and
  // the dev overlay) and never in production, so 'unsafe-eval' is granted only
  // for a local/dev configuration. The production policy stays strict.
  // The www.clarity.ms/tag/<id> bootstrap only redirects the browser to
  // scripts.clarity.ms for the actual clarity.js payload. Allowlisting just
  // www made every Clarity request fail with "(blocked:csp)", which looks like
  // a broken tag rather than a policy problem. c.clarity.ms serves the
  // collection pixel and u.clarity.ms the queued user data.
  `script-src 'self' 'unsafe-inline'${isLocalApi ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  // Fonts: next/font self-hosts, Google Fonts is the fallback, data: covers inline.
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  // GA4 collects to google-analytics.com and its regional hostnames
  // (region1/region2/...); Clarity collects to *.clarity.ms.
  `connect-src 'self' ${apiOrigin}${isLocalApi ? LOCAL_ORIGINS : ""} https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.clarity.ms https://c.clarity.ms https://*.bing.com`,
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Would rewrite the http:// backend call to https:// on a local setup, which
  // breaks the dev proxy chain. Only meaningful over HTTPS anyway.
  ...(isLocalApi ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // The app never touches camera, microphone, geolocation, or payment.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Ignored by browsers over plain http, so it is safe to always send and is
  // required once the site is behind TLS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework.
  poweredByHeader: false,

  // Surfaces impure state updaters and effect bugs during development.
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/(opengraph-image|twitter-image)(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
