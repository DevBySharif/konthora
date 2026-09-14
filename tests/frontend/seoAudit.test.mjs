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

test('All subpages have BreadcrumbList schema with Home root', () => {
  const pages = getPages(path.join(rootDir, 'src/app'));

  for (const page of pages) {
    if (page.route === '/') continue; // Homepage does not need breadcrumbs
    const content = fs.readFileSync(page.fullPath, 'utf8');

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

  // Verify homepage
  const homeHtml = fs.readFileSync(path.join(htmlDir, 'index.html'), 'utf8');
  assert.ok(
    homeHtml.includes('<title>Free AI Text to Speech Online | Kokoro TTS Studio</title>'),
    'Homepage must have targeted title'
  );
  assert.ok(
    homeHtml.includes('content="Free AI Text to Speech Online | Kokoro TTS Studio"'),
    'Homepage og:title must match canonical title'
  );

  // Verify /text-to-speech
  const ttsHtml = fs.readFileSync(path.join(htmlDir, 'text-to-speech.html'), 'utf8');
  assert.ok(
    ttsHtml.includes('<title>Free AI Text to Speech Online | Kokoro TTS Studio</title>'),
    '/text-to-speech must have targeted title'
  );

  // Verify /audio-to-text
  const sttHtml = fs.readFileSync(path.join(htmlDir, 'audio-to-text.html'), 'utf8');
  assert.ok(
    sttHtml.includes('<title>Free Audio to Text Converter | Timestamps &amp; SRT Export</title>') ||
      sttHtml.includes('<title>Free Audio to Text Converter | Timestamps & SRT Export</title>'),
    '/audio-to-text must have targeted title'
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
  assert.ok(voiceSampleHtml.includes('Voice for'), 'Voice title must include primary use case');
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
  assert.ok(robotsTxt.includes('Disallow: /_next/static/media/'), 'robots.txt must disallow /_next/static/media/');
  assert.ok(robotsTxt.includes('Disallow: /api/'), 'robots.txt must disallow /api/');
  assert.ok(robotsTxt.includes('Sitemap: https://konthora.dev.bd/sitemap.xml'), 'robots.txt must declare https production sitemap');

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


