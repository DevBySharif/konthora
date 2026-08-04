# Konthora — Launch Checklist

A step-by-step checklist for taking Konthora live on **AWS EC2** (backend) +
**Vercel** (frontend). Work through the items top to bottom. Technical details
live in [DEPLOYMENT.md](DEPLOYMENT.md), AWS sizing in [deploy/AWS.md](deploy/AWS.md),
monitoring in [deploy/MONITORING.md](deploy/MONITORING.md).

> Domains used throughout: `konthora.dev.bd` (frontend / Vercel) and
> `api.konthora.dev.bd` (backend / EC2). Swap these if you use different domains.

---

## 1. AWS account & billing safeguards (BEFORE anything else)

- [ ] AWS account created with root credentials secured (MFA enabled).
- [ ] IAM user for day-to-day administration (least privilege; no root usage).
- [ ] **Understand the budget:** ≈ USD $100 of credits. Read the "Credit
      Survival Plan" in [deploy/AWS.md](deploy/AWS.md) — the credits will NOT
      necessarily last six months.
- [ ] **Create an AWS Budget** (`Billing → Budgets`) for monthly cost, with
      **alerts at USD $10, $25, $50, $75 and $90** (email/SNS).
- [ ] Enable **Free Tier / credit usage alerts** in Billing.
- [ ] Enable **Billing alerts** (first bill alert) — requires the root
      account to accept emails.
- [ ] **Tag all resources** going forward: `Project=Konthora`,
      `Environment=Production`, `Owner=DevBySharif`.
- [ ] Commit to **reviewing Cost Explorer daily** during initial testing.
- [ ] Commit to **stopping/terminating test instances after use**, and to
      checking there are **no unused volumes, snapshots or public IPv4
      addresses** left behind.
- [ ] Remember: **stopped instances still bill EBS and public IPv4** — and a
      **public IPv4 is billed whether attached or not** (≈ $3.65/mo).
- [ ] Recommended region chosen — compare `ap-south-1`, `ap-southeast-1`,
      `us-east-1` in the AWS Pricing Calculator (nearest ≠ cheapest).

## 2. Free-plan limitations

- [ ] Understand the AWS Free Plan: it ends when **credits are exhausted or
      the plan expiration date is reached**; it may restrict services; it does
      **not** guarantee a compute-heavy instance can run continuously for six
      months; continued use after expiry requires an **explicit upgrade to the
      paid plan**. Hosting is not free merely because credits exist.

## 3. Benchmark before instance selection

- [ ] Run `deploy/scripts/benchmark_resources.sh` locally, then on EC2.
- [ ] Exercise real TTS + transcription and record idle/warm/peak RAM, CPU,
      TTS time, transcription real-time factor, model-cache and temp size
      (see [deploy/AWS.md](deploy/AWS.md) → Benchmark table).
- [ ] Choose the tier from the measurements:
      A validation (smallest that fits) / B MVP (4 vCPU · 8 GiB) / C scale-up.

## 4. EC2 instance

- [ ] **AMI:** Ubuntu 24.04 LTS (x86_64).
- [ ] **Type:** tier from the benchmark — **do not default to `c6i.xlarge`**
      (see [deploy/AWS.md](deploy/AWS.md)).
- [ ] **EBS:** **40 GiB gp3** root volume, encrypted (default). 80 GiB only if
      you want a safer tier. Expand later with `modify-volume` (no re-launch).
- [ ] Instance launched in the chosen VPC/subnet with a **public IPv4**
      (auto-assigned is fine to start; see §5).
- [ ] Instance profile (optional): `AmazonSSMManagedInstanceCore` for SSM
      Session Manager access.
- [ ] Tag it `Project=Konthora`, `Environment=Production`, `Owner=DevBySharif`.

## 5. Public IPv4 / Elastic IP

- [ ] **Know the cost:** every public IPv4 (attached or not) is billed
      ≈ $0.005/hr ≈ **$3.65/mo**. It is **not free**.
- [ ] Start with the instance's **auto-assigned public IPv4** and point DNS at
      it (re-check it if you stop/start, it may change).
- [ ] Allocate an **Elastic IP** only if you want a stable identity for a
      constantly-running instance; **release it** whenever you stop for more
      than a couple of days (dropping the $3.65/mo charge).
