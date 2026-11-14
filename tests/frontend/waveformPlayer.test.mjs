import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computePeaks } from '../../src/lib/waveform.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const playerPath = path.join(here, '..', '..', 'src', 'components', 'tools', 'WaveformPlayer.tsx');
const playerSource = fs.readFileSync(playerPath, 'utf8');
const workspacePath = path.join(here, '..', '..', 'src', 'components', 'tools', 'TtsWorkspace.tsx');
const workspaceSource = fs.readFileSync(workspacePath, 'utf8');

test('computePeaks reduces a channel to one normalised peak per bar', () => {
  // One loud sample in the first half, silence elsewhere.
  const channel = new Float32Array(1000);
  channel[100] = 0.5;
  channel[200] = -1.0;
  const peaks = computePeaks(channel, 10);
  assert.equal(peaks.length, 10);
  assert.equal(peaks[1], 0.5); // bar 1 holds the 0.5 sample, scaled by global max 1.0
  assert.equal(peaks[2], 1); // bar 2 holds the -1.0 sample, normalised to 1
  assert.equal(peaks[5], 0);
  assert.ok(peaks.every((p) => p >= 0 && p <= 1));
});

test('computePeaks returns a flat zero row for empty or silent input', () => {
  assert.deepEqual(computePeaks(new Float32Array(0), 10), new Array(10).fill(0));
  assert.deepEqual(computePeaks(new Float32Array(100), 4), [0, 0, 0, 0]);
  assert.deepEqual(computePeaks(new Float32Array([0.2, 0.4]), 0), []);
});

test('waveform player decodes audio, scrubs, and changes playback speed', () => {
  assert.ok(playerSource.includes('decodeAudioData'), 'waveform must come from the decoded audio');
  assert.ok(playerSource.includes('AudioContext'), 'decoding needs a Web Audio context');
  assert.ok(playerSource.includes('FLAT_PEAKS'), 'a flat row must show while decoding or on failure');
  assert.ok(playerSource.includes('role="slider"'), 'waveform must be keyboard-seekable');
  assert.ok(playerSource.includes('ArrowLeft') && playerSource.includes('ArrowRight'));
  assert.ok(playerSource.includes('playbackRate'), 'speed control must drive the shared audio element');
  assert.ok(playerSource.includes('0.75') && playerSource.includes('1.25'));
  assert.ok(playerSource.includes('onPointerDown'), 'click-to-scrub');
  // The player never creates its own audio element — it drives the parent's.
  assert.ok(!playerSource.includes('new Audio('), 'player must not create an audio element');
  assert.ok(!playerSource.includes("createElement('audio')"), 'player must not create an audio element');
});

test('studio renders the waveform player for generated audio', () => {
  assert.ok(workspaceSource.includes('<WaveformPlayer'));
  assert.ok(workspaceSource.includes('audioRef={audioPlayerRef}'));
  assert.ok(workspaceSource.includes('onTogglePlay={togglePlayPause}'));
  // The bare player is gone: no play button or standalone download in the
  // completed block — the waveform owns both now.
  assert.ok(!workspaceSource.includes("aria-label={isPlaying ? 'Pause generated speech' : 'Play generated speech'}"));
});
