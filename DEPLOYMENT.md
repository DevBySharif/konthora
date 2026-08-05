# Konthora — Production Deployment

This document describes how to deploy the entire Konthora stack to **AWS EC2**
(Ubuntu 24.04 LTS) behind **Nginx + Let's Encrypt**, managed by **systemd**.
Both the Next.js frontend and the FastAPI backend run on the same VPS — no
hosted platform (e.g. Vercel) is required.

- Architecture: `konthora.dev.bd` / `www.konthora.dev.bd` (Next.js on the VPS) + `api.konthora.dev.bd` (FastAPI on the VPS)
- AWS provisioning & sizing: [deploy/AWS.md](deploy/AWS.md)
- Launch checklist: [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)
- Monitoring: [deploy/MONITORING.md](deploy/MONITORING.md)
- Security review: [deploy/SECURITY.md](deploy/SECURITY.md)
- Performance review: [deploy/PERFORMANCE.md](deploy/PERFORMANCE.md)

```
Browser ──► EC2: Nginx:443 ──► Next.js 127.0.0.1:3000         konthora.dev.bd / www.konthora.dev.bd
Browser ──► EC2: Nginx:443 ──► uvicorn 127.0.0.1:8000          api.konthora.dev.bd
              ▲ Let's Encrypt TLS, rate limits, security headers, gzip
```

---

## 1. Server requirements

AWS sizing is **tiered by budget** — this project has ≈ USD $100 of credits,
so **do not default to a large instance**. Pick a tier from
[deploy/AWS.md](deploy/AWS.md) and **benchmark before choosing** (there is a
helper at `deploy/scripts/benchmark_resources.sh`).

| Tier | Shape | When |
| --- | --- | --- |
| A — validation | smallest that benchmarks safely (candidates: `c7i-flex.large`, `c6i.large`, `m7i-flex.large`, `t3.large`, `t3a.large`); 4 GiB may be marginal | smoke tests, restricted beta |
| B — MVP | 4 vCPU / 8 GiB, 40–50 GiB gp3 | small public launch (≈ $100 credit ≈ 1 month or less) |
| C — scale-up | `c6i.xlarge` / `c7i.xlarge` | real traffic / paid funding |

Common to all tiers: Ubuntu 24.04 LTS (x86_64); public IPv4 (≈ $3.65/mo —
**billed whether attached or not**, see [deploy/AWS.md](deploy/AWS.md));
22/80/443 open.

Measured (Aug 2026): the app is warm at **~1.5 GB** with both models
(Kokoro ~1.3 GB), and the model cache on disk is ~0.8 GB
(Kokoro ≈0.3 GB + Whisper small.en ≈0.46 GB). The default
`small.en / int8 / cpu` configuration is tuned for this class of box.

> **Single-process constraint:** Konthora keeps jobs, rate-limit state and task
> queues **in process memory**. Uvicorn **must run with 1 worker** — the systemd
> unit and start scripts already enforce this. Do not raise `--workers`.

---

## 2. Ubuntu setup (one-time)

```bash
sudo apt update && sudo apt upgrade -y
sudo timedatectl set-timezone UTC
```

### Firewall (UFW)

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp        # SSH — keep your current IP reachable!
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status              # 22, 80, 443 allowed
```

(If you use Cloudflare proxying in front of the VPS, also allow Cloudflare's
published IP ranges instead of exposing 80/443 to the world.)

---

## 3. Python installation

Ubuntu 24.04 ships Python 3.12. Konthora is verified on **3.11**, which is
recommended for deployment parity with the locked environment.

```bash
# Toolchain for building some wheels
sudo apt install -y build-essential python3-dev libssl-dev

# Install Python 3.11 from the deadsnakes PPA
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev
python3.11 --version   # 3.11.x
```

The deploy script creates the venv with `python3 -m venv` (system Python 3.12
works too — the pinned packages install on both; 3.11 is simply the tested one).

## 4. Node.js installation

Node.js is required to **build** the Next.js frontend. `deploy.sh` installs
Node.js 22 automatically via the NodeSource binary repository, then runs
`npm ci` + `next build`. The build output (`.next`) is served at runtime by the
`konthora-web.service` systemd unit — Node stays on the box only to run
`next start`.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # v22.x
```

