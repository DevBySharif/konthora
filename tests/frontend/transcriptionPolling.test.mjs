import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isAbortError, isTimeoutError } from '../../src/lib/api.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspacePath = path.join(here, '..', '..', 'src', 'components', 'tools', 'TranscriptionWorkspace.tsx');
const source = fs.readFileSync(workspacePath, 'utf8');

test('a caller abort is recognised as an abort', () => {
  assert.equal(isAbortError(new DOMException('aborted', 'AbortError')), true);
  const err = new Error('aborted');
  err.name = 'AbortError';
  assert.equal(isAbortError(err), true);
});

test('a request timeout is NOT treated as a caller abort', () => {
  // The bug: the poll chain returned silently on TimeoutError, so the UI kept
  // showing "Processing…" forever and stopped asking about a running job.
  assert.equal(isAbortError(new DOMException('timed out', 'TimeoutError')), false);
  const err = new Error('timed out');
  err.name = 'TimeoutError';
  assert.equal(isAbortError(err), false);
  assert.equal(isTimeoutError(new DOMException('timed out', 'TimeoutError')), true);
  assert.equal(isTimeoutError(err), true);
});

test('a plain error is neither an abort nor a timeout', () => {
  assert.equal(isAbortError(new Error('boom')), false);
  assert.equal(isTimeoutError(new Error('boom')), false);
  assert.equal(isAbortError(null), false);
  assert.equal(isTimeoutError(undefined), false);
  assert.equal(isAbortError('nope'), false);
});

test('the poll chain reschedules itself after a retryable error', () => {
  // Regression guard: the old catch block set phase to 'failed' and returned
  // without arming the next timer, so a single slow response ended polling.
  const catchBlock = source.slice(source.indexOf('} catch (err) {', source.indexOf('const poll = async')));
  assert.match(catchBlock, /isAbortError\(err\)/u, 'caller aborts must still exit early');

  const retryArmed = catchBlock.indexOf('setTimeout(() => void poll(jobId, token)');
  const giveUp = catchBlock.indexOf('MAX_CONSECUTIVE_POLL_FAILURES');
  assert.ok(retryArmed !== -1, 'a retry timer must be armed after a retryable error');
  assert.ok(
    giveUp !== -1 && giveUp < retryArmed,
    'the give-up path must come before the retry path so only exhausting the ceiling stops polling',
  );
});

test('the poll chain does not mark a retryable error as a hard failure', () => {
  // Bound the slice to the poll catch block. Slicing to end-of-file pulled in
  // handleSubmit, which legitimately sets the failed phase on a real submit error.
  const start = source.indexOf('} catch (err) {', source.indexOf('const poll = async'));
  const catchBlock = source.slice(start, source.indexOf('// ── Submit', start));
  const ceiling = catchBlock.indexOf('MAX_CONSECUTIVE_POLL_FAILURES');
  const afterCeiling = catchBlock.slice(catchBlock.indexOf('return;', ceiling));

  assert.doesNotMatch(
    afterCeiling,
    /setPhase\('failed'\)/u,
    'after the give-up branch returns, a retryable error must not set the failed phase',
  );
  assert.match(
    catchBlock,
    /isTimeoutError\(err\)/u,
    'timeouts get a distinct slow-server message',
  );
  assert.match(
    afterCeiling,
    /setTimeout\(\(\) => void poll\(jobId, token\)/u,
    'the retry must re-arm the poll timer',
  );
});
