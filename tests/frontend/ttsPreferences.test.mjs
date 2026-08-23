import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TTS_PREFERENCES,
  TTS_PARAGRAPH_PAUSE_CONTROL,
  TTS_SENTENCE_PAUSE_CONTROL,
  TTS_SPEED_PRESETS,
  TTS_PREFERENCES_VERSION,
  estimateTtsDurationSeconds,
  formatEstimatedDuration,
  getDefaultTtsPreferences,
  parseTtsPreferences,
} from '../../src/lib/ttsPreferences.ts';
import { getVoicePreviewSource } from '../../src/lib/voicePreview.ts';
import { createTtsJob } from '../../src/lib/api.ts';

test('speed presets and reset defaults match the production control values', () => {
  assert.deepEqual(TTS_SPEED_PRESETS.map(({ value }) => value), [0.85, 1, 1.15]);
  const reset = getDefaultTtsPreferences();
  assert.deepEqual(reset, DEFAULT_TTS_PREFERENCES);
  assert.notEqual(reset, DEFAULT_TTS_PREFERENCES);
  assert.equal(reset.sentencePauseMs, 220);
  assert.equal(reset.paragraphPauseMs, 500);
  assert.equal((reset.sentencePauseMs - TTS_SENTENCE_PAUSE_CONTROL.min) % TTS_SENTENCE_PAUSE_CONTROL.step, 0);
  assert.equal((reset.paragraphPauseMs - TTS_PARAGRAPH_PAUSE_CONTROL.min) % TTS_PARAGRAPH_PAUSE_CONTROL.step, 0);
});

test('voice preview source depends on the selected voice, not editor or export state', () => {
  assert.equal(getVoicePreviewSource('af_heart'), '/audio/voice-previews/af_heart.mp3');
  assert.equal(
    getVoicePreviewSource('bf_emma', 'https://cdn.example.test/emma.mp3'),
    'https://cdn.example.test/emma.mp3',
  );
});

test('TTS preferences accept only the current bounded version', () => {
  const stored = {
    ...DEFAULT_TTS_PREFERENCES,
    voiceId: 'bf_emma',
    speed: 1.15,
    sentencePauseMs: 350,
    paragraphPauseMs: 750,
    normalizeText: false,
  };
  assert.deepEqual(parseTtsPreferences(JSON.stringify(stored)), stored);
  assert.equal(parseTtsPreferences(JSON.stringify({ ...stored, version: 0 })), null);
  assert.equal(parseTtsPreferences(JSON.stringify({ ...stored, speed: 4 })), null);
  assert.equal(parseTtsPreferences(JSON.stringify({ ...stored, paragraphPauseMs: 5000 })), null);
  assert.equal(TTS_PREFERENCES_VERSION, 1);
});

test('restored preferences and job payload preserve exact pause values', async () => {
  const restored = parseTtsPreferences(JSON.stringify(DEFAULT_TTS_PREFERENCES));
  assert.equal(restored?.sentencePauseMs, 220);
  assert.equal(restored?.paragraphPauseMs, 500);

  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(String(options?.body));
    return new Response(JSON.stringify({ jobId: 'job', accessToken: 'token', status: 'queued' }), { status: 200 });
  };

  try {
    await createTtsJob('Exact pause values.', 'af_heart', 'American English', 1, 'mp3', {
      sentencePauseMs: 220,
      paragraphPauseMs: 500,
      normalizeText: true,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(requestBody.sentencePauseMs, 220);
  assert.equal(requestBody.paragraphPauseMs, 500);
});

test('duration estimate responds to speed and configured pauses', () => {
  const text = 'First sentence. Second sentence.\n\nA new paragraph starts here.';
  const normal = estimateTtsDurationSeconds(text, 1, 220, 500);
  const fast = estimateTtsDurationSeconds(text, 1.15, 220, 500);
  const paused = estimateTtsDurationSeconds(text, 1, 800, 1200);

  assert.ok(fast < normal);
  assert.ok(paused > normal);
  assert.equal(estimateTtsDurationSeconds('', 1, 220, 500), 0);
  assert.match(formatEstimatedDuration(normal), /^~\d+m \d+s$/u);
});
