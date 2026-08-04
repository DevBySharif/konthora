# Konthora — Monitoring

Documentation only. This describes what to monitor and how, without wiring any
third-party service into the codebase. All recommendations are optional and are
applied in the external monitoring console (UptimeRobot, Better Stack, etc.).

## Health endpoint

The API exposes `GET /api/v1/health` (unauthenticated, deliberately not rate
limited at Nginx). It returns:

```json
{
  "status": "alive",
  "version": "1.0.0",
  "environment": "production",
  "modelReady": false,
  "modelStatus": "uninitialized",
  "ffmpegAvailable": true,
  "queueDepth": 0,
  "queueCapacity": 10,
  "transcriptionModelReady": false,
  "transcriptionModelStatus": "not_loaded",
  "transcriptionQueueDepth": 0,
  "transcriptionQueueCapacity": 5
}
```

Notes:

- `modelReady` / `transcriptionModelReady` are `false` until the first job of
  that type runs (models load lazily). Do **not** alert on `false` — it is the
  expected cold state. Alert only if it stays `false` after a submitted job
  fails, or if `modelStatus` becomes `failed`.
- `ffmpegAvailable: false` means MP3 encoding and transcription extraction are
  broken — alert on this.
- `queueDepth` climbing to `queueCapacity` under sustained load means the VPS is
  saturated.

### Local check

```bash
bash deploy/scripts/health.sh        # full public check
bash deploy/scripts/health.sh --local
```

## UptimeRobot

- **Monitor:** HTTP(S), `https://api.konthora.dev.bd/api/v1/health`.
- **Interval:** 1–5 minutes.
- **Alert when:** status ≠ 2xx (expect `200`), or response time > 5 s.
- Optional second monitor for the frontend: `https://konthora.dev.bd`.
- Add a keyword check for `"status":"alive"` to catch 200s with a degraded body.

## Better Stack (alternative/replacement)

- **Heartbeat:** POST to a Better Stack heartbeat URL from a cron on the VPS:
  ```cron
  */5 * * * * curl -fsS https://uptime.betterstack.com/api/v1/heartbeat/HEARTBEAT_TOKEN
  ```
- **Uptime monitor:** `https://api.konthora.dev.bd/api/v1/health`.
- **Logs (Better Stack Logs):** ship `journalctl -u konthora` and
  `/var/log/konthora/konthora.log`; alert on `level=ERROR` patterns and on the
  rate-limit markers (`Rate limit hit`, `Enqueuing failed`).

## Disk monitoring

The only unbounded-on-disk data is `backend/storage` (job outputs) and the model
cache (`~/.cache/huggingface`).

- **Job storage:** auto-cleaned on a 60-minute retention; also wiped at startup.
  Safe ceiling: 500 MB typical.
- **Model cache:** grows once (Kokoro ~160 MB + Whisper small.en ~460 MB) and then
  stays static.
- Alert when disk usage > 80% (`df -h`), or storage folder > 1 GB:
  ```bash
  du -sh /opt/konthora/repo/backend/storage
  ```
- Emergency manual clean: `sudo bash deploy/scripts/cleanup.sh`

## RAM monitoring

One uvicorn process holds both models once used (~1.5–2.5 GB with the defaults).
The systemd unit caps it with `MemoryMax=4G`.

- Alert when memory usage > 80% for 5+ minutes.
- Watch `MemoryMax` hit events: `journalctl -u konthora | grep -i memory`.

## CPU monitoring

Transcription (`small.en`, `int8`) saturates a single core for minutes per job.
TTS uses one core in bursts.

- Alert when load average stays > 1.5× vCPU count for 10+ minutes.
- `CPUQuota=1000%` in the unit prevents runaway CPU.

## Log locations

| Source | Location |
| --- | --- |
| Backend application logs | `/var/log/konthora/konthora.log` (rotated: 50 MB × 7 days, zipped) |
| Backend stdout/stderr | `journalctl -u konthora` |
| Nginx access log | `/var/log/nginx/access.log` |
| Nginx error log | `/var/log/nginx/error.log` |
| SSL renewals | `journalctl -u certbot.timer` |

Viewing:

```bash
bash deploy/scripts/logs.sh          # last 100 lines
bash deploy/scripts/logs.sh -f       # follow
bash deploy/scripts/logs.sh --file   # rotated file
bash deploy/scripts/logs.sh --grep rate
```

## Recommended alert rules (summary)

| Condition | Severity |
| --- | --- |
| Health endpoint down (UptimeRobot/Better Stack) | Critical |
| `ffmpegAvailable: false` in health | Critical |
| Disk > 80% | Warning → Critical at 90% |
| RAM > 80% sustained | Warning |
| Load > 1.5× vCPUs sustained | Warning |
| `MemoryMax` / OOM kill in journal | Critical |
| `systemd` unit restarting > 3×/hour | Warning |