### Frontend environment variables — `/etc/konthora/web.env`

The frontend needs `NEXT_PUBLIC_*` variables at **both** build time (inlined
into the client bundle) and runtime (read by the server for
`robots.txt`/`sitemap.xml`/OpenGraph). `deploy.sh` copies
`.env.production.example` to `/etc/konthora/web.env` (mode 600) and uses it for
the build; `konthora-web.service` loads the same file via `EnvironmentFile`:

```bash
NEXT_PUBLIC_SITE_URL=https://konthora.dev.bd
NEXT_PUBLIC_CONTACT_EMAIL=hello@konthora.dev.bd
NEXT_PUBLIC_API_URL=https://api.konthora.dev.bd/api/v1
```

## 5. Git installation

Git is used to clone the repository and by `update.sh`/`rollback.sh` to manage
releases. `deploy.sh` installs it automatically; manually:

```bash
sudo apt install -y git
git --version
```

## 6. Virtual environment

The backend runs from an isolated **virtualenv** (`backend/.venv`) so system
packages never interfere with the pinned requirements. `deploy.sh` creates it;
manually:

```bash
cd /opt/konthora/repo/backend
python3.11 -m venv .venv
.venv/bin/pip install --upgrade pip setuptools wheel
.venv/bin/pip install -r requirements.txt
.venv/bin/pip check
```

The systemd unit launches `.venv/bin/uvicorn` directly — no shell, no tmux, no
`source activate` needed.

## 7. FFmpeg (backend dependency)

Required for MP3 encoding and for transcription media processing (extraction,
inspection).

```bash
sudo apt install -y ffmpeg
ffmpeg -version   # ffprobe ships with ffmpeg
```

Verify the backend sees it: `GET /api/v1/health` → `"ffmpegAvailable": true`.

## 8. eSpeak NG (backend dependency)

Required for Kokoro's English grapheme-to-phoneme stage.

```bash
sudo apt install -y espeak-ng
```

Auto-discovery finds `/usr/bin/espeak-ng`, so `ESPEAK_PATH` can stay empty in
`/etc/konthora/konthora.env`.

---

## 9. Deploying the backend (first time)

The provisioning script performs every step below automatically. DNS must
already point at the VPS before it runs (it obtains the TLS certificate).

```bash
# On the VPS, as a sudo-capable user:
sudo mkdir -p /opt/konthora && sudo chown $USER /opt/konthora
git clone https://github.com/DevBySharif/konthora.git /opt/konthora/repo
cd /opt/konthora/repo
cp deploy/scripts/konthora.env.example deploy/scripts/konthora.env
sudo nano deploy/scripts/konthora.env   # review paths/domains
sudo bash deploy/scripts/deploy.sh
```

`deploy.sh` is **idempotent** — re-running it is safe: an existing secrets file,
certificate and model cache are preserved, and the venv is only created once.

What `deploy.sh` does:

1. Installs packages: python3.11, Node.js 22, ffmpeg, espeak-ng, nginx, certbot,
   git, build tools.
2. Creates the unprivileged `konthora` system user.
3. Clones/pulls the repository into `/opt/konthora/repo` (and keeps the venv
   root-owned so the service user cannot modify its own code).
4. Creates `backend/.venv` and installs `backend/requirements.txt`
   (then runs `pip check`).
5. Installs `/etc/konthora/konthora.env` (mode 600) from
   `backend/.env.production.example`. **Review this file** before going live.
6. Installs `/etc/konthora/web.env` (mode 600) from `.env.production.example`
   and builds the Next.js frontend (`npm ci` + `next build`).
7. Creates `backend/storage`, `/var/log/konthora` and the model cache
   (`/opt/konthora/.cache`) owned by `konthora`.
