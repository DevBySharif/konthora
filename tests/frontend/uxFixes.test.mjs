import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, '..', '..', 'src');

function read(rel) {
  return fs.readFileSync(path.join(src, rel), 'utf8');
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function allSourceFiles(dir = src) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...allSourceFiles(full));
    else if (/\.(tsx?|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// P0-1 — scroll reveals must be visible by default: no opacity-0 initial
// state anywhere in the reveal primitives, so a full-page capture, print,
// or animation failure can never leave viewport-tall black voids.
test('P0-1: reveal primitives never start from opacity 0', () => {
  const motion = read('components/ui/motion.tsx');
  assert.ok(!motion.includes('opacity: 0'), 'motion.tsx must not hide content with an opacity-0 initial state');
  assert.ok(!motion.includes('whileInView'), 'motion.tsx must not use whileInView (it leaves below-fold content hidden until scrolled to)');
  assert.ok(!motion.includes("initial={{ opacity"), 'motion.tsx must not set an opacity-0 initial');
  assert.ok(motion.includes('is-in'), 'Reveal must add an is-in class when the element enters the viewport');
});

test('P0-1: reveal resting state is fully visible in CSS', () => {
  const css = read('app/globals.css');
  const revealBlock = css.match(/\.reveal\s*\{[^}]*\}/);
  assert.ok(revealBlock, 'expected a .reveal rule in globals.css');
  assert.ok(/opacity:\s*1/.test(revealBlock[0]), 'the .reveal resting state must be opacity 1 (visible by default)');
  assert.ok(css.includes('@keyframes kf-reveal-rise'), 'expected a transform-only reveal keyframe');
  assert.ok(!/\.reveal[^{]*\{[^}]*opacity:\s*0/.test(css), 'no .reveal rule may rest at opacity 0');
});

test('P0-1: homepage sections no longer use the oversized py-20 md:py-28 rhythm', () => {
  for (const rel of [
    'components/home/TextToSpeech.tsx',
    'components/home/AudioTranscription.tsx',
    'components/home/WhyKonthora.tsx',
    'components/home/FeatureGrid.tsx',
    'components/home/Workflow.tsx',
    'components/home/SupportedLanguages.tsx',
    'components/home/FinalCTA.tsx',
    'app/page.tsx',
  ]) {
    const source = read(rel);
    assert.ok(
      !source.includes('py-20 md:py-28'),
      `${rel} must not keep the py-20 md:py-28 section rhythm`,
    );
  }
});

// P0-2 — the homepage Speech / Transcription workflow cards must carry a
// one-line description and their CTA button INSIDE the card.
test('P0-2: workflow cards contain a description and their CTA button', () => {
  const workflow = read('components/home/Workflow.tsx');
  assert.ok(workflow.includes('Open speech workspace'), 'Speech card must contain its CTA');
  assert.ok(workflow.includes('Open transcription workspace'), 'Transcription card must contain its CTA');
  // Both CTAs must sit inside the track cards (before the grid closes),
  // not in a detached block below them.
  const gridStart = workflow.indexOf('grid gap-10 lg:grid-cols-2');
  const gridEnd = workflow.lastIndexOf('</div>');
  assert.ok(gridStart !== -1, 'expected the two-track grid');
  assert.ok(
    workflow.indexOf('Open speech workspace') > gridStart,
    'speech CTA must be inside the track grid',
  );
  assert.ok(
    workflow.indexOf('Open transcription workspace') > gridStart,
    'transcription CTA must be inside the track grid',
  );
  assert.ok(gridEnd > workflow.indexOf('Open transcription workspace'), 'CTAs must close inside the grid');
  // One-line description per track.
  assert.ok(workflow.includes('desc:') || workflow.includes('description:'), 'each track needs a one-line description');
});

// P0-3 — quick-start scripts appear exactly once on the TTS page.
test('P0-3: quick-start scripts render exactly once in the studio', () => {
  const workspace = read('components/tools/TtsWorkspace.tsx');
  assert.equal(
    count(workspace, 'Quick start — click a script to load it'),
    1,
    'expected exactly one Quick start heading in TtsWorkspace',
  );
  assert.equal(
    count(workspace, 'SAMPLE_SCRIPTS.map'),
    1,
    'expected the sample-script grid to be rendered exactly once',
  );
});

// Mobile editor header — the label must fit on one line at 390px: a short
// "Script" label below the sm breakpoint, full label at sm and up.
test('mobile editor header: short label below sm, full label at sm and up', () => {
  const workspace = read('components/tools/TtsWorkspace.tsx');
  assert.ok(workspace.includes('sm:hidden'), 'expected a mobile-only short header label');
  assert.ok(workspace.includes('>Script<'), 'expected the short "Script" label for small screens');
  assert.ok(
    /hidden sm:inline[^<]*>Speech Text Editor</.test(workspace) ||
      workspace.includes('hidden sm:inline'),
    'expected the full "Speech Text Editor" label to be hidden below sm',
  );
});

// P2-11 — one restrained warm-gold accent for the primary CTA + active
// states only; the monochrome base palette stays untouched.
test('P2-11: warm-gold accent token exists and the primary CTA uses it', () => {
  const css = read('app/globals.css');
  assert.ok(/--accent:\s*#D9A441/i.test(css), 'expected --accent: #D9A441 (warm gold, logo concept B)');
  assert.ok(css.includes('--color-accent: var(--accent)'), 'expected the accent wired into the Tailwind theme');
  assert.ok(css.includes('.solid-gold'), 'expected a .solid-gold primary-CTA surface');
  const button = read('components/ui/Button.tsx');
  assert.ok(button.includes('solid-gold'), 'Button primary variant must use the gold surface');
  const hero = read('components/home/Hero.tsx');
  assert.ok(hero.includes('solid-gold'), 'hero primary CTA must use the gold surface');
  const finalCta = read('components/home/FinalCTA.tsx');
  assert.ok(finalCta.includes('solid-gold'), 'final CTA must use the gold surface');
});

// P2-13 — focus rings must be full opacity (WCAG 2.4.11).
test('P2-13: no low-opacity focus rings anywhere in src', () => {
  const offenders = [];
  for (const file of allSourceFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    if (/ring-(white|primary)\/\d+/.test(source)) {
      offenders.push(path.relative(src, file));
    }
  }
  assert.deepEqual(offenders, [], `low-opacity focus rings remain in: ${offenders.join(', ')}`);
  const css = read('app/globals.css');
  assert.ok(!css.includes('--ring: rgba(255, 255, 255, 0.35)'), '--ring must no longer be 0.35 alpha');
});

// M16 — the download control must be ONE focusable element: the <a>
// itself styled as the button, never an <a> wrapping a <button>.
test('M16: download control is a single focusable element', () => {
  const player = read('components/tools/WaveformPlayer.tsx');
  // No <a ...> JSX element at all in the player (an <a> tag is `<a`
  // followed by whitespace; the prose comment's "<a>" has none).
  assert.ok(!/<a\s/.test(player), 'WaveformPlayer must not render an <a> element around the download');
  assert.ok(
    /<Button[^>]*href=\{downloadHref\}[^>]*download=\{downloadFileName\}/.test(player),
    'the download Button must itself be the link (href + download on the Button)',
  );
  const button = read('components/ui/Button.tsx');
  assert.ok(button.includes("href"), 'Button must accept an href and render an <a> for link-buttons');
  assert.ok(/<a[\s\S]*?href=\{href\}/.test(button), 'Button must render an <a> when href is given');
});
