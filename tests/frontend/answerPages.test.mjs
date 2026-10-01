import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ANSWER_PAGES, getAnswerPage } from '../../src/config/answerPages.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const SLUGS = [
  '/text-to-speech-timestamps-explained',
  '/ai-voice-sounds-robotic',
  '/speech-to-text/transcription-accuracy-checklist',
];

test('each answer page has a route, sitemap entry and thin wrapper', () => {
  // ANSWER_PAGES stores slugs; SLUGS stores routes, and the two differ where a
  // page is nested. Compare the slugs, not the raw route strings.
  assert.deepEqual(
    ANSWER_PAGES.map((p) => p.slug).sort(),
    SLUGS.map((r) => r.slice(1)).sort()
  );
  const sitemap = read('src/app/sitemap.ts');
  for (const route of SLUGS) {
    const slug = route.slice(1);
    assert.ok(getAnswerPage(slug), `${slug} missing from ANSWER_PAGES`);
    assert.ok(
      fs.existsSync(path.join(root, 'src', 'app', slug, 'page.tsx')),
      `${slug} has no page.tsx`
    );
    const source = read(`src/app/${slug}/page.tsx`);
    assert.match(source, /AnswerPage/u, `${slug} does not use the shared renderer`);
    assert.ok(source.split('\n').length < 25, `${slug} should be a thin wrapper`);
    assert.match(source, new RegExp(`path: '${route}'`, 'u'), `${route} needs a literal path`);
    assert.match(
      sitemap,
      new RegExp(`'${route}'`, 'u'),
      `${route} is not in the sitemap, so it cannot be discovered`
    );
  }
});

test('every answer page opens with a direct answer, for snippet extraction', () => {
  // Featured snippets and AI answer engines quote the most extractable answer
  // on a page. Burying it under an intro means it is not quoted at all.
  for (const content of ANSWER_PAGES) {
    assert.ok(
      content.directAnswer.length > 80,
      `${content.slug} has no substantial directAnswer`
    );
    assert.ok(
      content.directAnswer.length < 400,
      `${content.slug} directAnswer is ${content.directAnswer.length} chars; too long to quote cleanly`
    );
    // It must be a single self-contained answer, not a teaser.
    assert.doesNotMatch(
      content.directAnswer,
      /^(this page|below|read more|we will|let's)/iu,
      `${content.slug} directAnswer reads like a teaser rather than an answer`
    );
    assert.ok(
      content.quickAnswers.length >= 3,
      `${content.slug} needs short answers for the questions it targets`
    );
  }
});

test('every section heading is question-shaped', () => {
  // Feature-led headings ("Everything the workspace supports") are not extracted.
  // Question headings match how people actually search.
  for (const content of ANSWER_PAGES) {
    for (const section of content.sections) {
      const isQuestion = /^(how|what|why|when|where|which|can|does|do|is|should|will)\b/i.test(
        section.heading
      );
      assert.ok(
        isQuestion,
        `${content.slug} heading "${section.heading}" is not question-shaped`
      );
    }
    assert.ok(content.sections.length >= 4, `${content.slug} needs real depth`);
  }
});

test('quick answers and FAQs are phrased as real questions', () => {
  for (const content of ANSWER_PAGES) {
    for (const item of [...content.quickAnswers, ...content.faqs]) {
      assert.ok(
        item.question.trim().endsWith('?'),
        `${content.slug}: "${item.question}" is not phrased as a question`
      );
    }
  }
});

test('the three answer pages do not duplicate each other', () => {
  for (const field of ['title', 'description', 'directAnswer', 'h1Prefix', 'crumb']) {
    const values = ANSWER_PAGES.map((p) => p[field]);
    assert.equal(
      new Set(values).size,
      values.length,
      `two answer pages share a ${field}`
    );
  }

  const headings = ANSWER_PAGES.flatMap((p) => p.sections.map((s) => s.heading));
  assert.equal(
    new Set(headings).size,
    headings.length,
    'two answer pages share a section heading'
  );

  const paragraphs = ANSWER_PAGES.flatMap((p) => p.sections.flatMap((s) => s.paragraphs));
  assert.equal(
    new Set(paragraphs).size,
    paragraphs.length,
    'two answer pages share a paragraph verbatim'
  );
});

test('each answer page has substantial unique body copy', () => {
  for (const content of ANSWER_PAGES) {
    const words = content.sections
      .flatMap((s) => s.paragraphs)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(words > 400, `${content.slug} has only ${words} words; too thin to rank`);
  }
});

test('links point at real pages', () => {
  for (const content of ANSWER_PAGES) {
    assert.ok(content.links.length >= 3, `${content.slug} needs real internal links`);
    for (const link of content.links) {
      assert.ok(
        fs.existsSync(path.join(root, 'src', 'app', link.href.slice(1), 'page.tsx')),
        `${content.slug} links to ${link.href}, which has no page`
      );
    }
  }
});

test('inline links inside the copy resolve', () => {
  const known = new Set();
  const appDir = path.join(root, 'src', 'app');
  for (const entry of fs.readdirSync(appDir, { recursive: true })) {
    if (typeof entry === 'string' && entry.endsWith('page.tsx')) {
      const rel = path.dirname(path.join(appDir, entry));
      known.add('/' + path.relative(appDir, rel).replace(/\\/g, '/'));
    }
  }

  for (const content of ANSWER_PAGES) {
    for (const section of content.sections) {
      for (const paragraph of section.paragraphs) {
        for (const match of paragraph.matchAll(/\[([^\]]+)\]\(([^)]+)\)/gu)) {
          assert.ok(
            known.has(match[2]),
            `${content.slug} links to unknown route ${match[2]}`
          );
        }
      }
    }
  }
});

test('titles and descriptions stay within the SERP budget', () => {
  for (const content of ANSWER_PAGES) {
    assert.ok(content.title.length <= 65, `${content.slug} title is ${content.title.length} chars`);
    assert.ok(
      content.description.length <= 155,
      `${content.slug} description is ${content.description.length} chars`
    );
    assert.doesNotMatch(content.title, /&/u, `${content.slug} title contains an ampersand`);
  }
});

test('the answer pages are stamped fresh in the sitemap', () => {
  // They are new pages; a stale lastmod tells crawlers they are not.
  const freshness = read('src/config/freshness.ts');
  for (const route of SLUGS) {
    assert.ok(
      freshness.includes(`'${route}':`),
      `${route} is missing a lastModified stamp in the freshness registry`
    );
    assert.ok(
      freshness.includes(`'${route}': '2026-10-01'`),
      `${route} should be stamped as newly added, not left at the site-wide default`
    );
  }
});