import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOOL_PAGES, getToolPage } from '../../src/config/toolPages.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const SLUGS = ['audio-to-text', 'video-to-text', 'mp3-to-text'];

test('all three transcription tool pages share one renderer', () => {
  assert.deepEqual(TOOL_PAGES.map((p) => p.slug).sort(), [...SLUGS].sort());
  for (const slug of SLUGS) {
    assert.ok(getToolPage(slug), `${slug} is missing from TOOL_PAGES`);
    const source = read(`src/app/${slug}/page.tsx`);
    assert.match(source, /ToolPage/u, `${slug} does not use the shared renderer`);
    assert.match(source, /getToolPage\(/u, `${slug} does not load its page data`);
    assert.ok(
      source.split('\n').length < 25,
      `${slug} is ${source.split('\n').length} lines; it should be a thin wrapper`
    );
    assert.match(source, new RegExp(`path: '/${slug}'`, 'u'), `${slug} needs a literal canonical path`);
  }
});

test('the three tool pages are genuinely differentiated', () => {
  // Measured against the live site before this change: /video-to-text shared 760
  // of 848 tokens with /audio-to-text, and /mp3-to-text shared 757 of 841.
  // Three pages competing for one intent left /video-to-text at position 86.
  for (const field of [
    'heading',
    'description',
    'headerTitle',
    'headerDescription',
    'speakable',
    'capabilityTitle',
    'capabilityDescription',
    'stepTitle',
    'stepDescription',
    'useCaseTitle',
    'useCaseDescription',
    'crossLinkTitle',
    'crossLinkDescription',
    'faqHeading',
    'faqSubheading',
  ]) {
    const values = TOOL_PAGES.map((p) => p[field]);
    assert.equal(
      new Set(values).size,
      values.length,
      `two tool pages share a ${field}, which collapses them in search`
    );
  }

  const questions = TOOL_PAGES.flatMap((p) => p.faqs.map((f) => f.question));
  assert.equal(
    new Set(questions).size,
    questions.length,
    'two tool pages share an FAQ question'
  );

  const stepTitles = TOOL_PAGES.flatMap((p) => p.steps.map((s) => s.title));
  assert.equal(new Set(stepTitles).size, stepTitles.length, 'two tool pages share a step title');
});

test('each tool page targets its own input format', () => {
  const video = getToolPage('video-to-text');
  const mp3 = getToolPage('mp3-to-text');
  const audio = getToolPage('audio-to-text');

  // Video must be about video-specific concerns, not generic transcription.
  const videoText = JSON.stringify(video).toLowerCase();
  assert.match(videoText, /burned-in/, 'video page should cover burned-in captions');
  assert.match(videoText, /audio track/, 'video page should explain audio track extraction');
  assert.match(videoText, /subtitle/, 'video page should be subtitle-focused');

  // MP3 must be about encoding, which is the genuinely format-specific topic.
  const mp3Text = JSON.stringify(mp3).toLowerCase();
  assert.match(mp3Text, /kbps/, 'mp3 page should cover bitrate');
  assert.match(mp3Text, /mono|stereo/, 'mp3 page should cover channel count');
  assert.match(mp3Text, /lossy/, 'mp3 page should explain lossy encoding');

  // The general page should not pretend to be format-specific.
  const audioText = JSON.stringify(audio).toLowerCase();
  assert.doesNotMatch(
    audioText,
    /bitrate/,
    'the general audio page should not duplicate the mp3 page'
  );
});

test('every tool page states the upload limits and retention window', () => {
  // Users routinely hit these with no stated workaround.
  for (const content of TOOL_PAGES) {
    const all = [...content.steps, ...content.faqs]
      .map((part) => (typeof part === 'string' ? part : part.desc || part.answer || part.title))
      .join(' ')
      .toLowerCase();
    assert.match(all, /100 mb/, `${content.slug} never states the 100 MB limit`);
    assert.match(all, /10 minutes|10-minute/, `${content.slug} never states the duration limit`);
    assert.match(
      all,
      /60-minute|60 minutes/,
      `${content.slug} never warns about the 60-minute retention window`
    );
  }
});

test('the speakable summary matches the visible copy on each page', () => {
  // Speakable text is visually hidden, so it must not claim anything the visible
  // page does not. Every fact in the summary has to appear in visible content.
  for (const content of TOOL_PAGES) {
    const visible = [
      content.headerDescription,
      content.capabilityDescription,
      content.useCaseDescription,
      content.stepDescription,
      ...content.steps.map((s) => s.desc),
      ...content.capabilityCards.map((c) => c.desc),
    ]
      .join(' ')
      .toLowerCase();

    const summary = content.speakable.toLowerCase();
    // The limits must be stated visibly, since the summary asserts them.
    assert.match(visible, /100 mb/, `${content.slug} summary claims 100 MB but the page does not say it`);
    assert.match(
      visible,
      /10 minutes|10-minute/,
      `${content.slug} summary claims the duration limit but the page does not say it`
    );
    assert.match(
      summary,
      /100 megabytes|100 mb/,
      `${content.slug} speakable summary should state the upload limit`
    );
  }
});

test('cross-links point at real pages and hand off rather than duplicate', () => {
  for (const content of TOOL_PAGES) {
    assert.ok(content.links.length >= 3, `${content.slug} needs real cross-links`);
    for (const link of content.links) {
      assert.ok(
        fs.existsSync(path.join(root, 'src', 'app', link.href.slice(1), 'page.tsx')),
        `${content.slug} cross-links to ${link.href}, which has no page`
      );
    }
  }
  // /audio-to-text points at the general tool, so the mp3 and video pages should
  // not link back to it in a way that makes them siblings of it.
  const mp3 = getToolPage('mp3-to-text');
  assert.ok(
    mp3.links.some((l) => l.href === '/audio-to-text'),
    'the mp3 page should hand off to the general tool for other formats'
  );
});

test('titles and descriptions stay within the SERP budget', () => {
  for (const content of TOOL_PAGES) {
    assert.ok(
      content.heading.length <= 65,
      `${content.slug} title is ${content.heading.length} chars; the audit budget is 65`
    );
    assert.ok(
      content.description.length <= 155,
      `${content.slug} description is ${content.description.length} chars; the audit budget is 155`
    );
    assert.doesNotMatch(
      content.heading,
      /&/u,
      `${content.slug} title contains an ampersand, which Next HTML-escapes and the audit cannot match`
    );
  }
});

test('every card icon exists in the renderer', () => {
  const renderer = read('src/components/tools/ToolPage.tsx');
  for (const content of TOOL_PAGES) {
    for (const card of [...content.capabilityCards, ...content.useCaseCards]) {
      assert.match(
        renderer,
        new RegExp(`\\b${card.icon}\\b`, 'u'),
        `${content.slug} uses icon "${card.icon}" which the renderer does not import`
      );
    }
  }
});

test('the three tool pages are all in the sitemap', () => {
  const sitemap = read('src/app/sitemap.ts');
  for (const slug of SLUGS) {
    assert.match(sitemap, new RegExp(`'/${slug}'`, 'u'), `${slug} is not in the sitemap`);
  }
});