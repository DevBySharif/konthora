import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const audioToText = read('src/app/audio-to-text/page.tsx');
const speechToText = read('src/app/speech-to-text/page.tsx');
const howToAudio = read('src/app/speech-to-text/how-to-transcribe-audio/page.tsx');

test('the two transcription pages target different search intents', () => {
  // /speech-to-text was listed as "Crawled - currently not indexed" while
  // /audio-to-text carried the same 1,118 tokens. A near-duplicate pair competes
  // with itself, so each page must lead with its own intent.
  assert.match(
    audioToText,
    /title: 'Audio to Text Converter/u,
    '/audio-to-text must lead with the converter intent',
  );
  assert.match(
    speechToText,
    /title: 'What Is Speech to Text\?/u,
    '/speech-to-text must lead with the explanatory intent',
  );
});

test('only the tool page embeds the transcription workspace', () => {
  assert.match(
    audioToText,
    /<TranscriptionWorkspace \/>/u,
    'the converter page must offer the tool itself',
  );
  assert.doesNotMatch(
    speechToText,
    /<TranscriptionWorkspace \/>/u,
    'the explainer must not embed the tool; that is the tool page\'s job',
  );
});

test('schema types match each page role', () => {
  // SoftwareApplication belongs to the product page, TechArticle to the
  // explainer. Both pages previously claimed Article-style product schema.
  assert.match(
    audioToText,
    /constructSoftwareAppSchema/u,
    'the tool page must declare SoftwareApplication schema',
  );
  assert.match(
    speechToText,
    /'@type': 'TechArticle'/u,
    'the explainer must declare TechArticle schema',
  );
});

test('the HowTo for transcribing lives on exactly one page', () => {
  // Three pages carried the same four-step HowTo. The dedicated how-to page
  // owns that intent; the other two must not compete for it.
  assert.doesNotMatch(
    speechToText,
    /'@type': 'HowTo'/u,
    'the explainer must not declare HowTo; the how-to page owns it',
  );
  assert.match(
    howToAudio,
    /'@type': 'HowTo'/u,
    'the dedicated how-to page must keep the HowTo schema',
  );
});

test('the explainer hands the transaction to the tool page', () => {
  // Explicit intent routing. A reader who wants to transcribe a file should not
  // have to infer that a different page runs the tool.
  assert.match(
    speechToText,
    /audio-to-text converter/u,
    'the explainer must name the tool page in its opening',
  );
  assert.match(
    speechToText,
    /href="\/audio-to-text"/u,
    'the explainer must link to the tool page',
  );
});

test('the explainer answers concept questions rather than product steps', () => {
  // The old FAQ was six product FAQs identical in intent to the tool page. An
  // explainer should answer what the technology is and why results vary.
  assert.match(
    speechToText,
    /What does automatic speech recognition actually do\?/u,
    'the explainer must answer how ASR works',
  );
  assert.match(
    speechToText,
    /Why do some recordings transcribe badly/u,
    'the explainer must cover what drives accuracy',
  );
  assert.doesNotMatch(
    speechToText,
    /What is the maximum upload file size\?/u,
    'file limits belong on the tool page, not the explainer',
  );
  assert.doesNotMatch(
    speechToText,
    /Which file formats are supported for transcription\?/u,
    'format lists belong on the tool page',
  );
});

test('both pages keep a self-referencing canonical path', () => {
  assert.match(audioToText, /path: '\/audio-to-text'/u);
  assert.match(speechToText, /path: '\/speech-to-text'/u);
});
