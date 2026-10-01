import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

function getPages(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getPages(filePath, path.join(base, file)));
    } else if (file === 'page.tsx') {
      const route = base ? '/' + base.replace(/\\/g, '/') : '/';
      results.push({ route, fullPath: filePath });
    }
  }
  return results;
}

test('Sitemap contains all static and dynamic routes without broken links', () => {
  const pages = getPages(path.join(rootDir, 'src/app'));
  const staticPages = pages.filter((p) => !p.route.includes('[')).map((p) => p.route);

  const sitemapContent = fs.readFileSync(path.join(rootDir, 'src/app/sitemap.ts'), 'utf8');
  const routesMatch = sitemapContent.match(/const routes = \[([\s\S]*?)\];/);
  assert.ok(routesMatch, 'Sitemap routes array found');

  const rawStaticRoutes = routesMatch[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith("'") || line.startsWith('"'))
    .map((line) => line.replace(/^['"]|['"],?$/g, ''))
    .map((line) => (line === '' ? '/' : line));

  // Verify all static pages are in sitemap
  for (const page of staticPages) {
    assert.ok(
      rawStaticRoutes.includes(page),
      `Static page ${page} should be present in sitemap.ts routes`
    );
  }

  // Verify all static routes in sitemap exist as real page.tsx
  for (const route of rawStaticRoutes) {
    assert.ok(
      staticPages.includes(route),
      `Sitemap route ${route} should exist as a page.tsx in src/app`
    );
  }
});

test('Every page exports accurate metadata with matching path', () => {
  const pages = getPages(path.join(rootDir, 'src/app'));

  for (const page of pages) {
    if (page.route.includes('[')) continue; // Dynamic routes handled via generateMetadata
    const content = fs.readFileSync(page.fullPath, 'utf8');

    const pathMatch = content.match(/path:\s*['"]([^'"]*)['"]/);
    assert.ok(pathMatch, `Page ${page.route} must specify path in constructMetadata`);

    const definedPath = pathMatch[1];
    assert.equal(
      definedPath,
      page.route,
      `Page ${page.route} should have matching canonical path in constructMetadata`
    );
  }
});

// Pages that delegate their schema to a shared renderer. The /transcribe-*
// and /text-to-speech-for-* guides are thin wrappers around a guide renderer
// that declares the BreadcrumbList, HowTo and FAQPage schema. Grepping the
// wrapper would report a false failure, so the check follows the delegation.
const SCHEMA_DELEGATING_ROUTES = {
  '/transcribe-podcast': ['TranscribeGuidePage', 'src/components/guides/TranscribeGuidePage.tsx'],
  '/transcribe-interview': ['TranscribeGuidePage', 'src/components/guides/TranscribeGuidePage.tsx'],
  '/transcribe-meeting': ['TranscribeGuidePage', 'src/components/guides/TranscribeGuidePage.tsx'],
  '/transcribe-lecture': ['TranscribeGuidePage', 'src/components/guides/TranscribeGuidePage.tsx'],
  '/transcribe-video': ['TranscribeGuidePage', 'src/components/guides/TranscribeGuidePage.tsx'],
  '/transcribe-voice-memo': ['TranscribeGuidePage', 'src/components/guides/TranscribeGuidePage.tsx'],
  '/transcribe-webinar': ['TranscribeGuidePage', 'src/components/guides/TranscribeGuidePage.tsx'],
  '/text-to-speech-for-podcasts': ['TtsUseCasePage', 'src/components/guides/TtsUseCasePage.tsx'],
  '/text-to-speech-for-youtube-videos': ['TtsUseCasePage', 'src/components/guides/TtsUseCasePage.tsx'],
  '/text-to-speech-for-presentations': ['TtsUseCasePage', 'src/components/guides/TtsUseCasePage.tsx'],
  '/text-to-speech-for-elearning': ['TtsUseCasePage', 'src/components/guides/TtsUseCasePage.tsx'],
  '/text-to-speech-for-social-media': ['TtsUseCasePage', 'src/components/guides/TtsUseCasePage.tsx'],
  '/text-to-speech-for-audiobooks': ['TtsUseCasePage', 'src/components/guides/TtsUseCasePage.tsx'],
  '/audio-to-text': ['ToolPage', 'src/components/tools/ToolPage.tsx'],
  '/video-to-text': ['ToolPage', 'src/components/tools/ToolPage.tsx'],
  '/mp3-to-text': ['ToolPage', 'src/components/tools/ToolPage.tsx'],
};

function readWithDelegatedSchema(page) {
  const own = fs.readFileSync(page.fullPath, 'utf8');
  const entry = SCHEMA_DELEGATING_ROUTES[page.route];
  if (!entry) return own;

  const [componentName, rendererPath] = entry;
  // Confirm the wrapper really does render the shared component, so this
  // exemption cannot quietly outlive the refactor.
  assert.ok(
    own.includes(componentName),
    `${page.route} is registered as schema-delegating but does not render ${componentName}`
  );
  return `${own}\n${fs.readFileSync(path.join(rootDir, rendererPath), 'utf8')}`;
}

test('All subpages have BreadcrumbList schema with Home root', () => {
  const pages = getPages(path.join(rootDir, 'src/app'));

  for (const page of pages) {
    if (page.route === '/') continue; // Homepage does not need breadcrumbs
    const content = readWithDelegatedSchema(page);

    assert.ok(
      content.includes("'@type': 'BreadcrumbList'") || content.includes('"@type": "BreadcrumbList"'),
      `Subpage ${page.route} must declare BreadcrumbList schema`
    );

    assert.ok(
      content.includes('breadcrumbSchema') || content.includes('breadcrumbs'),
      `Subpage ${page.route} must render breadcrumb schema in JsonLd component`
    );
  }
});

test('Schema-delegating wrappers still render the shared guide schema', () => {
  const renderers = new Set();
  for (const [route, [componentName, rendererPath]] of Object.entries(
    SCHEMA_DELEGATING_ROUTES
  )) {
    const wrapper = fs.readFileSync(
      path.join(rootDir, 'src/app', route.slice(1), 'page.tsx'),
      'utf8'
    );
    // The prop name differs per renderer: guide={guide} for the transcribe
    // guides, content={content} for the text-to-speech ones.
    assert.ok(
      wrapper.includes(`<${componentName} guide={guide} />`) ||
        wrapper.includes(`<${componentName} content={content} />`),
      `${route} must pass its data into ${componentName}`
    );
    renderers.add(rendererPath);
  }

  for (const rendererPath of renderers) {
    const renderer = fs.readFileSync(path.join(rootDir, rendererPath), 'utf8');
    // BreadcrumbList and FAQPage are required everywhere. HowTo is only emitted
    // by the guide renderers; the tool pages use a shared StepsSection and do
    // not declare HowTo, which is correct because the dedicated how-to page and
    // the use-case guides own that intent.
    const required = ['BreadcrumbList', 'FAQPage'];
    if (rendererPath.includes('guides/')) {
      required.push('HowTo');
    }
    for (const type of required) {
      assert.ok(
        renderer.includes(type),
        `${rendererPath} must emit ${type} schema for the pages that delegate to it`
      );
    }
  }
});

function getHtmlFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(getHtmlFiles(full));
    } else if (item.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

/** Extracts the raw <title> text from a built HTML page. */
function getTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
}

/** Extracts the content attribute of a <meta> tag by attribute name and value. */
function getMetaContent(html, attrName, attrValue) {
  const re = new RegExp(
    `<meta\\b[^>]*\\b${attrName}=["']${attrValue}["'][^>]*>`,
    'i',
  );
  const tag = html.match(re)?.[0] ?? '';
  return tag.match(/content=["']([\s\S]*?)["']/i)?.[1] ?? '';
}

test('Confirm zero broken internal links across the entire site', () => {
  const htmlDir = path.join(rootDir, '.next/server/app');
  const htmlFiles = getHtmlFiles(htmlDir);
  assert.ok(htmlFiles.length > 0, 'Production build HTML files must exist');

  // Build a set of all valid routes from prerendered output
  const validRoutes = new Set();
  for (const file of htmlFiles) {
    const rel = path.relative(htmlDir, file).replace(/\\/g, '/');
    if (rel === 'index.html') {
      validRoutes.add('/');
    } else if (rel.endsWith('.html')) {
      validRoutes.add('/' + rel.slice(0, -5));
    }
  }

  const linkRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const brokenLinks = [];

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      let href = match[1].trim();

      // Skip empty, fragment-only, mailto, tel, javascript
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        continue;
      }

      // Check if it is absolute URL on konthora.dev.bd
      if (href.startsWith('https://konthora.dev.bd')) {
        href = href.replace('https://konthora.dev.bd', '') || '/';
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        continue; // External link
      }

      // Strip query parameters and hash fragments
      const [cleanPath] = href.split(/[?#]/);

      // Normalize path
      const normalizedPath = cleanPath === '' ? '/' : cleanPath.replace(/\/$/, '') || '/';

      // Check if it exists as route or public asset
      const publicAsset = path.join(rootDir, 'public', normalizedPath.replace(/^\//, ''));
      if (!validRoutes.has(normalizedPath) && !fs.existsSync(publicAsset)) {
        brokenLinks.push({
          sourceFile: path.relative(rootDir, file),
          href,
          normalizedPath,
        });
      }
    }
  }

  assert.deepEqual(
    brokenLinks,
    [],
    `Found ${brokenLinks.length} broken internal links:\n` +
      brokenLinks
        .map((b) => `  ${b.sourceFile} -> ${b.href} (resolved: ${b.normalizedPath})`)
        .join('\n')
  );
});

test('Heading structure: strictly ONE h1, sequential hierarchy, and no empty headings across all pages', () => {
  const htmlDir = path.join(rootDir, '.next/server/app');
  const htmlFiles = getHtmlFiles(htmlDir);
  assert.ok(htmlFiles.length > 0, 'Production build HTML files must exist');

  const multipleH1 = [];
  const missingH1 = [];
  const emptyHeadings = [];
  const hierarchySkips = [];

  for (const file of htmlFiles) {
    const rel = path.relative(htmlDir, file).replace(/\\/g, '/');
    if (rel.startsWith('_')) continue; // Skip error pages

    const content = fs.readFileSync(file, 'utf8');

    // H1 check
    const h1Matches = Array.from(content.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi));
    if (h1Matches.length === 0) {
      missingH1.push(rel);
    } else if (h1Matches.length > 1) {
      multipleH1.push({ rel, count: h1Matches.length });
    }

    // Heading hierarchy and empty check
    const allHeadings = Array.from(content.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi));
    let lastLevel = 0;
    for (const h of allHeadings) {
      const tag = h[1].toLowerCase();
      const level = parseInt(tag[1], 10);
      const text = h[2].replace(/<[^>]+>/g, '').trim();

      if (!text) {
        emptyHeadings.push({ rel, tag, heading: h[0] });
      }

      if (lastLevel > 0 && level > lastLevel + 1) {
        hierarchySkips.push({ rel, from: `h${lastLevel}`, to: `h${level}`, text });
      }
      lastLevel = level;
    }
  }

  assert.deepEqual(missingH1, [], `Pages missing <h1>: ${missingH1.join(', ')}`);
  assert.deepEqual(multipleH1, [], `Pages with multiple <h1> tags: ${JSON.stringify(multipleH1)}`);
  assert.deepEqual(emptyHeadings, [], `Empty heading tags found: ${JSON.stringify(emptyHeadings)}`);
  assert.deepEqual(hierarchySkips, [], `Heading hierarchy skips found: ${JSON.stringify(hierarchySkips)}`);
});

test('Landing pages and voice profiles have high-intent titles and synchronized Open Graph metadata', () => {
  const htmlDir = path.join(rootDir, '.next/server/app');

  // Verify homepage — brand + combined offering, distinct from /text-to-speech
  const homeHtml = fs.readFileSync(path.join(htmlDir, 'index.html'), 'utf8');
  assert.ok(
    homeHtml.includes('<title>Konthora — Free AI Voice &amp; Transcription Studio</title>'),
    'Homepage must have targeted title'
  );
  assert.ok(
    homeHtml.includes('content="Konthora — Free AI Voice &amp; Transcription Studio"'),
    'Homepage og:title must match canonical title'
  );

  // Verify /text-to-speech — keeps the high-intent "text to speech" query
  const ttsHtml = fs.readFileSync(path.join(htmlDir, 'text-to-speech.html'), 'utf8');
  assert.ok(
    ttsHtml.includes('<title>Free AI Text to Speech Online | Kokoro TTS Studio</title>'),
    '/text-to-speech must have targeted title'
  );

  // The homepage and /text-to-speech must not compete for the same query.
  assert.notEqual(
    getTitle(homeHtml),
    getTitle(ttsHtml),
    'Homepage and /text-to-speech must have distinct <title> values'
  );
  assert.notEqual(
    getMetaContent(homeHtml, 'property', 'og:title'),
    getMetaContent(ttsHtml, 'property', 'og:title'),
    'Homepage and /text-to-speech must have distinct og:title values'
  );

  // Verify /audio-to-text. The title targets the converter intent specifically
  // so it stops competing with /speech-to-text for the same query. No ampersand,
  // because Next HTML-escapes it and the assertion would need both forms.
  const sttHtml = fs.readFileSync(path.join(htmlDir, 'audio-to-text.html'), 'utf8');
  assert.ok(
    sttHtml.includes('<title>Audio to Text Converter: Free MP3 to Text | Konthora</title>'),
    '/audio-to-text must have targeted title'
  );
  // The two transcription pages must not share a title or og:title.
  const explainerHtml = fs.readFileSync(path.join(htmlDir, 'speech-to-text.html'), 'utf8');
  assert.notEqual(
    getMetaContent(sttHtml, 'property', 'og:title'),
    getMetaContent(explainerHtml, 'property', 'og:title'),
    '/audio-to-text and /speech-to-text must have distinct og:title values'
  );

  // Verify /voices
  const voicesHtml = fs.readFileSync(path.join(htmlDir, 'voices.html'), 'utf8');
  assert.ok(
    voicesHtml.includes('<title>41 AI Voice Profiles &amp; Accents | Kokoro Neural Voices</title>') ||
      voicesHtml.includes('<title>41 AI Voice Profiles & Accents | Kokoro Neural Voices</title>'),
    '/voices must have targeted title'
  );

  // Verify dynamic voice profile metadata contains name, gender, accent, and use case
  const voiceSampleHtml = fs.readFileSync(path.join(htmlDir, 'voices/af-heart.html'), 'utf8');
  assert.ok(voiceSampleHtml.includes('Heart'), 'Voice title must include name');
  assert.ok(voiceSampleHtml.includes('Female'), 'Voice title must include gender');
  assert.ok(voiceSampleHtml.includes('American English'), 'Voice title must include accent');
  // Name + gender + accent + a use case cannot fit inside the SERP title budget
  // without truncation — which is what produced 116-130 character titles before.
  // The title therefore carries identity only, and the use cases are asserted
  // where they are actually rendered and indexed: the H1 and the body copy.
  assert.ok(
    voiceSampleHtml.includes('voiceovers') || voiceSampleHtml.includes('narration'),
    'Voice page must include the primary use case in its indexed copy'
  );
});

test('Schema and metadata audit: no duplicate meta tags, no missing image alt attributes', () => {
  const htmlDir = path.join(rootDir, '.next/server/app');
  const htmlFiles = getHtmlFiles(htmlDir);

  const duplicateIssues = [];
  const missingImgAlt = [];

  for (const file of htmlFiles) {
    const rel = path.relative(htmlDir, file).replace(/\\/g, '/');
    if (rel.startsWith('_')) continue;
    const content = fs.readFileSync(file, 'utf8');

    const titles = content.match(/<title\b[^>]*>/gi) || [];
    const descriptions = content.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/gi) || [];
    const canonicals = content.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi) || [];
    const ogTitles = content.match(/<meta\b[^>]*\bproperty=["']og:title["'][^>]*>/gi) || [];
    const ogUrls = content.match(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*>/gi) || [];

    if (titles.length > 1) duplicateIssues.push({ rel, tag: 'title', count: titles.length });
    if (descriptions.length > 1) duplicateIssues.push({ rel, tag: 'description', count: descriptions.length });
    if (canonicals.length > 1) duplicateIssues.push({ rel, tag: 'canonical', count: canonicals.length });
    if (ogTitles.length > 1) duplicateIssues.push({ rel, tag: 'og:title', count: ogTitles.length });
    if (ogUrls.length > 1) duplicateIssues.push({ rel, tag: 'og:url', count: ogUrls.length });

    // Check images missing alt attribute
    const imgMatches = Array.from(content.matchAll(/<img\b([^>]*?)>/gi));
    for (const img of imgMatches) {
      const attrs = img[1];
      if (!attrs.includes('alt=')) {
        missingImgAlt.push({ rel, img: img[0] });
      }
    }
  }

  assert.deepEqual(duplicateIssues, [], `Duplicate meta tags found: ${JSON.stringify(duplicateIssues)}`);
  assert.deepEqual(missingImgAlt, [], `Images missing alt attribute found: ${JSON.stringify(missingImgAlt)}`);
});

test('Crawl budget, robots.txt disallow rules, and voice links internal link boost', () => {
  // 1. Robots.txt check
  const robotsBodyPath = path.join(rootDir, '.next/server/app/robots.txt.body');
  assert.ok(fs.existsSync(robotsBodyPath), 'robots.txt build artifact should exist');
  const robotsTxt = fs.readFileSync(robotsBodyPath, 'utf8');
  assert.ok(robotsTxt.includes('Disallow: /api/'), 'robots.txt must disallow /api/');
  assert.ok(robotsTxt.includes('Sitemap: https://konthora.dev.bd/sitemap.xml'), 'robots.txt must declare https production sitemap');
  // Previously disallowed, which also blocked crawlers from the Open Graph and
  // Twitter image assets that live under /_next/static/media/.
  assert.ok(
    !robotsTxt.includes('Disallow: /_next/static/media/'),
    'robots.txt must NOT disallow /_next/static/media/ — it holds the OG image assets',
  );
  // AI answer engines and LLM crawlers are granted explicitly so the decision
  // is reviewable rather than an accident of the wildcard rule.
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
    assert.ok(robotsTxt.includes(bot), `robots.txt must explicitly allow ${bot}`);
  }

  // 2. Next.js headers check
  const nextConfigContent = fs.readFileSync(path.join(rootDir, 'next.config.ts'), 'utf8');
  assert.ok(nextConfigContent.includes('X-Robots-Tag'), 'next.config.ts must configure X-Robots-Tag');
  assert.ok(nextConfigContent.includes('/(opengraph-image|twitter-image)(.*)'), 'next.config.ts must configure image headers');

  // 3. FastAPI backend middleware check
  const backendMainContent = fs.readFileSync(path.join(rootDir, 'backend/app/main.py'), 'utf8');
  assert.ok(backendMainContent.includes('X-Robots-Tag'), 'FastAPI main.py must set X-Robots-Tag header');

  // 4. OpenGraph & Twitter image headers in app code
  const ogContent = fs.readFileSync(path.join(rootDir, 'src/app/opengraph-image.tsx'), 'utf8');
  const twContent = fs.readFileSync(path.join(rootDir, 'src/app/twitter-image.tsx'), 'utf8');
  assert.ok(ogContent.includes("'X-Robots-Tag': 'noindex'"), 'opengraph-image must send X-Robots-Tag: noindex');
  assert.ok(twContent.includes("'X-Robots-Tag': 'noindex'"), 'twitter-image must send X-Robots-Tag: noindex');

  // 5. All 41 voice profiles linked via SSR in footer on homepage
  const homeHtml = fs.readFileSync(path.join(rootDir, '.next/server/app/index.html'), 'utf8');
  const matchedVoices = homeHtml.match(/\/voices\/[a-z0-9-]+/g) || [];
  const uniqueVoiceSlugs = [...new Set(matchedVoices)].filter(
    (v) => !v.includes('american-english') && !v.includes('british-english')
  );
  assert.equal(
    uniqueVoiceSlugs.length,
    41,
    `Homepage footer must link all 41 voice profiles (found ${uniqueVoiceSlugs.length})`
  );
});



test('Titles and descriptions stay within SERP truncation limits', () => {
  // Google truncates titles around 580px (~60 chars) and descriptions around
  // 920px (~155 chars). Anything longer is wasted, because the differentiating
  // part never reaches the search result.
  const htmlDir = path.join(rootDir, '.next/server/app');
  // Google truncates titles at roughly 580px and descriptions at roughly 920px.
  // 65/155 characters is the practical budget for those limits.
  const TITLE_MAX = 65;
  const DESC_MAX = 155;

  const longTitles = [];
  const longDescriptions = [];
  const duplicateTitles = new Map();

  for (const file of getHtmlFiles(htmlDir)) {
    const rel = path.relative(htmlDir, file).replace(/\\/g, '/');
    if (rel.startsWith('_')) continue;
    const content = fs.readFileSync(file, 'utf8');

    const title = getTitle(content);
    if (title) {
      if (title.length > TITLE_MAX) {
        longTitles.push({ rel, len: title.length, title });
      }
      duplicateTitles.set(title, [...(duplicateTitles.get(title) ?? []), rel]);
    }

    const description = getMetaContent(content, 'name', 'description');
    if (description && description.length > DESC_MAX) {
      longDescriptions.push({ rel, len: description.length, description });
    }
  }

  assert.deepEqual(
    longTitles,
    [],
    `Titles over ${TITLE_MAX} chars will be truncated: ${JSON.stringify(longTitles, null, 2)}`,
  );
  assert.deepEqual(
    longDescriptions,
    [],
    `Descriptions over ${DESC_MAX} chars will be truncated: ${JSON.stringify(longDescriptions, null, 2)}`,
  );

  const duplicateEntries = [...duplicateTitles.entries()].filter(([, pages]) => pages.length > 1);
  assert.deepEqual(
    duplicateEntries,
    [],
    `Duplicate <title> values: ${JSON.stringify(duplicateEntries)}`,
  );
});

test('No page emits fabricated review data (aggregateRating / ratingValue)', () => {
  // Konthora has no review platform. Any ratingValue in shipped JSON-LD would be
  // invented structured data: a Google manual-action risk, an advertising-law
  // problem, and a factual error an AI engine could attribute to the brand.
  const htmlDir = path.join(rootDir, '.next/server/app');
  const violations = [];

  for (const file of getHtmlFiles(htmlDir)) {
    const rel = path.relative(htmlDir, file).replace(/\\/g, '/');
    if (rel.startsWith('_')) continue;
    const content = fs.readFileSync(file, 'utf8');

    for (const match of content.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (/"aggregateRating"|"ratingValue"|"ratingCount"/i.test(match[1])) {
        violations.push(rel);
      }
    }
  }

  assert.deepEqual(
    [...new Set(violations)],
    [],
    `Pages emitting fabricated aggregateRating/ratingValue: ${JSON.stringify([...new Set(violations)])}`,
  );
});

test('AI-search surfaces exist: llms.txt, llms-full.txt, and freshness signals', () => {
  // llms.txt is the convention (llmstxt.org) for telling language models what a
  // site is and which pages matter.
  const llmsPath = path.join(rootDir, 'public/llms.txt');
  const llmsFullPath = path.join(rootDir, 'public/llms-full.txt');
  assert.ok(fs.existsSync(llmsPath), 'public/llms.txt must exist for AI answer engines');
  assert.ok(fs.existsSync(llmsFullPath), 'public/llms-full.txt must exist for AI answer engines');

  const llms = fs.readFileSync(llmsPath, 'utf8');
  assert.ok(llms.includes('# Konthora'), 'llms.txt must start with an H1 title block');
  assert.ok(
    llms.includes('https://konthora.dev.bd/text-to-speech'),
    'llms.txt must link the primary text-to-speech tool',
  );
  assert.ok(
    llms.includes('https://konthora.dev.bd/audio-to-text'),
    'llms.txt must link the primary audio-to-text tool',
  );

  // dateModified is a freshness signal for both Google and AI answer engines, so
  // it belongs in JSON-LD and not only in the sitemap.
  const homeHtml = fs.readFileSync(path.join(rootDir, '.next/server/app/index.html'), 'utf8');
  assert.ok(homeHtml.includes('dateModified'), 'Homepage JSON-LD must declare dateModified');

  // Speakable must point at an element that actually exists in the DOM.
  if (homeHtml.includes('SpeakableSpecification')) {
    assert.ok(
      homeHtml.includes('id="speakable-summary"'),
      'Speakable schema references #speakable-summary, which must exist in the HTML',
    );
  }
});
