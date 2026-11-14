import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ApiError,
  createTranscriptionJobWithProgress,
  isAbortError,
  isTimeoutError,
} from '../../src/lib/api.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspacePath = path.join(here, '..', '..', 'src', 'components', 'tools', 'TranscriptionWorkspace.tsx');
const source = fs.readFileSync(workspacePath, 'utf8');

// ── Fake XMLHttpRequest ───────────────────────────────────────────────────────
// The upload path is XHR-based (fetch cannot report upload progress), so the
// tests drive a stub instead of the network. Each instance is recorded so the
// test can fire its handlers after the call under test has been made.

const instances = [];

class FakeXMLHttpRequest {
  constructor() {
    this.method = null;
    this.url = null;
    this.requestHeaders = new Map();
    this.responseType = '';
    this.timeout = 0;
    this.status = 0;
    this.response = null;
    this.sentBody = null;
    this.upload = { onprogress: null };
    this.onload = null;
    this.onerror = null;
    this.ontimeout = null;
    this.onabort = null;
    this.responseHeaders = new Map();
    instances.push(this);
  }

  open(method, url) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name, value) {
    this.requestHeaders.set(name.toLowerCase(), value);
  }

  getResponseHeader(name) {
    return this.responseHeaders.get(name.toLowerCase()) ?? null;
  }

  send(body) {
    this.sentBody = body;
  }

  abort() {
    if (this.onabort) this.onabort();
  }
}

function installFakeXhr() {
  instances.length = 0;
  globalThis.XMLHttpRequest = FakeXMLHttpRequest;
}

function uninstallFakeXhr() {
  delete globalThis.XMLHttpRequest;
}

function makeFile() {
  return new File(['fake audio bytes'], 'interview.mp3', { type: 'audio/mpeg' });
}

function lastInstance() {
  assert.equal(instances.length, 1, 'exactly one XHR should have been created');
  return instances[0];
}

test('XHR upload posts to the transcription endpoint and reports progress', async () => {
  installFakeXhr();
  try {
    const seen = [];
    const promise = createTranscriptionJobWithProgress(makeFile(), 'auto', 'sentence', 'txt', {
      onProgress: (progress) => seen.push(progress),
    });
    const xhr = lastInstance();
    assert.equal(xhr.method, 'POST');
    assert.match(xhr.url, /\/transcription\/jobs$/u);
    assert.equal(xhr.responseType, 'json');
    assert.ok(xhr.sentBody instanceof FormData, 'the file must go up as multipart FormData');

    xhr.upload.onprogress({ lengthComputable: true, loaded: 25, total: 100 });
    xhr.upload.onprogress({ lengthComputable: true, loaded: 100, total: 100 });
    assert.deepEqual(seen, [
      { loaded: 25, total: 100 },
      { loaded: 100, total: 100 },
    ]);

    xhr.status = 201;
    xhr.response = { jobId: 'job-1', accessToken: 'token-1', status: 'queued' };
    xhr.onload();
    assert.deepEqual(await promise, { jobId: 'job-1', accessToken: 'token-1', status: 'queued' });
  } finally {
    uninstallFakeXhr();
  }
});

test('XHR upload keeps the dev-bypass header and the 120s deadline', async () => {
  const previousKey = process.env.NEXT_PUBLIC_DEV_BYPASS_KEY;
  process.env.NEXT_PUBLIC_DEV_BYPASS_KEY = 'dev-key-for-test';
  installFakeXhr();
  try {
    const promise = createTranscriptionJobWithProgress(makeFile(), 'auto', 'sentence', 'txt');
    const xhr = lastInstance();
    assert.equal(xhr.requestHeaders.get('x-dev-bypass-key'), 'dev-key-for-test');
    assert.equal(xhr.requestHeaders.get('accept'), 'application/json');
    assert.equal(xhr.timeout, 120_000, 'the XHR deadline must match the fetch path (REQUEST_TIMEOUT_MS.long)');

    xhr.status = 201;
    xhr.response = { jobId: 'job-2', accessToken: 'token-2', status: 'queued' };
    xhr.onload();
    await promise;
  } finally {
    uninstallFakeXhr();
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_DEV_BYPASS_KEY;
    else process.env.NEXT_PUBLIC_DEV_BYPASS_KEY = previousKey;
  }
});

test('XHR upload maps error bodies to ApiError with code, status and Retry-After', async () => {
  installFakeXhr();
  try {
    const promise = createTranscriptionJobWithProgress(makeFile(), 'auto', 'sentence', 'txt');
    const xhr = lastInstance();
    xhr.status = 429;
    xhr.response = { message: 'Too many requests', code: 'RATE_LIMITED' };
    xhr.responseHeaders.set('retry-after', '30');
    xhr.onload();
    await assert.rejects(promise, (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 429);
      assert.equal(error.code, 'RATE_LIMITED');
      assert.equal(error.message, 'Too many requests');
      assert.equal(error.retryAfterSeconds, 30);
      return true;
    });
  } finally {
    uninstallFakeXhr();
  }
});

test('XHR upload timeout rejects as a TimeoutError, not an abort', async () => {
  installFakeXhr();
  try {
    const promise = createTranscriptionJobWithProgress(makeFile(), 'auto', 'sentence', 'txt');
    const xhr = lastInstance();
    xhr.ontimeout();
    await assert.rejects(promise, (error) => {
      assert.equal(isTimeoutError(error), true);
      assert.equal(isAbortError(error), false);
      return true;
    });
  } finally {
    uninstallFakeXhr();
  }
});

