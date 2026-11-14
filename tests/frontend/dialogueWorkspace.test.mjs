import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDialogueJob } from '../../src/lib/api.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const builderPath = path.join(here, '..', '..', 'src', 'components', 'tools', 'DialogueBuilder.tsx');
const builderSource = fs.readFileSync(builderPath, 'utf8');
const workspacePath = path.join(here, '..', '..', 'src', 'components', 'tools', 'TtsWorkspace.tsx');
const workspaceSource = fs.readFileSync(workspacePath, 'utf8');

test('createDialogueJob posts segments to the dialogue-jobs endpoint', async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl;
  let requestBody;
  globalThis.fetch = async (url, options) => {
    requestUrl = String(url);
    requestBody = JSON.parse(String(options?.body));
    return new Response(JSON.stringify({ jobId: 'dlg-1', accessToken: 'token', status: 'queued' }), { status: 200 });
  };

  try {
    const result = await createDialogueJob(
      [
        { text: 'Welcome to the show.', voiceId: 'af_heart' },
        { text: 'Thanks for having me.', voiceId: 'am_adam' },
      ],
      1,
      'mp3',
      { sentencePauseMs: 220, paragraphPauseMs: 500, normalizeText: true },
    );
    assert.equal(result.jobId, 'dlg-1');
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.ok(requestUrl.endsWith('/tts/dialogue-jobs'), `expected dialogue-jobs URL, got ${requestUrl}`);
  assert.equal(requestBody.segments.length, 2);
  assert.equal(requestBody.segments[0].text, 'Welcome to the show.');
  assert.equal(requestBody.segments[0].voiceId, 'af_heart');
  assert.equal(requestBody.segments[1].voiceId, 'am_adam');
  assert.equal(requestBody.speed, 1);
  assert.equal(requestBody.outputFormat, 'mp3');
  assert.equal(requestBody.sentencePauseMs, 220);
  assert.equal(requestBody.normalizeText, true);
});

test('dialogue builder caps turns at 2–8 and total text at 2,000 characters', () => {
  assert.ok(builderSource.includes('DIALOGUE_MIN_SEGMENTS = 2'));
  assert.ok(builderSource.includes('DIALOGUE_MAX_SEGMENTS = 8'));
  assert.ok(builderSource.includes('DIALOGUE_MAX_CHARS = 2000'));
  assert.ok(builderSource.includes('segments.length >= DIALOGUE_MAX_SEGMENTS'));
  assert.ok(builderSource.includes('segments.length <= DIALOGUE_MIN_SEGMENTS'));
  // Combined counter, shown across all turns.
  assert.ok(builderSource.includes('characters total'));
  assert.ok(builderSource.includes('dialogueTotalChars(segments)'));
});

test('each dialogue turn has its own text and its own voice picker', () => {
  assert.ok(builderSource.includes('Turn {index + 1}'));
  assert.ok(builderSource.includes('aria-label={`Turn ${index + 1} text`}'));
  assert.ok(builderSource.includes('<VoicePicker'));
  assert.ok(builderSource.includes('onSelectVoice={(voiceId) => updateSegment(segment.key, { voiceId })}'));
  assert.ok(builderSource.includes('Add turn'));
  assert.ok(builderSource.includes('aria-label={`Remove turn ${index + 1}`}'));
});

test('studio offers a dialogue mode next to the single-voice editor', () => {
  assert.ok(workspaceSource.includes("useState<'single' | 'dialogue'>('single')"));
  assert.ok(workspaceSource.includes('Single voice'));
  assert.ok(workspaceSource.includes('Dialogue · two or more voices'));
  assert.ok(workspaceSource.includes('aria-label="Generation mode"'));
  assert.ok(workspaceSource.includes('<DialogueBuilder'));
  // The single editor and quick-start scripts stay single-mode only.
  assert.ok(workspaceSource.includes("{mode === 'single' && ("));
  assert.ok(workspaceSource.includes("mode === 'single' && (!text"));
});

test('dialogue submit uses one job, one quota charge, and the shared poll flow', () => {
  assert.ok(workspaceSource.includes('createDialogueJob('));
  assert.ok(workspaceSource.includes('handleDialogueSubmit'));
  // The whole dialogue is described to the poll chain as one job: combined
  // text for the history snippet, first turn's voice for analytics.
  assert.ok(workspaceSource.includes('startStatusPolling(jobData.jobId, jobData.accessToken, { text: combinedText, voiceId: firstVoiceId })'));
  // A turn without its own voice falls back to the studio voice.
  assert.ok(workspaceSource.includes('voiceId: segment.voiceId || resolvedVoiceId'));
  // Empty turns and over-limit dialogues are refused before any request.
  assert.ok(workspaceSource.includes('Every turn needs some text'));
  assert.ok(workspaceSource.includes('totalChars > DIALOGUE_MAX_CHARS'));
});

test('generate button labels and gates the dialogue separately', () => {
  assert.ok(workspaceSource.includes("mode === 'dialogue' ? 'Generate Dialogue' : 'Generate Speech'"));
  assert.ok(workspaceSource.includes("(mode === 'dialogue' && !dialogueValid)"));
  assert.ok(workspaceSource.includes('dialogueSegments.every((segment) => segment.text.trim().length > 0)'));
});
