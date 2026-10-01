import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GUIDES, getGuide } from '../../src/config/transcribeGuides.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const GUIDE_SLUGS = [
  'transcribe-podcast',
  'transcribe-interview',
  'transcribe-meeting',
  'transcribe-lecture',
  'transcribe-video',
  'transcribe-voice-memo',
  'transcribe-webinar',
];

test('every transcribe-* guide slug has a page and a data entry', () => {
  assert.deepEqual(
    GUIDES.map((g) => g.slug).sort(),
    [...GUIDE_SLUGS].sort(),
    'the guide data and the on-disk pages must agree',
  );
  for (const slug of GUIDE_SLUGS) {
    assert.ok(
      fs.existsSync(path.join(root, 'src', 'app', slug, 'page.tsx')),
      `${slug} has no page.tsx`,
    );
    assert.ok(getGuide(slug), `${slug} is missing from GUIDES`);
  }
});

test('every page delegates to the shared renderer', () => {
  // The pages were 352-line hand-maintained clones. Each must now be a thin
  // wrapper, so a content fix lands in one place instead of seven.
  for (const slug of GUIDE_SLUGS) {
    const source = read(`src/app/${slug}/page.tsx`);
    assert.match(source, /TranscribeGuidePage/u, `${slug} does not use the shared renderer`);
    assert.match(source, /getGuide\('/u, `${slug} does not load its guide data`);
    assert.ok(
      source.split('\n').length < 30,
      `${slug} is ${source.split('\n').length} lines; it should be a thin wrapper`,
    );
  }
});

test('the h1 reads as a complete phrase, not a bare noun', () => {
  // The renderer emits "How to {h1Highlight}". A bare noun produced
  // "How to Podcast with Konthora", which is broken English and reads as a
  // templating mistake to both users and crawlers.
  for (const guide of GUIDES) {
    assert.match(
      guide.h1Highlight,
      /^(Transcribe|Convert|Generate|Record)\b/u,
      `${guide.slug} has h1Highlight "${guide.h1Highlight}", which cannot follow "How to"`,
    );
    assert.doesNotMatch(
      guide.h1Highlight,
      /^(a|an|the)\s+\w+$/iu,
      `${guide.slug} has an article-only h1Highlight`,
    );
  }
});

test('every page has a literal canonical path matching its route', () => {
  // seoAudit greps the source for `path:`, so the value cannot be interpolated
  // from the guide data. A wrong literal is a wrong canonical on a live page.
  for (const slug of GUIDE_SLUGS) {
    const source = read(`src/app/${slug}/page.tsx`);
    assert.match(
      source,
      new RegExp(`path: '/${slug}'`, 'u'),
      `${slug} must declare the literal path: '/${slug}'`,
    );
  }
});

test('guides are genuinely differentiated, not template-swapped', () => {
  // This is the regression guard for the "Crawled - currently not indexed"
  // report. The old pages shared their headings, steps and FAQs and differed
  // only in the nouns, so Google treated them as one page attempted seven
  // times. Every guide now needs its own wording.
  const headings = GUIDES.flatMap((g) => g.sections.map((s) => s.heading));
  assert.equal(
    new Set(headings).size,
    headings.length,
    'two guides share a section heading; that is the duplication pattern again',
  );

  const questions = GUIDES.flatMap((g) => g.faqs.map((f) => f.question));
  assert.equal(
    new Set(questions).size,
    questions.length,
    'two guides share an FAQ question; Google sees duplicate questions',
  );

  const stepTitles = GUIDES.flatMap((g) => g.steps.map((s) => s.title));
  assert.equal(
    new Set(stepTitles).size,
    stepTitles.length,
    'two guides share a workflow step title',
  );

  // No identical paragraph bodies either.
  const paragraphs = GUIDES.flatMap((g) => g.sections.flatMap((s) => s.paragraphs));
  assert.equal(
    new Set(paragraphs).size,
    paragraphs.length,
    'two guides share a paragraph verbatim',
  );
});

test('each guide has substantial unique body copy', () => {
  // The old pages were ~850 rendered tokens with ~700 shared. Require enough
  // distinct prose that the pages cannot be mistaken for one another.
  for (const guide of GUIDES) {
    const words = guide.sections
      .flatMap((s) => s.paragraphs)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(
      words > 400,
      `${guide.slug} has only ${words} words of body copy; that reads as thin content`,
    );
  }
});

test('titles, descriptions and metadata are unique across guides', () => {
  for (const field of ['title', 'description', 'lede', 'howToName']) {
    const values = GUIDES.map((g) => g[field]);
    assert.equal(
      new Set(values).size,
      values.length,
      `two guides share a ${field}, which collapses them in search results`,
    );
  }
});

test('no guide leaves the narrow 10-minute limit unexplained', () => {
  // Every use case here involves audio longer than the limit, so every guide
  // has to tell the reader how to handle it. Skipping this was a real gap:
  // visitors were hitting an error with no stated workaround.
  for (const guide of GUIDES) {
    const all = [
      ...guide.sections.flatMap((s) => s.paragraphs),
      ...guide.faqs.map((f) => `${f.question} ${f.answer}`),
      ...guide.steps.map((s) => s.body),
    ]
      .join(' ')
      .toLowerCase();
    assert.match(
      all,
      /10[- ]minute|ten-minute/,
      `${guide.slug} never explains the 10-minute limit`,
    );
    assert.match(
      all,
      /split/,
      `${guide.slug} never says how to handle media over the limit`,
    );
  }
});

test('every guide states the 60-minute retention window', () => {
  // Users routinely lose finished work to this. It must be stated, not implied.
  // Matches both the hyphenated "60-minute" and the spelled-out "60 minutes".
  for (const guide of GUIDES) {
    const all = [
      ...guide.steps.map((s) => s.body),
      ...guide.sections.flatMap((s) => s.paragraphs),
      ...guide.faqs.map((f) => `${f.question} ${f.answer}`),
    ]
      .join(' ')
      .toLowerCase();
    assert.match(
      all,
      /60-minute|60 minutes/,
      `${guide.slug} does not warn about the 60-minute retention window`,
    );
  }
});

test('no guide claims speaker labels exist', () => {
  // The product does no diarisation. An interview or meeting guide that implies
  // otherwise would set an expectation the tool cannot meet.
  for (const guide of GUIDES) {
    const all = [...guide.sections.flatMap((s) => s.paragraphs), ...guide.faqs.map((f) => f.answer)]
      .join(' ')
      .toLowerCase();
    if (guide.slug === 'transcribe-interview' || guide.slug === 'transcribe-meeting') {
      assert.match(
        all,
        /not label|does not label|unattributed|no speaker/,
        `${guide.slug} must state plainly that speakers are not labelled`,
      );
    }
  }
});

test('internal links inside guide copy point at real routes', () => {
  const known = new Set([
    'audio-to-text',
    'video-to-text',
    'speech-to-text',
    'text-to-speech',
    'formats',
    'transcribe-podcast',
    'transcribe-interview',
    'transcribe-meeting',
    'transcribe-lecture',
    'transcribe-video',
    'transcribe-voice-memo',
    'transcribe-webinar',
  ]);

  for (const guide of GUIDES) {
    const paragraphs = guide.sections.flatMap((s) => s.paragraphs);
    for (const paragraph of paragraphs) {
      for (const match of paragraph.matchAll(/\[([^\]]+)\]\(([^)]+)\)/gu)) {
        const href = match[2];
        assert.ok(
          href.startsWith('/') && known.has(href.slice(1)),
          `${guide.slug} links to unknown route ${href}`,
        );
      }
    }
  }
});

