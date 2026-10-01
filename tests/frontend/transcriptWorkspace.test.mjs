import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTranscriptExportFiles,
  createTranscriptWorkspaceState,
  createTranscriptZip,
  findTranscriptMatches,
  formatDisplayTimestamp,
  formatTranscriptForCopy,
  isTranscriptDirty,
  sanitizeExportBaseName,
  transcriptWorkspaceReducer,
} from '../../src/lib/transcriptWorkspace.ts';

const segments = [
  { id: 0, text: 'Hello world.', start: 0, end: 1.5, words: [] },
  { id: 1, text: 'HELLO again from Konthora.', start: 1.5, end: 4, words: [] },
];

const context = {
  schemaVersion: '1.0',
  jobId: 'job-123',
  originalFileName: 'Example audio.mp3',
  durationSeconds: 4,
  detectedLanguage: 'en',
  languageProbability: 0.99,
  timestampMode: 'sentence',
  words: [],
};

test('segment edits preserve timing and support undo and revert', () => {
  let state = createTranscriptWorkspaceState(segments, 'Example audio.mp3');
  state = transcriptWorkspaceReducer(state, { type: 'begin-editing' });
  state = transcriptWorkspaceReducer(state, { type: 'edit-segment', segmentIndex: 0, text: 'Edited greeting.' });

  assert.equal(state.segments[0].text, 'Edited greeting.');
  assert.equal(state.segments[0].start, 0);
  assert.equal(state.segments[0].end, 1.5);
  assert.equal(isTranscriptDirty(state), true);

  state = transcriptWorkspaceReducer(state, { type: 'undo' });
  assert.equal(state.segments[0].text, 'Hello world.');
  assert.equal(isTranscriptDirty(state), false);

  state = transcriptWorkspaceReducer(state, { type: 'replace-all', query: 'hello', replacement: 'Welcome' });
  assert.equal(state.segments[0].text, 'Welcome world.');
  assert.equal(state.segments[1].text, 'Welcome again from Konthora.');
  state = transcriptWorkspaceReducer(state, { type: 'revert' });
  assert.deepEqual(state.segments.map((segment) => segment.text), segments.map((segment) => segment.text));
});

test('search and copy formatting are case-insensitive and presentation-only', () => {
  assert.equal(findTranscriptMatches(segments, 'hello').length, 2);
  assert.equal(findTranscriptMatches(segments, 'missing').length, 0);

  const plain = formatTranscriptForCopy(segments, 'plain', false, 'compact');
  const paragraphs = formatTranscriptForCopy(segments, 'paragraphs', false, 'compact');
  const timestamped = formatTranscriptForCopy(segments, 'plain', true, 'full');
  assert.equal(plain, 'Hello world. HELLO again from Konthora.');
  assert.equal(paragraphs, 'Hello world.\n\nHELLO again from Konthora.');
  assert.match(timestamped, /^\[00:00:00\] Hello world\./u);
  assert.equal(formatDisplayTimestamp(83, 'compact'), '[01:23]');
  assert.equal(formatDisplayTimestamp(83, 'full'), '[00:01:23]');
  assert.equal(formatDisplayTimestamp(3661, 'compact'), '[01:01:01]');
});

test('replace one changes one match and dirty results require discard confirmation', () => {
  let state = createTranscriptWorkspaceState(segments, 'Example audio.mp3');
  const [firstMatch] = findTranscriptMatches(state.segments, 'hello');
  state = transcriptWorkspaceReducer(state, {
    type: 'replace-one',
    match: firstMatch,
    replacement: 'Welcome',
  });
  assert.equal(state.segments[0].text, 'Welcome world.');
  assert.equal(state.segments[1].text, 'HELLO again from Konthora.');
  assert.equal(isTranscriptDirty(state), true);
  state = transcriptWorkspaceReducer(state, { type: 'revert' });
  assert.equal(isTranscriptDirty(state), false);
});

test('all export formats use edited text and keep timing data', () => {
  let state = createTranscriptWorkspaceState(segments, 'Example audio.mp3');
  state = transcriptWorkspaceReducer(state, { type: 'begin-editing' });
  state = transcriptWorkspaceReducer(state, { type: 'edit-segment', segmentIndex: 1, text: 'Corrected Konthora text.' });
  const files = createTranscriptExportFiles(context, state.segments, 'My custom export');

  assert.equal(files.txt.name, 'My-custom-export.txt');
  assert.match(files.txt.content, /Corrected Konthora text\./u);
  assert.doesNotMatch(files.txt.content, /CorrectedKonthoratext/u);
  assert.match(files.srt.content, /00:00:01,500 --> 00:00:04,000/u);
  assert.match(files.srt.content, /Corrected Konthora text\./u);
  assert.match(files.vtt.content, /^WEBVTT/u);
  assert.match(files.vtt.content, /Corrected Konthora text\./u);
  const json = JSON.parse(files.json.content);
  assert.equal(json.edited, true);
  assert.equal(json.segments[1].text, 'Corrected Konthora text.');
  assert.match(json.fullText, /Hello world\. Corrected Konthora text\./u);
  assert.doesNotMatch(json.fullText, /Helloworld/u);
  assert.equal(json.segments[1].start, 1.5);
  assert.equal(json.segments[1].end, 4);
  assert.equal(json.segments[1].edited, true);
});

