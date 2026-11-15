import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspacePath = path.join(here, '..', '..', 'src', 'components', 'tools', 'TtsWorkspace.tsx');
const workspaceSource = fs.readFileSync(workspacePath, 'utf8');

// Three-column (Layout J, supersedes Split Studio / Layout A): language +
// voice picker on the left, editor + generated audio in the center, settings
// + recent history on the right; a single stacked column on mobile with the
// center (editor) first via order classes. These tests pin the structure so
// a later edit cannot silently collapse the studio or strand a block in the
// wrong column.

test('studio uses a three-column grid on desktop and stacks on mobile', () => {
  assert.ok(
    workspaceSource.includes('lg:grid-cols-[300px_minmax(0,1fr)_300px]'),
    'expected the 300px / 1fr / 300px desktop grid',
  );
  // No lg: prefix on the base grid: below the lg breakpoint the grid is a
  // single column, center (editor) first, then left, then right.
  const gridClass = workspaceSource.match(/className="grid[^"]*lg:grid-cols-\[300px_minmax\(0,1fr\)_300px\][^"]*"/);
  assert.ok(gridClass, 'expected one grid carrying the desktop three-column classes');
  assert.ok(!gridClass[0].includes('grid-cols-2') && !gridClass[0].includes('grid-cols-3'), 'mobile must stay a single stacked column');
  assert.ok(!workspaceSource.includes('lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'), 'the old two-column grid must be gone');
});

test('mobile stacking order is center, then left, then right', () => {
  const left = workspaceSource.indexOf('Left column: language + voice picker');
  const center = workspaceSource.indexOf('Center column: mode, editor, generate, generated audio');
  const right = workspaceSource.indexOf('Right column: settings + recent history');
  assert.ok(left !== -1 && center !== -1 && right !== -1, 'expected all three column marker comments');
  assert.ok(workspaceSource.includes('order-2 min-w-0 space-y-6 lg:order-1'), 'left column stacks second on mobile, first on desktop');
  assert.ok(workspaceSource.includes('order-1 min-w-0 space-y-6 lg:order-2'), 'center column stacks first on mobile, second on desktop');
  assert.ok(workspaceSource.includes('order-3 min-w-0 space-y-6'), 'right column stacks third on mobile');
});

test('all three grid columns allow shrinking so long content cannot overflow', () => {
  const columns = workspaceSource.match(/className="order-[123] min-w-0[^"]*"/g) ?? [];
  assert.equal(columns.length, 3, `expected 3 min-w-0 grid columns, found ${columns.length}`);
});

test('language and voice picker live in the left column', () => {
  const pickerUses = workspaceSource.match(/<VoicePicker/g) ?? [];
  assert.equal(pickerUses.length, 1, 'expected exactly one VoicePicker in the studio');
  const pickerIndex = workspaceSource.indexOf('<VoicePicker');
  const leftColumnIndex = workspaceSource.indexOf('Left column: language + voice picker');
  const centerColumnIndex = workspaceSource.indexOf('Center column: mode, editor, generate, generated audio');
  assert.ok(pickerIndex > leftColumnIndex && pickerIndex < centerColumnIndex, 'picker must sit inside the left column');
  const languageIndex = workspaceSource.indexOf('tts-language-label');
  assert.ok(languageIndex > leftColumnIndex && languageIndex < pickerIndex, 'language selector must sit above the voice picker in the left column');
});

test('editor, generate flow and output live in the center column', () => {
  const centerColumnIndex = workspaceSource.indexOf('Center column: mode, editor, generate, generated audio');
  const rightColumnIndex = workspaceSource.indexOf('Right column: settings + recent history');
  for (const needle of ['id="tts-text-input"', 'Generate Speech', 'Generated Audio', '<WaveformPlayer']) {
    const at = workspaceSource.indexOf(needle);
    assert.ok(at > centerColumnIndex && at < rightColumnIndex, `expected ${needle} inside the center column`);
  }
  // The generated-audio area follows the form (editor + generate) in the
  // center column, not the voice picker.
  const formCloseIndex = workspaceSource.indexOf('</form>');
  const audioIndex = workspaceSource.indexOf('Generated Audio');
  assert.ok(audioIndex > formCloseIndex, 'generated audio must render after the form closes');
});

test('settings and recent generations live in the right column', () => {
  const rightColumnIndex = workspaceSource.indexOf('Right column: settings + recent history');
  for (const needle of ['Speech Speed', 'Pauses &amp; text', 'Output Format', 'Recent generations']) {
    const at = workspaceSource.indexOf(needle);
    assert.ok(at > rightColumnIndex, `expected ${needle} inside the right column`);
  }
  // The settings card holds speed, format and pauses — none of them may
  // still live inside the form in the center column.
  const formCloseIndex = workspaceSource.indexOf('</form>');
  const speedIndex = workspaceSource.indexOf('Speech Speed');
  assert.ok(speedIndex > formCloseIndex, 'speed control must be outside the form (right column)');
});
