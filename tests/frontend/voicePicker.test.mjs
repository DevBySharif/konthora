import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterVoicesForLanguage,
  groupVoicesByEngine,
  searchVoices,
  sortVoicesByEngine,
} from '../../src/lib/voicePicker.ts';

const LABELS = {
  'en-US': 'English',
  'bn-BD': 'Bengali',
  'hi-IN': 'Hindi',
};

const VOICES = [
  { id: 'af_heart', displayName: 'Heart', accent: 'American English', language: 'en-US', engine: 'kokoro', recommended: true, previewUrl: '/audio/af_heart.mp3' },
  { id: 'bf_emma', displayName: 'Emma', accent: 'British English', language: 'en-US', engine: 'kokoro', previewUrl: '/audio/bf_emma.mp3' },
  { id: 'am_adam', displayName: 'Adam', accent: 'American English', engine: 'kokoro', previewUrl: '/audio/am_adam.mp3' },
  { id: 'en-US-AndrewNeural', displayName: 'Andrew', accent: 'American English', language: 'en-US', engine: 'edge', recommended: true },
  { id: 'bn-BD-NabanitaNeural', displayName: 'Nabanita', accent: 'Bengali', language: 'bn-BD', engine: 'edge', recommended: true },
  { id: 'bn-BD-PradeepNeural', displayName: 'Pradeep', accent: 'Bengali', language: 'bn-BD', engine: 'edge' },
  { id: 'hi-IN-SwaraNeural', displayName: 'Swara', accent: 'Hindi', language: 'hi-IN', engine: 'edge' },
];

test('language filter keeps only that language, plus untagged voices for en-US', () => {
  const english = filterVoicesForLanguage(VOICES, 'en-US');
  assert.deepEqual(english.map((v) => v.id), ['af_heart', 'bf_emma', 'am_adam', 'en-US-AndrewNeural']);

  const bengali = filterVoicesForLanguage(VOICES, 'bn-BD');
  assert.deepEqual(bengali.map((v) => v.id), ['bn-BD-NabanitaNeural', 'bn-BD-PradeepNeural']);

  assert.deepEqual(
    filterVoicesForLanguage(VOICES, 'hi-IN').map((v) => v.id),
    ['hi-IN-SwaraNeural'],
  );
});

test('engine sort puts Edge first and keeps the order inside each group', () => {
  const english = filterVoicesForLanguage(VOICES, 'en-US');
  const sorted = sortVoicesByEngine(english);
  assert.deepEqual(
    sorted.map((v) => v.id),
    ['en-US-AndrewNeural', 'af_heart', 'bf_emma', 'am_adam'],
  );
  // Does not mutate the input.
  assert.deepEqual(
    english.map((v) => v.id),
    ['af_heart', 'bf_emma', 'am_adam', 'en-US-AndrewNeural'],
  );
});

test('search matches display name, accent and language, case-insensitively', () => {
  const english = sortVoicesByEngine(filterVoicesForLanguage(VOICES, 'en-US'));

  assert.deepEqual(searchVoices(english, 'emma', LABELS).map((v) => v.id), ['bf_emma']);
  assert.deepEqual(
    searchVoices(english, 'AMERICAN', LABELS).map((v) => v.id),
    ['en-US-AndrewNeural', 'af_heart', 'am_adam'],
  );
  assert.deepEqual(searchVoices(english, 'british', LABELS).map((v) => v.id), ['bf_emma']);
  // Language code and human label both match.
  const bengali = sortVoicesByEngine(filterVoicesForLanguage(VOICES, 'bn-BD'));
  assert.deepEqual(searchVoices(bengali, 'bn-bd', LABELS).map((v) => v.id), [
    'bn-BD-NabanitaNeural',
    'bn-BD-PradeepNeural',
  ]);
  assert.deepEqual(searchVoices(bengali, 'Bengali', LABELS).map((v) => v.id), [
    'bn-BD-NabanitaNeural',
    'bn-BD-PradeepNeural',
  ]);
  assert.deepEqual(searchVoices(english, 'english', LABELS).map((v) => v.id), [
    'en-US-AndrewNeural',
    'af_heart',
    'bf_emma',
    'am_adam',
  ]);
  assert.deepEqual(searchVoices(english, 'zzz', LABELS), []);
});

test('blank search returns every voice, in order', () => {
  const english = sortVoicesByEngine(filterVoicesForLanguage(VOICES, 'en-US'));
  const result = searchVoices(english, '   ', LABELS);
  assert.deepEqual(result.map((v) => v.id), english.map((v) => v.id));
  assert.notEqual(result, english);
});

test('engine grouping is Edge first, omits empty groups, and counts per group', () => {
  const english = sortVoicesByEngine(filterVoicesForLanguage(VOICES, 'en-US'));
  const groups = groupVoicesByEngine(english);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].engine, 'edge');
  assert.equal(groups[0].label, 'Edge');
  assert.equal(groups[0].voices.length, 1);
  assert.equal(groups[1].engine, 'kokoro');
  assert.equal(groups[1].label, 'Kokoro');
  assert.equal(groups[1].voices.length, 3);

  // A language with Edge voices only yields a single group.
  const bengali = sortVoicesByEngine(filterVoicesForLanguage(VOICES, 'bn-BD'));
  const single = groupVoicesByEngine(bengali);
  assert.equal(single.length, 1);
  assert.equal(single[0].engine, 'edge');
  assert.equal(single[0].voices.length, 2);

  assert.deepEqual(groupVoicesByEngine([]), []);

  // Search narrows the groups the same way the picker renders them.
  const searched = groupVoicesByEngine(searchVoices(english, 'british', LABELS));
  assert.equal(searched.length, 1);
  assert.equal(searched[0].engine, 'kokoro');
  assert.equal(searched[0].voices.length, 1);
});
