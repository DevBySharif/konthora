import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TTS_USE_CASES, getTtsUseCase } from '../../src/config/ttsUseCases.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const SLUGS = [
  'text-to-speech-for-podcasts',
  'text-to-speech-for-youtube-videos',
  'text-to-speech-for-presentations',
  'text-to-speech-for-elearning',
  'text-to-speech-for-social-media',
  'text-to-speech-for-audiobooks',
];

test('every text-to-speech-for-* page has an entry and a thin wrapper', () => {
  assert.deepEqual(TTS_USE_CASES.map((c) => c.slug).sort(), [...SLUGS].sort());
  for (const slug of SLUGS) {
    assert.ok(getTtsUseCase(slug), `${slug} is missing from TTS_USE_CASES`);
    const source = read(`src/app/${slug}/page.tsx`);
    assert.match(source, /TtsUseCasePage/u, `${slug} does not use the shared renderer`);
    assert.ok(
      source.split('\n').length < 30,
      `${slug} is ${source.split('\n').length} lines; it should be a thin wrapper`,
    );
    // seoAudit greps for a literal path, so it cannot be interpolated.
    assert.match(source, new RegExp(`path: '/${slug}'`, 'u'), `${slug} must declare a literal path`);
  }
});

test('the six guides are genuinely differentiated, not template-swapped', () => {
  // The regression guard. These pages previously shared 84-93% of their tokens:
  // the same four H2s, the same five steps, the same three FAQs.
  const headings = TTS_USE_CASES.flatMap((c) => c.sections.map((s) => s.heading));
  assert.equal(
    new Set(headings).size,
    headings.length,
    'two guides share a section heading; that is the duplication pattern again'
  );

  const stepTitles = TTS_USE_CASES.flatMap((c) => c.steps.map((s) => s.title));
  assert.equal(
    new Set(stepTitles).size,
    stepTitles.length,
    'two guides share a workflow step title'
  );

  const questions = TTS_USE_CASES.flatMap((c) => c.faqs.map((f) => f.question));
  assert.equal(
    new Set(questions).size,
    questions.length,
    'two guides share an FAQ question'
  );

  const paragraphs = TTS_USE_CASES.flatMap((c) => c.sections.flatMap((s) => s.paragraphs));
  assert.equal(
    new Set(paragraphs).size,
    paragraphs.length,
    'two guides share a paragraph verbatim'
  );
});

test('titles, descriptions and ledes are unique', () => {
  for (const field of ['title', 'description', 'lede', 'howToName']) {
    const values = TTS_USE_CASES.map((c) => c[field]);
    assert.equal(
      new Set(values).size,
      values.length,
      `two guides share a ${field}, which collapses them in search results`
    );
  }
});

test('every guide has substantial unique body copy', () => {
  for (const content of TTS_USE_CASES) {
    const words = content.sections
      .flatMap((s) => s.paragraphs)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(words > 400, `${content.slug} has only ${words} words of body copy`);
  }
});

test('every guide states the 2,000-character limit', () => {
  // It is the hardest constraint on this site and it was never explained.
  for (const content of TTS_USE_CASES) {
    const all = [
      ...content.steps.map((s) => s.body),
      ...content.sections.flatMap((s) => s.paragraphs),
      ...content.faqs.map((f) => `${f.question} ${f.answer}`),
    ]
      .join(' ')
      .toLowerCase();
    assert.match(
      all,
      /2,000[- ]character/,
      `${content.slug} never explains the 2,000-character per-job limit`
    );
  }
});

test('every guide links to a genuinely different adjacent use case', () => {
  const siblings = new Set(SLUGS);
  for (const content of TTS_USE_CASES) {
    assert.ok(content.relatedNote.href.startsWith('/'), 'relatedNote needs an href');
    assert.ok(
      !siblings.has(content.relatedNote.href.slice(1)),
      `${content.slug} cross-links to a sibling TTS guide; it should point at the adjacent intent, ` +
        'otherwise the two pages duplicate each other rather than handing off'
    );
    assert.ok(
      fs.existsSync(path.join(root, 'src', 'app', content.relatedNote.href.slice(1), 'page.tsx')),
      `${content.slug} cross-links to ${content.relatedNote.href}, which has no page`
    );
  }
});

test('every guide is listed in the sitemap', () => {
  const sitemap = read('src/app/sitemap.ts');
  for (const slug of SLUGS) {
    assert.match(sitemap, new RegExp(`'/${slug}'`, 'u'), `${slug} is not in the sitemap`);
  }
});

test('the six guides are all listed in llms.txt', () => {
  // llms.txt previously covered 21 of 91 URLs and omitted every use-case guide,
  // which is exactly the content an AI engine needs for "narration for a
  // podcast".
  const llms = read('public/llms.txt');
  for (const slug of SLUGS) {
    assert.ok(llms.includes(slug), `llms.txt does not link ${slug}`);
  }
});

test('Organization schema is emitted site-wide, not only on the homepage', () => {
  // It was on 2 of 91 pages, so an AI answer engine had no entity markup to
  // resolve "Konthora" against on most of the site.
  const layout = read('src/app/layout.tsx');
  assert.match(layout, /constructOrganizationSchema/u, 'the layout must emit Organization schema');
  assert.match(layout, /<JsonLd schema=\{organizationSchema\}/u, 'it must be rendered into the page');
});

test('the entity pages cross-link to both products', () => {
  // Each entity page previously converted only one product, leaving half the
  // topical authority unused on the site's strongest entity pages.
  const whisper = read('src/app/entity/whisper/page.tsx');
  const kokoro = read('src/app/entity/kokoro/page.tsx');

  assert.ok(
    whisper.includes('"/audio-to-text"') && whisper.includes('"/transcribe-video"'),
    '/entity/whisper must link the transcription paths'
  );
  assert.ok(
    kokoro.includes('"/text-to-speech"') && kokoro.includes('"/voices"'),
    '/entity/kokoro must link the speech paths'
  );
});

test('the sitemap uses per-route freshness rather than one date for the site', () => {
  // A single lastModified across 91 URLs spends the freshness signal: the date
  // carries no information about which content is actually current.
  const sitemap = read('src/app/sitemap.ts');
  assert.match(sitemap, /getLastModifiedDate/u, 'the sitemap must use per-route dates');
  assert.doesNotMatch(
    sitemap,
    /const CONTENT_LAST_MODIFIED = new Date\(/u,
    'the hardcoded site-wide date must be gone'
  );

  const freshness = read('src/config/freshness.ts');
  assert.match(freshness, /getLastModified/u);
  assert.match(freshness, /2026-10-01/u, 'the SEO pass routes must be stamped');
});

test('per-route freshness dates are valid ISO and in the past', () => {
  // A malformed or future date is worse than no date: it is a false signal.
  const source = read('src/config/freshness.ts');
  const dates = [...source.matchAll(/'(\d{4}-\d{2}-\d{2})'/g)].map((m) => m[1]);
  assert.ok(dates.length > 0, 'no dates found in the freshness registry');
  const today = new Date('2026-10-01');
  for (const date of dates) {
    const parsed = new Date(date);
    assert.ok(!Number.isNaN(parsed.getTime()), `${date} is not a valid date`);
    assert.ok(parsed <= today, `${date} is in the future`);
  }
});
