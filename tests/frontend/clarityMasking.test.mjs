import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(here, '..', '..');

const read = (rel) => fs.readFileSync(path.join(repo, rel), 'utf8');

const analytics = read('src/components/analytics/Analytics.tsx');
const ttsWorkspace = read('src/components/tools/TtsWorkspace.tsx');
const transcriptionWorkspace = read('src/components/tools/TranscriptionWorkspace.tsx');
const resultPanel = read('src/components/tools/TranscriptionResultPanel.tsx');
const privacyPolicy = read('src/app/privacy-policy/page.tsx');

// H2: Clarity session replay must not record user content — the TTS script
// textarea, the rendered transcript, or uploaded file names. Clarity has
// no JS masking API: masking is the `data-clarity-mask` attribute, so
// Analytics.tsx tags the live DOM (the studio components are owned by the
// UX track, so the tagger anchors on their stable ids / aria labels and
// re-tags nodes as React renders them). Replay itself stays enabled.
//
// The anchors below are pinned by this test: if a studio component renames
// one, this test fails and the tagger must be updated with it — masking
// must never silently stop working.

test('Analytics tags the TTS script textarea for Clarity masking', () => {
  assert.match(ttsWorkspace, /id="tts-text-input"/, 'TTS textarea anchor is gone');
  assert.ok(
    analytics.includes('#tts-text-input'),
    'Analytics.tsx must tag #tts-text-input with data-clarity-mask',
  );
});

test('Analytics tags the rendered transcript for Clarity masking', () => {
  assert.match(
    resultPanel,
    /aria-label="Editable timestamped transcript"/,
    'transcript panel anchor is gone',
  );
  assert.ok(
    analytics.includes('[aria-label="Editable timestamped transcript"]'),
    'Analytics.tsx must tag the transcript panel with data-clarity-mask',
  );
});

test('Analytics tags uploaded file names for Clarity masking', () => {
  // Result panel: the file name lives in the "Source media" section.
  assert.match(
    resultPanel,
    /aria-labelledby="source-media-heading"/,
    'result-panel file-name anchor is gone',
  );
  assert.ok(
    analytics.includes('[aria-labelledby="source-media-heading"]'),
    'Analytics.tsx must tag the result-panel file name with data-clarity-mask',
  );
  // Upload card: the file name span is anchored off the file input.
  assert.match(
    transcriptionWorkspace,
    /id="transcription-file-picker"/,
    'transcription file-picker anchor is gone',
  );
  assert.match(
    transcriptionWorkspace,
    /<span className="text-sm font-semibold text-foreground block truncate">\{form\.file\.name\}<\/span>/,
    'upload-card file-name anchor is gone',
  );
  assert.ok(
    analytics.includes("getElementById('transcription-file-picker')"),
    'Analytics.tsx must tag the upload-card file name with data-clarity-mask',
  );
});

test('Analytics applies masking at runtime, not just on first render', () => {
  assert.ok(
    analytics.includes('data-clarity-mask'),
    'Analytics.tsx must set the data-clarity-mask attribute',
  );
  assert.ok(
    analytics.includes('MutationObserver'),
    'masking must re-tag nodes as React renders them (transcript / file card appear after user actions)',
  );
});

test('Clarity replay stays enabled and the policy wording matches the masked reality', () => {
  // No disabling replay: the Clarity loader must still render.
  assert.ok(
    analytics.includes('<ClarityAnalytics projectId={CLARITY_PROJECT_ID} />'),
    'Clarity must stay enabled (H2 masks content, it does not disable replay)',
  );
  assert.ok(!analytics.includes('clarity("stop")'), 'replay must not be stopped');
  // With the content masked, the policy sentence is true as written.
  assert.match(
    privacyPolicy,
    /These analytics do not inspect the content of your text scripts or media uploads/,
    'privacy policy must state analytics do not inspect script/media content',
  );
});
