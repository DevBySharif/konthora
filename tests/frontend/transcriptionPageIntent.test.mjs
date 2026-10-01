import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getToolPage } from '../../src/config/toolPages.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const RENDERER = 'src/components/tools/ToolPage.tsx';

/**
 * /audio-to-text, /video-to-text and /mp3-to-text are now thin wrappers around a
 * shared renderer, so assertions about intent have to follow the delegation
 * rather than grep a page that no longer contains the copy.
 */
const video = getToolPage('video-to-text');
const mp3 = getToolPage('mp3-to-text');
const audio = getToolPage('audio-to-text');
const renderer = read(RENDERER);

test('each transcription tool page targets a distinct search intent', () => {
  // These three were 90% duplicates of each other, which left /video-to-text at
  // position 86 on 478 impressions because three pages competed for one intent.
  assert.match(
    audio.heading,
    /^Audio to Text/u,
    '/audio-to-text should lead with the general converter intent'
  );
  assert.match(
    video.heading,
    /^Video to Text/u,
    '/video-to-text should lead with the video intent'
  );
  assert.match(
    mp3.heading,
    /^MP3 to Text/u,
    '/mp3-to-text should lead with the mp3 intent'
  );
});

test('every tool page embeds the transcription workspace via the renderer', () => {
  assert.match(renderer, /<TranscriptionWorkspace \/>/u, 'the renderer must embed the tool');
  for (const slug of ['audio-to-text', 'video-to-text', 'mp3-to-text']) {
    assert.match(
      read(`src/app/${slug}/page.tsx`),
      /ToolPage/u,
      `${slug} must delegate to the renderer that embeds the workspace`
    );
  }
});

test('the tool pages declare the right schema through the renderer', () => {
  // SoftwareApplication belongs on all three product pages. The explainer page
  // (/speech-to-text) is the one carrying TechArticle instead.
  assert.match(renderer, /constructSoftwareAppSchema/u, 'the renderer must declare SoftwareApplication');
  assert.match(renderer, /constructSpeakableSchema/u, 'the renderer must declare Speakable schema');

  const explainer = read('src/app/speech-to-text/page.tsx');
  assert.match(explainer, /'@type': 'TechArticle'/u, 'the explainer must stay a TechArticle');
  assert.doesNotMatch(
    explainer,
    /<TranscriptionWorkspace \/>/u,
    'the explainer must not embed the tool; that is the tool pages\' job'
  );
});

test('the explainer still hands the transaction to the tool', () => {
  const explainer = read('src/app/speech-to-text/page.tsx');
  assert.match(explainer, /audio-to-text converter/u, 'the explainer must name the tool page');
  assert.match(explainer, /href="\/audio-to-text"/u, 'the explainer must link to the tool page');
});

test('the explainer answers concept questions rather than product steps', () => {
  const explainer = read('src/app/speech-to-text/page.tsx');
  assert.match(
    explainer,
    /What does automatic speech recognition actually do\?/u,
    'the explainer must answer how ASR works'
  );
  assert.match(
    explainer,
    /Why do some recordings transcribe badly/u,
    'the explainer must cover what drives accuracy'
  );
  assert.doesNotMatch(
    explainer,
    /What is the maximum upload file size\?/u,
    'file limits belong on the tool pages now'
  );
  assert.doesNotMatch(explainer, /Which file formats are supported for transcription\?/u);
});

test('the explainer does not compete for the HowTo intent', () => {
  // The same four steps appeared on three pages. The dedicated how-to page owns it.
  const explainer = read('src/app/speech-to-text/page.tsx');
  assert.doesNotMatch(explainer, /'@type': 'HowTo'/u);
  assert.match(
    read('src/app/speech-to-text/how-to-transcribe-audio/page.tsx'),
    /'@type': 'HowTo'/u,
    'the dedicated how-to page must keep the HowTo schema'
  );
});

test('all tool pages keep a self-referencing canonical path', () => {
  for (const slug of ['audio-to-text', 'video-to-text', 'mp3-to-text']) {
    assert.match(
      read(`src/app/${slug}/page.tsx`),
      new RegExp(`path: '/${slug}'`, 'u'),
      `${slug} must declare its literal canonical path`
    );
  }
  assert.match(read('src/app/speech-to-text/page.tsx'), /path: '\/speech-to-text'/u);
});