test('XHR upload abort via the caller signal rejects as an AbortError', async () => {
  installFakeXhr();
  try {
    const controller = new AbortController();
    const promise = createTranscriptionJobWithProgress(makeFile(), 'auto', 'sentence', 'txt', {
      signal: controller.signal,
    });
    lastInstance();
    controller.abort();
    await assert.rejects(promise, (error) => {
      assert.equal(isAbortError(error), true);
      assert.equal(isTimeoutError(error), false);
      return true;
    });
  } finally {
    uninstallFakeXhr();
  }
});

test('XHR upload network failure rejects as a NETWORK_ERROR ApiError', async () => {
  installFakeXhr();
  try {
    const promise = createTranscriptionJobWithProgress(makeFile(), 'auto', 'sentence', 'txt');
    const xhr = lastInstance();
    xhr.onerror();
    await assert.rejects(promise, (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.code, 'NETWORK_ERROR');
      return true;
    });
  } finally {
    uninstallFakeXhr();
  }
});

test('XHR upload rejects a 200 whose body is not a job as INVALID_RESPONSE', async () => {
  installFakeXhr();
  try {
    const promise = createTranscriptionJobWithProgress(makeFile(), 'auto', 'sentence', 'txt');
    const xhr = lastInstance();
    xhr.status = 200;
    xhr.response = { unexpected: true };
    xhr.onload();
    await assert.rejects(promise, (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.code, 'INVALID_RESPONSE');
      return true;
    });
  } finally {
    uninstallFakeXhr();
  }
});

// ── Workspace source guards ─────────────────────────────────────────────────
// The component is a TSX client component, so — like transcriptionPolling —
// these assert on the source rather than mounting it.

test('file selection probes duration locally before any upload', () => {
  assert.match(source, /readMediaDuration/u, 'a duration probe must exist');
  assert.match(source, /URL\.createObjectURL\(file\)/u, 'the probe must use an object URL');
  assert.match(source, /URL\.revokeObjectURL\(url\)/u, 'the object URL must be revoked');
  assert.match(source, /onloadedmetadata/u, 'the probe must listen for loadedmetadata');
  assert.match(source, /document\.createElement\(isVideoFile \? 'video' : 'audio'\)/u,
    'video files must be probed with <video>, audio with <audio>');
  assert.match(source, /FALLBACK_MAX_DURATION_SECONDS = 600/u,
    'capabilities being unavailable must fall back to the 10-minute limit');
  assert.match(source, /duration > maxDuration/u, 'files over the limit must be rejected');
  assert.match(source, /This file is .* long\. The maximum is .* — please trim it and try again\./u);
  assert.match(source, /trackTranscriptFileRejected\(\{ reason: 'too_long' \}\)/u);

  const selectFile = source.slice(source.indexOf('const selectFile'));
  assert.ok(
    selectFile.indexOf('readMediaDuration') < selectFile.indexOf('cancelActiveRun'),
    'the duration check must run before the file is accepted',
  );
});

test('submit uses the XHR upload with a progress callback', () => {
  assert.match(source, /createTranscriptionJobWithProgress\(/u);
  assert.equal(
    source.includes('createTranscriptionJob('),
    false,
    'the plain fetch upload must no longer be used for submit (it cannot report progress)',
  );
  assert.match(source, /onProgress: \(progress\) =>/u);
  assert.match(source, /setUploadProgress\(progress\)/u);
  assert.match(source, /role="progressbar"/u);
  assert.match(source, /aria-valuenow=\{uploadPercent\}/u);
  assert.match(source, /% uploaded/u);
});

test('a cancel button is shown while running and cancels without an error state', () => {
  assert.match(source, /handleCancelRun/u);
  assert.match(source, /aria-label="Cancel transcription"/u);
  assert.match(source, /onClick=\{handleCancelRun\}/u);
  assert.match(source, /Transcription cancelled\./u);

  // Scope the assertion to the cancel handler itself: the rest of the file
  // legitimately sets 'failed' for real failures (poll timeouts, expired
  // jobs), so an unbounded slice can never pass.
  const cancelStart = source.indexOf('const handleCancelRun');
  const cancelEnd = source.indexOf('\n  };', cancelStart);
  const cancelBlock = source.slice(cancelStart, cancelEnd);
  assert.match(cancelBlock, /cancelActiveRun\(\)/u, 'cancel must abort the upload and the poll chain');
  assert.match(cancelBlock, /setPhase\('idle'\)/u, 'cancel must return to idle, not failed');
  assert.doesNotMatch(cancelBlock, /setPhase\('failed'\)/u);
  assert.match(cancelBlock, /setNoticeMsg\('Transcription cancelled\.'\)/u);
  assert.match(cancelBlock, /setJob\(null\)/u);

  // The button must live inside the running-status panel, not the idle form.
  const panelStart = source.indexOf('{isRunning && (', source.indexOf('Progress / Status'));
  const panelEnd = source.indexOf('{phase === \'failed\'', panelStart);
  const panel = source.slice(panelStart, panelEnd);
  assert.match(panel, /onClick=\{handleCancelRun\}/u, 'the Cancel button must render while a run is active');
});

test('a submit timeout shows the honest timeout message, not the generic error', () => {
  const submit = source.slice(source.indexOf('const handleSubmit'));
  assert.match(submit, /isTimeoutError\(err\)/u, 'submit must distinguish timeouts');
  assert.match(submit, /The upload timed out\. Try a smaller file or check your connection\./u);
});