8. **Provisions ML models** (`deploy/scripts/provision_models.sh`): installs the
   spaCy `en_core_web_sm` model Kokoro's G2P needs, warms the Kokoro + Faster
   Whisper weights into the cache, and verifies cache ownership/permissions.
   Fails fast if anything is wrong. Skippable with `SKIP_MODEL_WARM=1`.
9. Installs Nginx configs and the two systemd units (`konthora` + `konthora-web`),
   disables the unused `default` site, enables both services.
10. Issues Let's Encrypt certificates for `api.konthora.dev.bd` and for
    `konthora.dev.bd` + `www.konthora.dev.bd` (standalone bootstrap, then
    renewal hooks) or reuses existing ones.
11. Validates and starts Nginx.
12. Starts both services.

Manual equivalents of steps 8–11 are shown below.

### Backend secrets file — `/etc/konthora/konthora.env`

Minimum production values (full template: `backend/.env.production.example`):

```bash
APP_ENV=production
CORS_ORIGINS=https://konthora.dev.bd
TRUST_PROXY_HEADERS=true
TRUSTED_HOSTS=api.konthora.dev.bd
LOG_DIR=/var/log/konthora
TTS_STORAGE_ROOT=/opt/konthora/repo/backend/storage
```

Permissions must be `600`:

```bash
sudo chown root:root /etc/konthora/konthora.env
sudo chmod 600 /etc/konthora/konthora.env
```

### systemd — `konthora.service`

Installed to `/etc/systemd/system/konthora.service` (see
[deploy/systemd/konthora.service](deploy/systemd/konthora.service)).

Key properties:

| Setting | Value | Why |
| --- | --- | --- |
| `User/Group` | `konthora` | least privilege |
| `WorkingDirectory` | `/opt/konthora/repo/backend` | app-relative storage paths |
| `EnvironmentFile` | `/etc/konthora/konthora.env` | secret config, not in the unit |
| `ExecStart` | `.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1 --proxy-headers --forwarded-allow-ips 127.0.0.1 --http httptools` | loopback bind, 1 worker, trust only local proxy |
| `Restart=always` / `RestartSec=5` | | self-healing |
| `StartLimitIntervalSec=600` / `StartLimitBurst=5` | | restart-storm protection (in `[Unit]`) |
| `MemoryMax=6G`, `LimitNOFILE=65535`, `CPUQuota=400%` | | resource limits — adjust per instance tier (see the unit file) |
| `StandardOutput/StandardError=journal` | | logs via journald |
| `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=full`, `ProtectHome`, `ReadWritePaths=...` | | security hardening |

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now konthora
sudo systemctl status konthora
```

### systemd — `konthora-web.service`

Installed to `/etc/systemd/system/konthora-web.service` (see
[deploy/systemd/konthora-web.service](deploy/systemd/konthora-web.service)).
Runs the Next.js production server on **127.0.0.1:3000**, supervised the same
way as the backend (restart-on-failure, resource limits, security hardening,
starts at boot).

| Setting | Value | Why |
| --- | --- | --- |
| `WorkingDirectory` | `/opt/konthora/repo` | where `package.json` / `.next` live |
| `EnvironmentFile` | `/etc/konthora/web.env` | `NEXT_PUBLIC_*` runtime config |
| `ExecStart` | `.../node_modules/.bin/next start -H 127.0.0.1 -p 3000` | loopback bind on 3000, prod mode |
| `MemoryMax=1G`, `CPUQuota=100%`, `LimitNOFILE=65535` | | resource limits |
| `Restart=always` / `RestartSec=5` | | self-healing |
| `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=full`, `ProtectHome`, `RestrictSUIDSGID` | | security hardening |

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now konthora-web
sudo journalctl -u konthora-web -f   # logs
```

> **Both units must run.** Nginx routes `konthora.dev.bd` to port 3000 and
> `api.konthora.dev.bd` to port 8000; without both services the corresponding
> upstream returns 502.

