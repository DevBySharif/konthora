import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspacePath = path.join(here, '..', '..', 'src', 'components', 'tools', 'TtsWorkspace.tsx');
const workspaceSource = fs.readFileSync(workspacePath, 'utf8');

// Split Studio (Layout A): two columns on desktop, one stacked column on
// mobile. These tests pin the structure so a later edit cannot silently
// collapse the studio back to a single column or strand the voice picker
// in the controls card.

test('studio uses a two-column grid on desktop and stacks on mobile', () => {
  assert.ok(
    workspaceSource.includes('lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'),
    'expected the 1.55fr / 1fr desktop grid',
  );
  // No lg: prefix on the base grid: below the lg breakpoint the grid is a
  // single column, editor first, voice/audio below.
  const gridClass = workspaceSource.match(/className="grid[^"]*lg:grid-cols-\[minmax\(0,1\.55fr\)_minmax\(0,1fr\)\][^"]*"/);
  assert.ok(gridClass, 'expected one grid carrying the desktop two-column classes');
  assert.ok(!gridClass[0].includes('grid-cols-2'), 'mobile must stay a single stacked column');
});

test('both grid columns allow shrinking so long content cannot overflow', () => {
  const columns = workspaceSource.match(/className="min-w-0[^"]*"/g) ?? [];
  // Left column, right column, and the output area inside the right column.
  assert.ok(columns.length >= 3, `expected at least 3 min-w-0 containers, found ${columns.length}`);
});

test('voice picker lives in the right column, not in the controls card', () => {
  const pickerUses = workspaceSource.match(/<VoicePicker/g) ?? [];
  assert.equal(pickerUses.length, 1, 'expected exactly one VoicePicker in the studio');
  const pickerIndex = workspaceSource.indexOf('<VoicePicker');
  const rightColumnIndex = workspaceSource.indexOf('Right column: voice picker');
  const formCloseIndex = workspaceSource.indexOf('</form>');
  assert.ok(rightColumnIndex !== -1, 'expected the right-column marker comment');
  assert.ok(formCloseIndex !== -1 && pickerIndex > formCloseIndex, 'picker must render after the form (left column) closes');
  assert.ok(pickerIndex > rightColumnIndex, 'picker must sit inside the right column');
});

test('editor, generate flow and output all survive the split', () => {
  for (const needle of [
    'id="tts-text-input"',
    'Generate Speech',
    'Generated Audio',
    'Recent generations',
    'WaveformPlayer',
    'Speech Speed',
    'Pauses &amp; text',
    'Output Format',
  ]) {
    assert.ok(workspaceSource.includes(needle), `expected the studio to still render ${needle}`);
  }
  // The output area is a right-column item now, not a full-width section
  // separated from the form by a top border.
  assert.ok(!workspaceSource.includes('mt-8 pt-7 border-t border-border/60'), 'output area must not keep the old full-width separator');
});
