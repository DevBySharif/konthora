# Konthora AI Audio - Backend Engine

This directory contains the Python backend service for **Konthora**, driving the neural Text-to-Speech (TTS) pipeline using FastAPI and the official `kokoro` inference engine.

## Architecture

The backend operates as a single-server REST API that coordinates speech synthesis:
1. **FastAPI Web Endpoint**: Receives and validates client requests.
2. **In-Memory Rate Limiter**: Safely throttling request volume and preventing queue abuse using client IP mappings.
3. **In-Process Bounded Task Queue**: Manages scheduling of tasks using an `asyncio.Queue` driving a sequential worker.
4. **Thread-Safe Model Inference**: Executes heavy synchronous `kokoro` operations using a bounded `ThreadPoolExecutor` (default 1 worker) to protect server memory and keep the async event loop unblocked.
5. **Post-Processing & Assembly**: Smooths boundaries with edge fades, inserts custom silence pauses based on boundary tags, removes DC offsets, executes peak normalization, and encodes WAV containers.
6. **FFmpeg Converter**: Compiles the WAV master once to a high-quality VBR MP3 file.
7. **Storage Garbage Collector**: Auto-deletes old generated audios and cleans expired jobs memory metadata.

## System Dependencies

* **Python**: `3.11.9` (verified runtime)
* **FFmpeg**: Required on the system PATH to compile WAV outputs into MP3s.
* **FFprobe**: Required (ships with FFmpeg) for media inspection in transcription.
* **eSpeak NG**: Required for English grapheme-to-phoneme (G2P) translation.

## Installation & Setup

### Local Installation

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   * **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
   * **Linux/macOS**: `source .venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Install development/testing tools:
   ```bash
   pip install -r requirements-dev.txt
   ```

### Requirements Files

* **`requirements.txt`** — Human-maintained direct dependency file with exact verified versions. Use this for normal setup.
* **`requirements-lock.txt`** — Complete reproducibility snapshot of the exact verified Python 3.11.9 environment (`pip freeze`). Records every transitive package version so the environment can be reproduced byte-for-byte.
* **Verified runtime**: Python **3.11.9** on Windows. Note that `misaki` is installed from an immutable Git commit (PyPI does not publish a version satisfying `kokoro`'s requirement), and `torch` is pinned to the CPU build via the `--extra-index-url` in `requirements.txt`.

### eSpeak NG Configuration on Windows

If `eSpeak NG` is installed via `winget` or installer but not on your default shell `PATH`, copy the installation directory path (e.g. `C:\Program Files\eSpeak NG`) and assign it in your `.env`:

```env
ESPEAK_PATH=C:\Program Files\eSpeak NG
```

## Running the API Server

Start the development server with hot-reload enabled:

```bash
# From the backend/ directory with activated virtual environment
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Model Cache & First Run

Kokoro is an open-weight 82M parameter model. On the **first startup** or first text synthesis, the library will automatically download the model weights (from Hugging Face) and cache them locally:
* By default, weights are cached in `~/.cache/huggingface` (or the folder defined by the `HF_HOME` environment variable).
* The first generation request may take several seconds to complete while downloading. Subsequent requests will execute in sub-second timelines.

## API Route Catalogue

### Health Check
* `GET /api/v1/health`
  * Returns safe operational statistics (model status, queue size, FFmpeg status, version).

### Voices Catalogue
* `GET /api/v1/tts/voices`
  * Returns the supported voice identifiers, display names, recommended traits, gender, and speeds.

### Submit Synthesis Job
* `POST /api/v1/tts/jobs`
  * Enqueues a script. Validates input (< 2,000 characters).
  * Returns a unique `jobId` and a cryptographically secure `accessToken`.

### Check Job Progress
* `GET /api/v1/tts/jobs/{jobId}`
  * Returns completion state and stage (`queued`, `preparing_text`, `generating_speech`, `processing_audio`, `finalizing_file`, `completed`, `failed`).
  * Requires `Authorization: Bearer <accessToken>` header.

### Retrieve Audio Output
* `GET /api/v1/tts/jobs/{jobId}/audio`
  * Streams the final compiled file with correct headers (`audio/mpeg` or `audio/wav`).
  * Requires `Authorization: Bearer <accessToken>` header.

### Transcription Capabilities
* `GET /api/v1/transcription/capabilities`
  * Returns accepted file extensions, size/duration limits, supported languages, timestamp modes, and export formats.

### Submit Transcription Job
* `POST /api/v1/transcription/jobs`
  * Accepts a multipart audio/video upload (MP3, WAV, M4A, AAC, MP4, WebM, MOV) up to 100 MB / 10 minutes.
  * Accepts `language`, `timestampMode` (sentence/paragraph/word), and `exportFormat` (txt/srt/vtt/json) fields.
  * Returns a unique `jobId` and a cryptographically secure `accessToken`.