### Nginx — reverse proxy

Configs installed by the deploy script (see [deploy/nginx/](deploy/nginx/)):

| File | Installed as |
| --- | --- |
| File | Installed as |
| --- | --- |
| `nginx.conf` (http tuning, gzip, rate-limit zones, HTTP→HTTPS redirects for all three domains) | `/etc/nginx/nginx.conf` |
| `konthora.dev.bd.conf` (TLS site for the frontend + www → apex redirect) | `/etc/nginx/sites-available/` |
| `api.konthora.dev.bd.conf` (TLS site for the API) | `/etc/nginx/sites-available/` |
| `security_headers.conf` (API headers) | `/etc/nginx/conf.d/` |
| `frontend_security_headers.conf` (frontend headers) | `/etc/nginx/conf.d/` |
| `proxy_params.conf` | `/etc/nginx/proxy_params.conf` |

Routing:

- `konthora.dev.bd` / `www.konthora.dev.bd` → `http://konthora_web`
  (Next.js 127.0.0.1:3000); `www` does a TLS-tier 301 canonical redirect to the
  apex.
- `api.konthora.dev.bd` → `http://konthora_api` (uvicorn 127.0.0.1:8000).

Preserved everywhere:

- `client_max_body_size 110m` — supports 100 MB transcription uploads.
- `proxy_read_timeout 600s` / `proxy_send_timeout 600s` — long inference jobs.
- `proxy_buffering off` — streams large audio/downloads.
- gzip on textual responses only (never audio).
- Rate-limit zones: `konthora_api` (30 r/s), `konthora_jobs` (5 r/s),
  `konthora_web` (10 r/s, burst 30) as defense-in-depth; the backend also
  rate-limits per IP.
- `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for` + uvicorn
  `--forwarded-allow-ips 127.0.0.1` keeps client-IP rate limiting correct.

Enable and validate:

```bash
sudo ln -s /etc/nginx/sites-available/api.konthora.dev.bd.conf \
           /etc/nginx/sites-enabled/api.konthora.dev.bd.conf
sudo ln -s /etc/nginx/sites-available/konthora.dev.bd.conf \
           /etc/nginx/sites-enabled/konthora.dev.bd.conf
sudo nginx -t
sudo systemctl reload nginx
```

### Let's Encrypt

Both server blocks are TLS-only (`listen 443 ssl`) and point at certificate
paths, so on a fresh host the certificates must exist *before* Nginx can start.
`deploy.sh` bootstraps both with the **standalone** authenticator while port 80
is free, then installs renewal hooks that stop/start Nginx around each renewal
(standalone needs port 80 free):

```bash
sudo apt install -y certbot

# Backend certificate (single domain)
sudo certbot certonly --standalone -d api.konthora.dev.bd \
     --non-interactive --agree-tos -m hello@konthora.dev.bd

# Frontend certificate (SAN covering apex + www)
sudo certbot certonly --standalone -d konthora.dev.bd -d www.konthora.dev.bd \
     --non-interactive --agree-tos -m hello@konthora.dev.bd

# Renewal hooks injected by deploy.sh:
#   /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh
#   /etc/letsencrypt/renewal-hooks/post/start-nginx.sh

# Renewal (certbot.timer runs automatically; test it):
sudo certbot renew --dry-run --no-random-sleep-on-renew
```

Certificates renew automatically via the `certbot.timer` systemd timer.

---

## 10. Verify the deployment

```bash
# Backend
curl https://api.konthora.dev.bd/api/v1/health
# expect: {"status":"alive","environment":"production","ffmpegAvailable":true,...}

# Frontend
curl -I https://konthora.dev.bd                     # 200, gzip, security headers
curl -I https://konthora.dev.bd/robots.txt          # Sitemap: https://konthora.dev.bd/sitemap.xml
curl -I https://konthora.dev.bd/sitemap.xml         # urls under https://konthora.dev.bd
curl -I https://konthora.dev.bd/manifest.webmanifest
curl -I https://konthora.dev.bd/text-to-speech      # 200
curl -I https://konthora.dev.bd/audio-to-text       # 200

# Redirects
curl -I http://konthora.dev.bd/                     # 301 -> https://konthora.dev.bd/
curl -I http://www.konthora.dev.bd/                 # 301 -> https://konthora.dev.bd/
curl -I https://www.konthora.dev.bd/                # 301 -> https://konthora.dev.bd/
curl -I http://api.konthora.dev.bd/api/v1/health    # 301 -> https://api.konthora.dev.bd/...
```

