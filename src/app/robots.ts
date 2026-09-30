import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  siteConfig.url ||
  'https://konthora.dev.bd'
).replace(/\/+$/, '');

/**
 * AI answer engines and LLM crawlers, granted explicitly rather than relying on
 * the wildcard rule. Being listed makes the decision reviewable and auditable
 * instead of accidental.
 *
 * Note: `Google-Extended` governs Gemini / Vertex AI training and grounding and
 * is separate from `Googlebot`, which still drives Search and is covered by the
 * wildcard rule below.
 */
const AI_CRAWLERS = [
  'GPTBot',              // OpenAI training
  'OAI-SearchBot',       // ChatGPT search results
  'ChatGPT-User',        // ChatGPT user-initiated fetch
  'ClaudeBot',           // Anthropic crawler
  'Claude-User',         // Anthropic user-initiated fetch
  'anthropic-ai',        // Anthropic legacy agent
  'PerplexityBot',       // Perplexity index
  'Perplexity-User',     // Perplexity user-initiated fetch
  'Google-Extended',     // Gemini / Vertex AI
  'Applebot-Extended',   // Apple Intelligence
  'CCBot',               // Common Crawl (feeds many LLM corpora)
  'Amazonbot',           // Alexa / Amazon
  'meta-externalagent',  // Meta AI
  'Bytespider',          // ByteDance / Doubao
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        // Only the API surface is closed off; content pages stay readable so
        // these engines can cite them.
        disallow: ['/api/'],
      },
      {
        userAgent: '*',
        allow: '/',
        // `/_next/static/media/` was previously disallowed, which also blocked
        // crawlers from the Open Graph / Twitter image assets. Removed so social
        // previews are fetchable.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