- [ ] If you stop the instance for a longer pause, record the config, stop, and
      **release the Elastic IP** to stop IPv4 billing.

## 6. Security Group

- [ ] Security Group `konthora-backend` attached to the instance with **inbound**:
      - `22` TCP from **your IP only** (`/32`)
      - `80` TCP from `0.0.0.0/0`
      - `443` TCP from `0.0.0.0/0`
- [ ] **No** inbound `8000` (uvicorn is loopback-only).
- [ ] **Outbound:** 80/443 (apt, pip, GitHub, Hugging Face), 22 (git over SSH),
      53 UDP (DNS) allowed.

## 7. SSH / admin access

- [ ] SSH key pair created; private key stored in a password manager (never
      committed — `*.pem` is gitignored).
- [ ] `ssh ubuntu@<public-ipv4-or-eip>` works.
- [ ] (Alternative) SSM Session Manager works if you attached the SSM profile.
- [ ] Password SSH auth disabled; `PermitRootLogin no`.

## 8. DNS

- [ ] Registrar has **A record** `api.konthora.dev.bd` → EC2 **public IPv4 /
      Elastic IP**.
- [ ] `konthora.dev.bd` → Vercel (`cname.vercel-dns.com` via CNAME/ALIAS) or
      Vercel's IPs with an A record.
- [ ] `www.konthora.dev.bd` → `konthora.dev.bd` (optional).
- [ ] Propagated: `nslookup api.konthora.dev.bd` returns the Elastic IP.

## 9. Instance software

The provisioning script installs everything below (`deploy.sh`). If doing it
manually, verify each:

- [ ] Ubuntu 24.04 base updated (`sudo apt update && sudo apt upgrade -y`).
- [ ] **Git**: `git --version`.
- [ ] **Python 3.11**: `python3.11 --version` (deadsnakes; `deploy.sh` installs it).
- [ ] **Node 20** (only needed if self-hosting the frontend — Vercel needs none).
- [ ] **FFmpeg**: `ffmpeg -version` (health endpoint reports
      `"ffmpegAvailable": true`).
- [ ] **eSpeak NG**: `espeak-ng --version`.
- [ ] **Nginx**: `nginx -v`.
- [ ] **UFW** firewall: only 22, 80, 443 open.

## 10. Clone + install requirements

- [ ] `git clone https://github.com/DevBySharif/konthora.git /opt/konthora/repo`
- [ ] venv created: `python3.11 -m venv /opt/konthora/repo/backend/.venv`.
- [ ] `pip install -r backend/requirements.txt` completes.
- [ ] `pip check` reports "No broken requirements".

## 11. Environment variables

- [ ] **Backend:** `/etc/konthora/konthora.env` exists, mode `600`, owned by
      `root:root`, with at least:
      - `APP_ENV=production`
      - `CORS_ORIGINS=https://konthora.dev.bd`
      - `TRUST_PROXY_HEADERS=true`
      - `TRUSTED_HOSTS=api.konthora.dev.bd`
      - `TTS_STORAGE_ROOT=/opt/konthora/repo/backend/storage`
      - `LOG_DIR=/var/log/konthora`
- [ ] **Frontend (Vercel):** production env vars set:
      - `NEXT_PUBLIC_SITE_URL=https://konthora.dev.bd`
      - `NEXT_PUBLIC_CONTACT_EMAIL=hello@konthora.dev.bd`
      - `NEXT_PUBLIC_API_URL=https://api.konthora.dev.bd/api/v1`
- [ ] Backend `CORS_ORIGINS` origin matches `NEXT_PUBLIC_SITE_URL`.

## 12. systemd

- [ ] `konthora.service` installed and enabled:
      `sudo systemctl enable --now konthora`.
- [ ] Runs as unprivileged `konthora` user; `--workers 1`; loopback bind.
- [ ] Auto-restart on failure and on boot.
- [ ] `sudo systemctl status konthora` → `active (running)`.

## 13. Nginx

- [ ] Configs installed (main `nginx.conf`, `api.konthora.dev.bd.conf`,
      `security_headers.conf`, `proxy_params.conf`).