The deploy scripts also provide helpers:

```bash
sudo bash deploy/scripts/healthcheck.sh      # systemd + local + public health (both services)
sudo bash deploy/scripts/logs.sh -f     # tail backend logs
sudo journalctl -u konthora-web -f       # tail frontend logs
```

---

## 11. Frontend (self-hosted on the VPS — no Vercel)

The frontend is built and served on the same EC2 instance. No hosted platform
is used.

1. DNS (registrar): `konthora.dev.bd` A → VPS IP, `www.konthora.dev.bd` CNAME →
   `konthora.dev.bd` (or an A record).
2. `deploy.sh` builds the app with `npm ci` + `next build` using
   `/etc/konthora/web.env` (from `.env.production.example`):
   - `NEXT_PUBLIC_SITE_URL=https://konthora.dev.bd`
   - `NEXT_PUBLIC_CONTACT_EMAIL=hello@konthora.dev.bd`
   - `NEXT_PUBLIC_API_URL=https://api.konthora.dev.bd/api/v1`
3. `konthora-web.service` runs `next start -H 127.0.0.1 -p 3000`; Nginx serves
   it at `https://konthora.dev.bd`.
4. Rebuild + deploy a new frontend release: `sudo bash deploy/scripts/update.sh`.

> The backend `CORS_ORIGINS` must contain exactly `https://konthora.dev.bd`
> (browsers block calls otherwise).

---

## 12. Updating

On the EC2 instance:

```bash
sudo bash deploy/scripts/update.sh
```

What it does: `git reset --hard origin/main` → reinstall Python requirements →
`pip check` → provision models → **rebuild the frontend** (`npm ci` +
`next build`) → refresh Nginx/systemd files → `nginx -t` → reload Nginx →
restart `konthora` and `konthora-web`. If a deploy introduces a schema/config
change that needs manual attention, review `/etc/konthora/konthora.env` and
`/etc/konthora/web.env` after updating.

Both services are updated in one run — there is no separate frontend deploy
step or hosted platform.

---

## 13. Rollback

### Backend (EC2)

Every deploy is a Git commit. Rollback = checkout the previous commit and restart:

```bash
# One step:
sudo bash deploy/scripts/rollback.sh            # to the previously deployed commit
sudo bash deploy/scripts/rollback.sh <sha>      # to a specific commit

# Manually:
cd /opt/konthora/repo
git log --oneline -5
git checkout --force <previous-sha>
sudo /opt/konthora/repo/backend/.venv/bin/pip install -r backend/requirements.txt
sudo systemctl restart konthora
sudo bash deploy/scripts/healthcheck.sh
```

Rollback only touches the code, not the config — the secrets files
(`/etc/konthora/konthora.env`, `/etc/konthora/web.env`) are intentionally left
untouched so a rollback never breaks environment variables.

### Frontend (EC2)

The frontend is a commit in the same repo. `update.sh` writes the previously
deployed commit to `backups/last-release`; to roll back the frontend (and
backend) together, use `rollback.sh` and re-run `update.sh`, or rebuild from an
older tag:

```bash
cd /opt/konthora/repo
git checkout --force <previous-sha>
sudo bash deploy/scripts/update.sh     # rebuilds the frontend + reinstalls backend deps
```

---

## 14. Operations cheat-sheet