test('custom names are sanitized and ZIP contains four local file entries', async () => {
  assert.equal(sanitizeExportBaseName('../../ unsafe name?.mp3'), 'unsafe-name-mp3');
  const files = Object.values(createTranscriptExportFiles(context, createTranscriptWorkspaceState(segments, 'audio.mp3').segments, 'bundle'));
  const zip = createTranscriptZip(files);
  const bytes = new Uint8Array(await zip.arrayBuffer());
  let localEntries = 0;
  for (let index = 0; index <= bytes.length - 4; index += 1) {
    if (bytes[index] === 0x50 && bytes[index + 1] === 0x4b && bytes[index + 2] === 0x03 && bytes[index + 3] === 0x04) {
      localEntries += 1;
    }
  }
  assert.equal(localEntries, 4);
  assert.equal(zip.type, 'application/zip');
  assert.ok(zip.size > 100);
});

test('replace-all treats $ patterns in the replacement as literal text', () => {
  // A replacement string made "$&", "$1", "$$" and "$`" act as substitution
  // patterns, so typing them into "Replace with" silently produced garbage.
  const source = 'start word other';
  const cases = ['$&', '$1', '$$', '$`', "$'", '$0', '$&-$1-$$'];

  for (const replacement of cases) {
    const state = createTranscriptWorkspaceState(
      [{ id: 0, text: source, start: 0, end: 1, words: [] }],
      'audio.mp3',
    );
    const next = transcriptWorkspaceReducer(state, {
      type: 'replace-all',
      query: 'word',
      replacement,
    });
    assert.equal(
      next.segments[0].text,
      `start ${replacement} other`,
      `replacement ${replacement} should be inserted literally`,
    );
  }
});

test('replace-all also escapes regex metacharacters in the query', () => {
  const state = createTranscriptWorkspaceState(
    [{ id: 0, text: 'a+b and axb and a.b', start: 0, end: 1, words: [] }],
    'audio.mp3',
  );
  const plus = transcriptWorkspaceReducer(state, { type: 'replace-all', query: 'a+b', replacement: 'X' });
  assert.equal(plus.segments[0].text, 'X and axb and a.b');
  const dot = transcriptWorkspaceReducer(state, { type: 'replace-all', query: 'a.b', replacement: 'X' });
  assert.equal(dot.segments[0].text, 'a+b and axb and X');
});

test('search offsets index the original text so replace-one is lossless', () => {
  // Lowercasing a copy can change string length, so offsets taken from the
  // lowercased copy did not line up with the original text. "İzmir then i"
  // lowercases to 13 code units, which made the old code report a match at
  // 4..5 for the query "i" (really the letter "r") and 7..11 for "then"
  // (really "hen "), so replace-one edited the wrong characters.
  const source = 'İzmir then i';

  const letterMatches = findTranscriptMatches([{ id: 0, text: source, start: 0, end: 1, words: [] }], 'i');
  for (const match of letterMatches) {
    assert.equal(source.slice(match.start, match.end), 'i');
  }

  const [thenMatch] = findTranscriptMatches([{ id: 0, text: source, start: 0, end: 1, words: [] }], 'then');
  assert.equal(source.slice(thenMatch.start, thenMatch.end), 'then');

  // And the end-to-end result must be exactly what the user asked for.
  const state = createTranscriptWorkspaceState([{ id: 0, text: source, start: 0, end: 1, words: [] }], 'audio.mp3');
  const next = transcriptWorkspaceReducer(state, { type: 'replace-one', match: thenMatch, replacement: 'X' });
  assert.equal(next.segments[0].text, 'İzmir X i');
});

test('every search match slices back to the query it was found for', () => {
  const corpus = [
    { id: 0, text: 'INDEX of the report', start: 0, end: 1, words: [] },
    { id: 1, text: 'Turkish İstanbul is here', start: 1, end: 2, words: [] },
    { id: 2, text: 'Straße and STRASSE', start: 2, end: 3, words: [] },
    { id: 3, text: 'ĲSSELMEER and IJSSELMEER', start: 3, end: 4, words: [] },
  ];

  for (const segment of corpus) {
    for (const query of ['index', 'istanbul', 'i', 'ß', 'ss', 'ij', 'MEER']) {
      for (const match of findTranscriptMatches([segment], query)) {
        assert.equal(
          segment.text.slice(match.start, match.end).toLowerCase(),
          query.toLowerCase(),
          `offset mismatch for ${JSON.stringify(query)} in ${JSON.stringify(segment.text)}`,
        );
      }
    }
  }
});

test('case-insensitive search does not depend on the host locale', () => {
  const turkishSegments = [{ id: 0, text: 'FILE index', start: 0, end: 1, words: [] }];
  const previousLocale = process.env.LC_ALL ?? process.env.LANG;
  try {
    process.env.LC_ALL = 'tr_TR.UTF-8';
    assert.equal(findTranscriptMatches(turkishSegments, 'file').length, 1);
    assert.equal(findTranscriptMatches(turkishSegments, 'index').length, 1);
  } finally {
    if (previousLocale === undefined) {
      delete process.env.LC_ALL;
    } else {
      process.env.LC_ALL = previousLocale;
    }
  }
});
