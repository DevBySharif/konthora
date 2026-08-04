# Konthora — Production Deployment

This document describes how to deploy the Konthora backend to a fresh
**Ubuntu 24.04 VPS** behind **Nginx + Let's Encrypt**, managed by **systemd**.
The frontend runs on **Vercel**.

- Architecture: `konthora.dev.bd` (Vercel) + `api.konthora.dev.bd` (VPS)
- Launch checklist: [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)
- Monitoring: [deploy/MONITORING.md](deploy/MONITORING.md)

```
Browser ──► Vercel (Next.js)            konthora.dev.bd
Browser ──► Nginx:443 ──► uvicorn:127.0.0.1:8000   api.konthora.dev.bd
              ▲ Let's Encrypt TLS, rate limits, security headers
```

---

## 1. Server requirements

| Resource | Minimum | Recommended |
| --- | --- | --- |
| CPU | 2 vCPU | 4 vCPU |
| RAM | 3 GB | 6 GB (models load lazily, ~2 GB once warm) |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 24.04 LTS (x86_64) | same |
| Network | Public IPv4, 22/80/443 open | same |

Models are downloaded on first use into `~/.cache/huggingface`
(≈160 MB Kokoro + ≈460 MB Whisper small.en). The default
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

Node is **only** needed to build the frontend. On Vercel you do not install Node
at all (the platform builds for you). If you self-host the frontend on the VPS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

## 5. FFmpeg (backend dependency)

Required for MP3 encoding and for transcription media processing (extraction,
inspection).

```bash
sudo apt install -y ffmpeg
ffmpeg -version   # ffprobe ships with ffmpeg
```

Verify the backend sees it: `GET /api/v1/health` → `"ffmpegAvailable": true`.

## 6. eSpeak NG (backend dependency)

Required for Kokoro's English grapheme-to-phoneme stage.

```bash
sudo apt install -y espeak-ng
```

Auto-discovery finds `/usr/bin/espeak-ng`, so `ESPEAK_PATH` can stay empty in
`/etc/konthora/konthora.env`.

---

## 7. Deploying the backend (first time)

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

What `deploy.sh` does:

1. Installs packages: python3.11, ffmpeg, espeak-ng, nginx, git, build tools.
2. Creates the unprivileged `konthora` system user.
3. Clones/pulls the repository into `/opt/konthora/repo`.
4. Creates `backend/.venv` and installs `backend/requirements.txt`
   (then runs `pip check`).
5. Installs `/etc/konthora/konthora.env` (mode 600) from
   `backend/.env.production.example`. **Review this file** before going live.
6. Creates `backend/storage` and `/var/log/konthora` owned by `konthora`.
7. Installs Nginx configs and the systemd unit, enables the service.
8. Issues a Let's Encrypt certificate for `api.konthora.dev.bd`.
9. Starts the service and reloads Nginx.

Manual equivalents of steps 5–9 are shown below.

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
| `MemoryMax=4G`, `LimitNOFILE=65535`, `CPUQuota=1000%` | | resource limits |
| `StandardOutput/StandardError=journal` | | logs via journald |
| `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=full`, `ProtectHome`, `ReadWritePaths=...` | | security hardening |

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now konthora
sudo systemctl status konthora
```

### Nginx — reverse proxy

Configs installed by the deploy script (see [deploy/nginx/](deploy/nginx/)):

| File | Installed as |
| --- | --- |
| `nginx.conf` (http tuning, gzip, rate-limit zones, HTTP→HTTPS) | `/etc/nginx/nginx.conf` |
| `api.konthora.dev.bd.conf` (TLS site for the API) | `/etc/nginx/sites-available/` |
| `security_headers.conf` | `/etc/nginx/conf.d/` |
| `proxy_params.conf` | `/etc/nginx/proxy_params.conf` |

Highlights:

- `client_max_body_size 110m` — supports 100 MB transcription uploads.
- `proxy_read_timeout 600s` / `proxy_send_timeout 600s` — long inference jobs.
- `proxy_buffering off` — streams large audio downloads.
- gzip on textual responses only (never audio).
- Rate-limit zones: `konthora_api` (30 r/s) and `konthora_jobs` (5 r/s) as
  defense-in-depth; the backend also rate-limits per IP.
- `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for` + uvicorn
  `--forwarded-allow-ips 127.0.0.1` keeps client-IP rate limiting correct.

Enable and validate:

```bash
sudo ln -s /etc/nginx/sites-available/api.konthora.dev.bd.conf \
           /etc/nginx/sites-enabled/api.konthora.dev.bd.conf
sudo nginx -t
sudo systemctl reload nginx
```

### Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.konthora.dev.bd \
     --non-interactive --agree-tos -m hello@konthora.dev.bd
# Renewal (certbot.timer runs automatically; test it):
sudo certbot renew --dry-run
```

Certificates renew automatically via the `certbot.timer` systemd timer.

---

## 8. Verify the deployment

```bash
# Backend
curl https://api.konthora.dev.bd/api/v1/health
# expect: {"status":"alive","environment":"production","ffmpegAvailable":true,...}

# Frontend (after the Vercel deployment)
curl -I https://konthora.dev.bd
```

The deploy scripts also provide helpers:

```bash
sudo bash deploy/scripts/health.sh      # systemd + local + public health
sudo bash deploy/scripts/logs.sh -f     # tail backend logs
```

---

## 9. Frontend (Vercel)

1. Import `DevBySharif/konthora` into Vercel (framework preset Next.js).
2. Set production env vars:
   - `NEXT_PUBLIC_SITE_URL=https://konthora.dev.bd`
   - `NEXT_PUBLIC_CONTACT_EMAIL=hello@konthora.dev.bd`
   - `NEXT_PUBLIC_API_URL=https://api.konthora.dev.bd/api/v1`
3. Add `konthora.dev.bd` as a custom domain.
4. Deploy `main`. Verify `/robots.txt`, `/sitemap.xml` and an end-to-end job.

> The backend `CORS_ORIGINS` must contain exactly `https://konthora.dev.bd`
> (browsers block calls otherwise).

---

## 10. Updating

On the VPS:

```bash
sudo bash deploy/scripts/update.sh
```

What it does: `git reset --hard origin/main` → reinstall Python requirements →
`pip check` → refresh Nginx/systemd files → `nginx -t` → reload Nginx → restart
`konthora`. If a deploy introduces a schema/config change that needs manual
attention, review `/etc/konthora/konthora.env` after updating.

Frontend updates are pushed to Vercel automatically on merge to `main`
(deploy the `main` branch, or use Vercel's "Production" deployment setting).

---

## 11. Rollback

### Backend (VPS)

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
sudo bash deploy/scripts/health.sh
```

Rollback only touches the code, not the config — the secrets file
(`/etc/konthora/konthora.env`) is intentionally left untouched so a rollback
never breaks environment variables.

### Frontend (Vercel)

Use **Instant Rollback** in the Vercel dashboard (Deployments → three-dot menu →
Rollback to previous deployment).

---

## 12. Operations cheat-sheet

```bash
sudo systemctl status konthora          # unit state
sudo journalctl -u konthora -f          # live backend logs
sudo bash deploy/scripts/backup.sh      # storage + config backup
sudo bash deploy/scripts/cleanup.sh     # manual storage/journal cleanup
sudo nginx -t && sudo systemctl reload nginx
```

## 13. Deploying from a fresh machine (summary)

```bash
# 1. DNS: A record api -> VPS IP (create first)
# 2. Provision:
sudo bash deploy.sh
# 3. Verify:
curl https://api.konthora.dev.bd/api/v1/health
```