```bash
sudo systemctl status konthora konthora-web    # unit states
sudo journalctl -u konthora -f                 # live backend logs
sudo journalctl -u konthora-web -f             # live frontend logs
sudo bash deploy/scripts/backup.sh             # storage + config backup
sudo bash deploy/scripts/cleanup.sh            # manual storage/journal cleanup
sudo nginx -t && sudo systemctl reload nginx
```

## 15. Deploying from a fresh machine (summary)

```bash
# 1. DNS (registrar): A records api.konthora.dev.bd, konthora.dev.bd and
#    www.konthora.dev.bd -> EC2 Elastic IP (create BEFORE deploy.sh runs)
# 2. Provision (installs packages, repo, venv, models, TLS, both services — all in one):
sudo bash deploy/scripts/deploy.sh
# 3. Verify:
curl https://api.konthora.dev.bd/api/v1/health
curl -I https://konthora.dev.bd
```

---

## 16. Troubleshooting

### Service fails to start or keeps restarting

```bash
sudo systemctl status konthora          # unit state + last error
sudo journalctl -u konthora -n 200      # recent logs
sudo bash deploy/scripts/healthcheck.sh
```

Common causes:

| Symptom | Cause | Fix |
| --- | --- | --- |
| `konthora.service: Failed` at startup | missing venv or `EnvironmentFile` | re-run `deploy.sh`; confirm `/etc/konthora/konthora.env` exists (`sudo test -f /etc/konthora/konthora.env`) |
| `ModuleNotFoundError: ...` in logs | stale venv after upgrade | `sudo bash deploy/scripts/update.sh` (reinstalls requirements) |
| Restart loop after 5 failures in 10 min | `StartLimitBurst` exhausted | fix the underlying error, then `sudo systemctl reset-failed konthora` |
| App runs but queue workers never process | `TTS_WORKER_COUNT`/`TRANSCRIPTION_WORKER_COUNT` > 1 | must be `1` (in-process queues); edit `/etc/konthora/konthora.env` and restart |

### Health endpoint reports `ffmpegAvailable: false`

FFmpeg is missing or not on PATH for the `konthora` user:

```bash
sudo -u konthora /opt/konthora/repo/backend/.venv/bin/python -c "from app.core.config import settings"
sudo apt install -y ffmpeg
sudo systemctl restart konthora
```

### Model downloads are slow or fail (first request 500s)

Models download on first use to `/opt/konthora/.cache/huggingface`
(`HF_HOME`, see the systemd unit). `deploy.sh` / `update.sh` pre-warm this cache
via `provision_models.sh`, so a fresh deploy is already warm. If you skipped the
warm-up (`SKIP_MODEL_WARM=1`) or the cache was cleared, warm it manually once:

```bash
sudo bash deploy/scripts/provision_models.sh
```

If the warm-up fails, confirm outbound access to Hugging Face
(`huggingface.co`) and retry — completed downloads are cached, so a re-run
resumes rather than restarting.

### `502 Bad Gateway` from Nginx

The relevant upstream is down or restarting. Check which port is failing first
(`curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/health`
and `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/`), then
restart the corresponding unit:

```bash
sudo systemctl restart konthora       # backend -> port 8000
sudo systemctl restart konthora-web   # frontend -> port 3000
sudo nginx -t && sudo systemctl reload nginx
```

If the frontend 502s right after a deploy, `.next` may be stale or missing —
re-run `sudo bash deploy/scripts/update.sh` to rebuild.

### Certificate does not renew / expires

Renewal runs via `certbot.timer`:

```bash
sudo systemctl list-timers certbot.timer
sudo certbot renew --dry-run --no-random-sleep-on-renew   # both certs must say "success"
```

### High memory usage

The single process holds both models (~2 GB warm). If the box runs out of
memory, confirm `TTS_WORKER_COUNT`/`TRANSCRIPTION_WORKER_COUNT` are `1`, and
raise the instance size (see [deploy/AWS.md](deploy/AWS.md)) or lower
`TRANSCRIPTION_BEAM_SIZE`/`TRANSCRIPTION_MODEL` (e.g. `base.en`).