test('CTA targets exist as routes', () => {
  for (const guide of GUIDES) {
    assert.ok(
      fs.existsSync(path.join(root, 'src', 'app', guide.ctaHref.slice(1), 'page.tsx')),
      `${guide.slug} CTA points at ${guide.ctaHref}, which has no page`,
    );
  }
});

test('internal navigation never emits a ?voice= query URL', () => {
  // Search Console reported 12 crawled-but-not-indexed ?voice= URLs. They are
  // duplicates of the language page, and the canonical was already correct, so
  // all that traffic was wasted crawl budget.
  const voicePage = read('src/app/voices/[voiceId]/page.tsx');
  assert.doesNotMatch(
    voicePage,
    /`\$\{languagePage\}\?voice=/u,
    'the voice page still builds a ?voice= link',
  );
  assert.match(
    voicePage,
    /const generateSlug = languagePage;/u,
    'the voice page should link to the plain language page',
  );

  // The parameter still works for a visitor arriving from a shared link.
  assert.match(
    read('src/components/tools/TtsWorkspaceWithPreset.tsx'),
    /searchParams\.get\('voice'\)/u,
    'the workspace must still honour an inbound ?voice= parameter',
  );
});

test('every guide page is listed in the sitemap', () => {
  const sitemap = read('src/app/sitemap.ts');
  for (const slug of GUIDE_SLUGS) {
    assert.match(
      sitemap,
      new RegExp(`'/${slug}'`, 'u'),
      `${slug} is not in the sitemap, so it will not be discovered`,
    );
  }
});