### Check Transcription Progress
* `GET /api/v1/transcription/jobs/{jobId}`
  * Returns completion state, detected language, segment/word counts, and result URL.
  * Requires `Authorization: Bearer <accessToken>` header.

### Structured Transcript Preview
* `GET /api/v1/transcription/jobs/{jobId}/transcript`
  * Returns the structured JSON transcript (full text, segments, word timings).
  * Requires `Authorization: Bearer <accessToken>` header.

### Download Formatted Result
* `GET /api/v1/transcription/jobs/{jobId}/result`
  * Downloads the export document in the job's configured format (txt/srt/vtt/json).
  * Requires `Authorization: Bearer <accessToken>` header.

## Security & Privacy Guidelines

* **Bearer Security**: Job progress endpoints and audio downloads strictly require the bearer token. Tokens are compared using constant-time check loops. Failed authorizations return 401. Access to other jobs returns 404 to avoid ID probing.
* **Temporary Retention**: Generated files and in-memory metadata automatically expire after the configured duration (default: 60 minutes).
* **Privacy Wipes**: Raw script text is purged from server memory immediately once synthesis succeeds or fails. Fully completed files are deleted on expiry.

## Running Tests

Execute the unit tests suite:
```bash
# Run tests from the backend/ folder
pytest
```

To run the real-model integration test (which loads Kokoro, synthesizes test audio, and checks array traits):
```bash
$env:RUN_TTS_INTEGRATION_TESTS=1; pytest -k "test_kokoro"
```

To run the real-model transcription integration test (which synthesizes audio with Kokoro and transcribes it with faster-whisper):
```bash
$env:RUN_TRANSCRIPTION_INTEGRATION_TESTS=1; pytest -k "transcription_integration"
```

To verify the installed dependency tree is coherent:
```bash
python -m pip check
```

## Production Configuration

Deployment target: an **Ubuntu 24.04 VPS** behind Nginx, managed by systemd.
See the repository-level [DEPLOYMENT.md](../DEPLOYMENT.md) for the full procedure.

Production-specific settings (see `app/core/config.py` and
`.env.production.example`):

| Variable | Production value | Purpose |
| --- | --- | --- |
| `APP_ENV` | `production` | Enables HSTS, disables dev behaviour |
| `TRUST_PROXY_HEADERS` | `true` | Client IP from `X-Forwarded-For` for rate limiting |
| `TRUSTED_HOSTS` | `api.konthora.dev.bd` | Host-header allowlist (anti DNS-rebinding) |
| `CORS_ORIGINS` | `https://konthora.dev.bd` | Exact browser origin allowed |
| `LOG_DIR` | `/var/log/konthora` | Rotating file logs (50 MB × 7 days, zipped) |
| `TTS_STORAGE_ROOT` | `/opt/konthora/backend/storage` | Job output location on the VPS |

Startup command (also baked into the systemd unit):

```bash
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 \
  --workers 1 --proxy-headers --forwarded-allow-ips 127.0.0.1 --http httptools
```

### Logging & Privacy

- Console/stderr logs go to journald under systemd; when `LOG_DIR` is set,
  loguru also writes a rotating `konthora.log` (50 MB rotation, 7-day retention,
  zipped).
- The application **never logs**: access tokens, submitted text/transcripts,
  uploaded filenames, `Authorization` headers, or absolute machine paths.
- `pip check`, `pytest`, lint, `tsc` and `next build` run automatically in
  GitHub Actions (`../.github/workflows/ci.yml`).

## Known Limitations

* **English-only**: Launch scope is English (en-US / en-GB accents). "Auto Detect" currently resolves to English.
* **Temporary local storage**: Files and jobs are stored on local disk under `backend/storage` and are deleted after the retention window (default 60 minutes).
* **In-memory jobs**: All job state lives in process memory and is lost on restart.
* **Single-server MVP**: Uses an in-process queue and local storage; not designed for horizontal scaling.
* **Docker**: A `Dockerfile` is provided but Docker is not runtime-verified in this repository.
* No speaker diarization, no translation, no guaranteed perfect accuracy.

## Docker Containerization

1. Build the Docker image:
   ```bash
   docker build -t konthora-backend .
   ```

2. Run the container, binding directories to preserve model weight downloads and output files:
   ```bash
   docker run -p 8000:8000 \
     -v $(pwd)/storage:/app/storage \
     -v $(pwd)/model_cache:/app/model_cache \
     konthora-backend
   ```