- [ ] `sudo nginx -t` → `syntax is ok`.
- [ ] Site enabled; `sudo systemctl reload nginx`.
- [ ] HTTP → HTTPS redirect works (`curl -I http://api.konthora.dev.bd` → 301).
- [ ] Security headers present on responses (nosniff, CSP, HSTS, X-Frame-Options).

## 14. Let's Encrypt

- [ ] Certificate issued for `api.konthora.dev.bd`.
- [ ] Auto-renewal active: `sudo certbot renew --dry-run` succeeds.
- [ ] `https://api.konthora.dev.bd/api/v1/health` → `{"status":"alive", ...}`
      over TLS.
- [ ] (Optional) SSL Labs grade A+.

## 15. Vercel (frontend)

- [ ] Repository `DevBySharif/konthora` imported into a Vercel project.
- [ ] Framework preset **Next.js**; root directory `/`.
- [ ] Production env vars set (section 9).
- [ ] `konthora.dev.bd` (and `www.`) added as production domains.
- [ ] Production deploy succeeds; `/sitemap.xml` and `/robots.txt` resolve.

## 16. Production smoke tests

- [ ] Backend health over the public URL returns `status: alive`.
- [ ] **TTS job** end-to-end on `https://konthora.dev.bd/text-to-speech`
      (text → MP3 download).
- [ ] **Transcription job** end-to-end on
      `https://konthora.dev.bd/audio-to-text` (audio → timestamped transcript/SRT).
- [ ] Rate-limit 429 responses are friendly after sustained requests.
- [ ] `modelReady` flips to `true` after first use (lazy load is expected).

## 17. Analytics

- [ ] Analytics script installed (e.g. Plausible / Google Analytics 4 /
      Cloudflare Web Analytics) in the frontend.
- [ ] Verify a pageview fires on `https://konthora.dev.bd`.

## 18. Google Search Console

- [ ] Add `https://konthora.dev.bd` as a Domain property.
- [ ] Verify ownership (DNS TXT or HTML meta tag).
- [ ] Submit `https://konthora.dev.bd/sitemap.xml`.
- [ ] Request indexing for `/`, `/text-to-speech`, `/audio-to-text` once live.

## 19. Bing Webmaster Tools

- [ ] Add the site in Bing Webmaster Tools.
- [ ] Verify ownership (import from Google Search Console or DNS/HTML).
- [ ] Submit `https://konthora.dev.bd/sitemap.xml`.

## 20. SEO / social verification

- [ ] `/robots.txt` served with `sitemap: https://konthora.dev.bd/sitemap.xml`.
- [ ] `/sitemap.xml` lists all 8 pages with `https://konthora.dev.bd` URLs.
- [ ] `/manifest.json` served with name/theme/icons
      (`src/app/manifest.ts`).
- [ ] Every page has title/description/canonical + `openGraph` + `twitter`
      metadata (`src/lib/metadata.ts`).
- [ ] `og:image` renders (`src/app/opengraph-image.tsx`) — verify with
      https://www.opengraph.xyz or the Meta Sharing Debugger.
- [ ] `twitter:image` renders (`src/app/twitter-image.tsx`).
- [ ] JSON-LD structured data present on every page (`src/components/JsonLd.tsx`).
- [ ] Favicon renders (`src/app/favicon.ico`).

## 21. Monitoring

- [ ] UptimeRobot / Better Stack heartbeat on
      `https://api.konthora.dev.bd/api/v1/health`.
- [ ] Disk/RAM/CPU alerts configured (see [deploy/MONITORING.md](deploy/MONITORING.md)).
- [ ] Alert destination (email/slack/webhook) tested.

## 22. Backups

- [ ] `sudo bash deploy/scripts/backup.sh` run once manually.
- [ ] Nightly cron scheduled:
      `0 2 * * * bash /opt/konthora/repo/deploy/scripts/backup.sh`.
- [ ] A restore path verified (extract `backups/config-*.tar.gz`).

---

## Post-launch

- [ ] First-day error log watch: `journalctl -u konthora -f`.
- [ ] Cost review after one month vs the estimate in
      [deploy/AWS.md](deploy/AWS.md) (~$120/mo).
