# Konthora — Security Review

A review of the production security posture. This is the companion to
[DEPLOYMENT.md](../DEPLOYMENT.md) and [deploy/AWS.md](AWS.md). Findings are
organized by the areas in scope.

| Area | Status | Notes |
| --- | --- | --- |
| CORS | ✅ hardened | `allow_credentials=False`, explicit origins, no wildcards in production |
| Trusted Hosts | ✅ enforced | `TrustedHostMiddleware` allowlist via `TRUSTED_HOSTS` |
| Security Headers | ✅ applied | see table below; HSTS gated to production |
| Rate limiting | ✅ two layers | Nginx zones (edge) + in-app per-IP limiter (authoritative) |
| Upload validation | ✅ | size/duration/file-type ceilings + FFmpeg probing |
| Token handling | ✅ | bearer tokens, constant-time compare, token nulled after issuance |
| Temporary storage | ✅ | atomic writes, traversal/symlink blocked, auto-cleanup |
| Log sanitization | ✅ | no tokens, text, transcripts, or local paths in logs |

---

## 1. CORS

Configured in `backend/app/main.py`:

- `allow_origins` = `settings.cors_origins_list` — production value
  `https://konthora.dev.bd` only. Empty entries are dropped; `*` is rejected
  in production by configuration guidance (never enabled).
- `allow_credentials=False` — Bearer auth uses headers, not cookies; there is
  no credential-based cross-origin exposure.
- Methods restricted to `GET, POST, OPTIONS`; headers to
  `Content-Type, Authorization`.

## 2. Trusted Hosts

- `TrustedHostMiddleware` runs **outermost** with `TRUSTED_HOSTS=api.konthora.dev.bd`
  in production. Requests with any other `Host` header return `400` before
  reaching the app.
- Blocks DNS rebinding and Host-header spoofing. Empty list (dev) maps to `["*"]`.

## 3. Security headers (every API response)

Set by `backend/app/core/security.py` (Nginx sets the same set at the edge):

| Header | Value |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), interest-cohort=()` |
| `Content-Security-Policy` | `default-src 'none'; frame-ancestors 'none'; base-uri 'none'` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (production only) |

## 4. Rate limiting

Two independent layers:

1. **Nginx** (edge, `deploy/nginx/nginx.conf`): `limit_req` zones —
   `konthora_api` 30 r/s (burst 40), `konthora_jobs` 5 r/s (burst 3) on job
   creation. Client IP is `$binary_remote_addr` behind `proxy_set_header
   X-Forwarded-For $proxy_add_x_forwarded_for` + uvicorn
   `--forwarded-allow-ips 127.0.0.1`.
2. **Application** (`RateLimitService`, authoritative per
   `TTS_RATE_LIMIT_*`/`TRANSCRIPTION_RATE_LIMIT_*`):
   - requests-per-window sliding window per client IP,
   - **active-jobs-per-client** caps (3 TTS / 1 transcription concurrent),
   - registered *before* enqueue to close the race-condition bypass.

## 5. Upload validation (transcription)

- `TRANSCRIPTION_MAX_FILE_SIZE_MB=100` enforced on the upload.
- `TRANSCRIPTION_MAX_DURATION_SECONDS=600` via FFprobe inspection.
- File-type extension allowlist + content probing through FFmpeg
  (`audio_service`), bounded by `TRANSCRIPTION_FFPROBE_TIMEOUT_SECONDS` and
  `TRANSCRIPTION_FFMPEG_TIMEOUT_SECONDS`.
- Nginx `client_max_body_size 110m` caps the request body at the edge.

## 6. Token handling

- Job access tokens are random bearer tokens (generated with the stdlib
  `secrets` module), returned **once** at creation.
- Authorization enforced via FastAPI `HTTPBearer`; access verified with
  constant-time comparison (`verify_job_access`).
- The plaintext token is nulled in memory after the create response; tokens
  are never written to logs, storage, or responses.

## 7. Temporary storage

- All job files under `TTS_STORAGE_ROOT`, resolved through
  `resolve_secure_path` (`backend/app/utils/storage.py`): blocks directory
  traversal, symlinks, and escapes outside the root.
- Files written atomically (temp + `os.replace`), size-verified.
- Auto-cleanup: expired files deleted on a 60 s sweep
  (`CleanupService`), plus a startup stale-file sweep.
- No public static serving of the storage directory — files are only
  reachable through token-authenticated download endpoints.

## 8. Log sanitization

- Loggers never record: access tokens, job text/transcripts, uploaded audio
  contents, or absolute local paths.
- The global exception handler returns a generic `INTERNAL_SERVER_ERROR`
  message — tracebacks are logged server-side only, never leaked to clients.

## 9. Host hardening (AWS + OS)

- **systemd** (`deploy/systemd/konthora.service`): unprivileged `konthora`
  user, `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=full`,
  `ProtectHome`, `RestrictSUIDSGID`, `ReadWritePaths` limited to storage +
  logs.
- **Nginx**: `server_tokens off`, HSTS + security headers, no exposed
  upstream (`uvicorn` binds `127.0.0.1`), `proxy_no_cache`/`cache_bypass`.
- **AWS Security Group**: 22 (SSH, your IP only), 80/443 public, 8000 closed.
  See [deploy/AWS.md](AWS.md).
- **Secrets**: `/etc/konthora/konthora.env` mode 600 root-owned; never
  committed; `.gitignore` excludes `.env*` (except examples) and `*.pem`.

## 10. Residual notes

- Rate limits are in-memory and reset on restart — acceptable for the
  single-process design; Nginx zones cover the restart window.
- No TLS on the loopback (127.0.0.1:8000) — traffic is internal to the host;
  the public surface is HTTPS only (HSTS preload-ready).
- Uploads/transcripts are ephemeral by design (60-min retention) — anything
  that must be retained long-term needs S3 (future work, out of scope).
