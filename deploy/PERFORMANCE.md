# Konthora — Performance Review

Review of the production performance characteristics and the knobs that matter
on AWS. Sizing is **tiered** — see [deploy/AWS.md](AWS.md) for the
credit-budget guidance and benchmarking before you pick an instance.
Companion to [DEPLOYMENT.md](../DEPLOYMENT.md).

| Area | Status | Notes |
| --- | --- | --- |
| Queue | ✅ bounded in-process | capacity 10 TTS / 5 transcription, 1 worker each |
| Memory | ✅ measured + capped | warm ~1.5 GB with both models; `MemoryMax=6G` on 8 GiB (adjust per tier) |
| Startup | ✅ fast | lazy model loading; cold first request warms models |
| Model loading | ✅ lazy + cached | weights cached in `/opt/konthora/.cache/huggingface` |
| Compression | ✅ gzip JSON | `GZipMiddleware` ≥ 1 KB; audio never compressed |
| Caching | ✅ deliberate | no response caching (ephemeral data); Nginx bypass on |

---

## 1. Queue design

- TTS: bounded in-process queue (`TtsQueueManager`), capacity
  `TTS_MAX_QUEUE_SIZE=10`, processed by **1 worker thread**.
- Transcription: `TranscriptionQueueManager`, capacity 5, 1 worker.
- Jobs are tracked in memory (`JobService`); completed files written to
  storage and auto-deleted after `TTS_JOB_RETENTION_MINUTES` /
  `TRANSCRIPTION_JOB_RETENTION_MINUTES` (60 min) by `CleanupService`
  (60 s sweep + startup stale sweep).
- **Consequence:** exactly **1 uvicorn worker** must run. The systemd unit and
  deploy scripts enforce `--workers 1`. Increasing workers would split queue
  state across processes and multiply model copies in RAM.

## 2. Memory

Measured locally (Aug 2026, this project — rerun on the actual EC2 box):

| Item | Approx |
| --- | --- |
| Python + FastAPI imports (idle) | ~0.05 GB |
| **Kokoro TTS** (82M params, fp32 on CPU) | **~1.3 GB** warm |
| **faster-whisper `small.en` int8** | **~+0.1 GB** incremental (total warm ~1.5 GB) |
| Peak with both models loaded | **~1.5 GB** working set |
| FFmpeg subprocess during a transcription job | variable (budget ~0.3–0.7 GB) |

- The docs previously understated Kokoro (~0.5–0.7 GB) — the real measured
  figure is **~1.3 GB** alone, ~1.5 GB warm with both models.
- `MemoryMax=6G` caps the whole cgroup (service + FFmpeg children) on an
  8 GiB box, leaving ~2 GB for Ubuntu, Nginx and filesystem cache. It is
  **not** set equal to total RAM. On a 4 GiB validation box the physical RAM
  is the real ceiling regardless.
- If RAM becomes tight: lower `TRANSCRIPTION_BEAM_SIZE` (5 → 3),
  `TRANSCRIPTION_MODEL` to `base.en`, or reduce
  `TRANSCRIPTION_MAX_FILE_SIZE_MB` (100 → 50).
- ⚠️ 4 GiB boxes are **marginal** for the default 100 MB upload cap — measure
  first (see [deploy/AWS.md](AWS.md) → Benchmark, and
  `deploy/scripts/benchmark_resources.sh`).

## 3. Startup

- Boot is fast: no model is loaded at import/startup time (models are loaded
  lazily on first use).
- On first request the workers load the model and cache it in memory; the
  first job is slower, subsequent jobs run at full speed.
- Health endpoint returns `modelReady:false` until first load — this is
  expected cold-state behavior, not an error (do not alarm on it).

## 4. Model loading

- Weights download once into `HF_HOME=/opt/konthora/.cache/huggingface`
  (Kokoro ≈ 160 MB, Whisper ≈ 460 MB), then load from disk on every restart.
- Both models load into RAM at first use; load time on 4 vCPU is a few
  seconds each.
- Tip: pre-warm after deploy with one health/liveness call, or the manual
  pre-warm snippet in DEPLOYMENT.md → Troubleshooting.

## 5. Compression

- `GZipMiddleware(minimum_size=1000)` compresses JSON API responses
  (`COMPRESSION_ENABLED=true`).
- Audio and binary downloads are **never** compressed (already-compressed
  formats; compressing would waste CPU).
- Nginx also gzips textual upstream responses (`gzip_proxied any`), but audio
  is excluded via content-type allowlist.

## 6. Caching

- **No response caching** is intentionally used: job data is ephemeral and
  token-protected. Nginx sets `proxy_no_cache 1` / `proxy_cache_bypass 1`, and
  the app emits `Cache-Control: no-store` on job JSON and downloads
  (`private, max-age=0, no-cache` on audio).
- This avoids cross-user cache leakage entirely (never cache auth-scoped
  content). Latency is dominated by synthesis/transcription, not response
  transfer.

## 7. Networking / streaming

- `proxy_buffering off` streams large audio/transcript downloads.
- Nginx timeouts sized for long jobs (`proxy_read_timeout 600s`).
- Keep-alive to upstream (`proxy_set_header Connection ""`, `keepalive 16`).

## 8. Bottlenecks & levers

| Bottleneck | Lever |
| --- | --- |
| TTS throughput | `TTS_WORKER_COUNT` (stays 1), raise to `c7i`/`m6i` or scale via ALB |
| Whisper latency | `TRANSCRIPTION_BEAM_SIZE`, model size (`small.en` → `base.en`), `int8` |
| Disk I/O | gp3 provisioned IOPS if storage becomes hot |
| Memory pressure | `MemoryMax`, model size, 16 GB `m6i.xlarge` upgrade path |
| Horizontal scale | ALB + sticky sessions (in-process state) — see AWS.md §7 |

## 9. Monitoring reminders

- Watch: `MemoryMax` pressure (`systemctl status`, `journalctl -u konthora`),
  queue depth (`/api/v1/health` → `queueDepth`), FFmpeg availability.
- See [deploy/MONITORING.md](MONITORING.md) for the alerting setup.
