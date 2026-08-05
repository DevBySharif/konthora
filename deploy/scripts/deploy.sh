#!/usr/bin/env bash
# =============================================================================
# Konthora — first deployment / provisioning (Ubuntu 24.04 VPS)
# =============================================================================
# Run as a user with passwordless sudo:
#   sudo bash deploy.sh
#
# Idempotent — safe to re-run: existing state is preserved (the secrets files
# are not overwritten, existing certificates are not re-issued, cached model
# weights are reused, node_modules / .next are rebuilt incrementally, and the
# venv is only created once).
#
# What this does:
#   1. Installs system packages (Python 3.11 via deadsnakes, FFmpeg, eSpeak NG,
#      Node.js 22 via NodeSource, Nginx, Certbot, git, build tools).
#   2. Creates the unprivileged 'konthora' service account.
#   3. Clones the repository into /opt/konthora/repo.
#   4. Creates a virtualenv and installs backend requirements.
#   5. Generates /etc/konthora/konthora.env from backend/.env.production.example.
#   6. Generates /etc/konthora/web.env from .env.production.example and builds
#      the Next.js frontend (`npm ci` + `next build`).
#   7. Creates storage, log and model-cache directories.
#   8. Provisions ML models (spaCy en_core_web_sm + Kokoro + Faster Whisper
#      warm-up) — see provision_models.sh.
#   9. Installs Nginx configs and the two systemd units (konthora + konthora-web).
#  10. Obtains Let's Encrypt certificates for api.konthora.dev.bd AND
#      konthora.dev.bd (+www) (standalone bootstrap; skipped if already present)
#      and wires renewal hooks.
#  11. Validates and starts Nginx.
#  12. Starts konthora.service and konthora-web.service.
#
# Prerequisites:
#   - DNS: A records for api.konthora.dev.bd, konthora.dev.bd and
#     www.konthora.dev.bd -> this VPS IP (create BEFORE run).
#   - The backend/.env.production.example values (CORS_ORIGINS, TRUSTED_HOSTS)
#     and .env.production.example (NEXT_PUBLIC_API_URL) already match the
#     production domains.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deploy/scripts/konthora.env
source "$SCRIPT_DIR/konthora.env"

export DEBIAN_FRONTEND=noninteractive

# Robust defaults (overridable in konthora.env). They match the systemd unit's
# HF_HOME/XDG_CACHE_HOME so hosts with a pre-existing konthora.env (created
# before these keys existed) keep working without editing that file.
CACHE_ROOT="${CACHE_ROOT:-/opt/konthora/.cache}"
HF_CACHE_DIR="${HF_CACHE_DIR:-${CACHE_ROOT}/huggingface}"
NODE_MAJOR="${NODE_MAJOR:-22}"
WEB_ENV_FILE="${WEB_ENV_FILE:-/etc/konthora/web.env}"
WEB_ENV_TEMPLATE="${WEB_ENV_TEMPLATE:-$REPO_DIR/.env.production.example}"
WEB_SERVICE_NAME="${WEB_SERVICE_NAME:-konthora-web.service}"
NGINX_WEB_CONF="${NGINX_WEB_CONF:-konthora.dev.bd.conf}"

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[deploy] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash deploy.sh)."

# ---------------------------------------------------------------------------
log "1/12 Installing system packages..."
apt-get update -qq
apt-get install -y \
  python3 python3-venv python3-pip python3-dev \
  ffmpeg espeak-ng \
  nginx certbot \
  git curl ca-certificates \
  build-essential software-properties-common

# Konthora backend is verified on Python 3.11. Prefer it over the distro 3.12;
# the pinned requirements install on both, but 3.11 is the tested parity target.
if ! command -v python3.11 >/dev/null 2>&1; then
  add-apt-repository ppa:deadsnakes/ppa -y >/dev/null 2>&1 || true
  apt-get update -qq
  apt-get install -y python3.11 python3.11-venv python3.11-dev
fi

# Node.js (for the frontend build). Installed via NodeSource; idempotent.
if ! command -v node >/dev/null 2>&1; then
  log "Installing Node.js $NODE_MAJOR via NodeSource..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node --version

# ---------------------------------------------------------------------------
log "2/12 Creating service account..."
if ! id -u "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "$APP_DIR" --shell /usr/sbin/nologin "$SERVICE_USER"
fi

# ---------------------------------------------------------------------------
log "3/12 Cloning repository..."
mkdir -p "$APP_DIR"
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
else
  log "Repo already present, pulling latest."
  git -C "$REPO_DIR" fetch --prune origin
  git -C "$REPO_DIR" reset --hard origin/main
fi
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$REPO_DIR"
# Keep the backend virtualenv root-owned so the service user can never modify
# its own code (ProtectSystem=full leaves /opt writable, so a konthora-owned
# venv would be writable). Restore on every run so this holds even when
# deploy.sh is run again over an existing .venv.
if [ -d "$BACKEND_DIR/.venv" ]; then
  chown -R root:root "$BACKEND_DIR/.venv"
fi

# ---------------------------------------------------------------------------
log "4/12 Creating virtualenv and installing backend dependencies..."
# Prefer Python 3.11 (the version the lockfile was verified on). Falls back to
# the distro Python 3.12, which also installs the pinned requirements.
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3.11 || command -v python3)}"
if [ ! -x "$BACKEND_DIR/.venv/bin/python" ]; then
  "$PYTHON_BIN" -m venv "$BACKEND_DIR/.venv"
fi
"$BACKEND_DIR/.venv/bin/pip" install --upgrade pip setuptools wheel
"$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
"$BACKEND_DIR/.venv/bin/python" -m pip check
log "pip check OK (no broken requirements)"

# ---------------------------------------------------------------------------
log "5/12 Generating backend secrets file..."
mkdir -p "$(dirname "$BACKEND_ENV_FILE")"
if [ ! -f "$BACKEND_ENV_FILE" ]; then
  install -o root -g root -m 600 "$BACKEND_ENV_TEMPLATE" "$BACKEND_ENV_FILE"
  log "Created $BACKEND_ENV_FILE from template. Review it before continuing:"
  log "   sudo nano $BACKEND_ENV_FILE"
else
  log "$BACKEND_ENV_FILE already exists; keeping existing values."
fi

# ---------------------------------------------------------------------------
log "6/12 Generating frontend env and building Next.js..."
mkdir -p "$(dirname "$WEB_ENV_FILE")"
if [ ! -f "$WEB_ENV_FILE" ]; then
  install -o root -g root -m 600 "$WEB_ENV_TEMPLATE" "$WEB_ENV_FILE"
  log "Created $WEB_ENV_FILE from template. Review it: sudo nano $WEB_ENV_FILE"
else
  log "$WEB_ENV_FILE already exists; keeping existing values."
fi
if [ ! -d "$REPO_DIR/node_modules" ]; then
  (cd "$REPO_DIR" && npm ci --no-audit --no-fund)
else
  log "node_modules present; running npm ci to lock exact versions."
  (cd "$REPO_DIR" && npm ci --no-audit --no-fund)
fi
# NEXT_PUBLIC_* are baked in at build time; export them from the env file and
# build. Runtime NEXT_PUBLIC_* are read again by konthora-web.service from the
# same file (metadata routes like robots/sitemap/OG pick them up live).
set -a
# shellcheck disable=SC1090
source "$WEB_ENV_FILE"
set +a
(cd "$REPO_DIR" && npm run build)
# The .next output and node_modules must be readable/writable by konthora at
# runtime (ISR revalidation writes back to .next). The repo was re-owned in
# step 3, but the build just wrote root-owned files; re-own .next + the cache.
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$REPO_DIR/.next" "$REPO_DIR/node_modules"

# ---------------------------------------------------------------------------
log "7/12 Creating storage, log and model-cache directories..."
mkdir -p "$STORAGE_DIR" "$LOG_DIR" "$CACHE_ROOT" "$HF_CACHE_DIR"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$STORAGE_DIR" "$LOG_DIR" "$CACHE_ROOT"

# ---------------------------------------------------------------------------
log "8/12 Provisioning ML models (spaCy + Kokoro + Faster Whisper)..."
bash "$SCRIPT_DIR/provision_models.sh"

# ---------------------------------------------------------------------------
log "9/12 Installing Nginx and systemd configuration..."
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/nginx.conf" /etc/nginx/nginx.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/security_headers.conf" "$NGINX_CONF_DIR/security_headers.conf"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/frontend_security_headers.conf" "$NGINX_CONF_DIR/frontend_security_headers.conf"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/proxy_params.conf" /etc/nginx/proxy_params.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/$NGINX_API_CONF" "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/$NGINX_WEB_CONF" "$NGINX_SITES_AVAILABLE/$NGINX_WEB_CONF"

# The Ubuntu 'default' site is unused and would otherwise grab port 80 for the
# server's IP; remove it so only the API + web sites (and their HTTP->HTTPS
# redirects) listen.
rm -f "$NGINX_SITES_ENABLED/default"
ln -sfn "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF" "$NGINX_SITES_ENABLED/$NGINX_API_CONF"
ln -sfn "$NGINX_SITES_AVAILABLE/$NGINX_WEB_CONF" "$NGINX_SITES_ENABLED/$NGINX_WEB_CONF"
install -o root -g root -m 644 "$SCRIPT_DIR/../systemd/$SERVICE_NAME" "/etc/systemd/system/$SERVICE_NAME"
install -o root -g root -m 644 "$SCRIPT_DIR/../systemd/$WEB_SERVICE_NAME" "/etc/systemd/system/$WEB_SERVICE_NAME"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl enable "$WEB_SERVICE_NAME"

# ---------------------------------------------------------------------------
log "10/12 Obtaining Let's Encrypt certificates..."
# Both TLS-only server blocks reference cert paths, so Nginx cannot validate /
# start until the certificates exist. Bootstrap with the standalone
# authenticator while port 80 is free (on a fresh box Nginx is not running).
systemctl stop nginx 2>/dev/null || true
mkdir -p /etc/letsencrypt/renewal-hooks/pre /etc/letsencrypt/renewal-hooks/post
printf '#!/bin/sh\nsystemctl stop nginx || true\n' > /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh
printf '#!/bin/sh\nsystemctl start nginx || true\n' > /etc/letsencrypt/renewal-hooks/post/start-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh /etc/letsencrypt/renewal-hooks/post/start-nginx.sh

# Backend certificate.
if [ ! -f "/etc/letsencrypt/live/$CERT_DOMAIN/fullchain.pem" ]; then
  certbot certonly --standalone -d "$CERT_DOMAIN" --non-interactive --agree-tos -m "$CERT_EMAIL" \
    || die "Certificate issuance failed for $CERT_DOMAIN. Confirm DNS resolves to this host and that port 80 is reachable, then re-run."
  log "Certificate issued for $CERT_DOMAIN."
else
  log "Certificate for $CERT_DOMAIN already present; skipping issuance."
fi

# Frontend certificate (apex + www in one SAN certificate).
WEB_CERT_DOMAINS="${WEB_CERT_DOMAINS:-konthora.dev.bd www.konthora.dev.bd}"
# Each domain needs its own -d flag; build the argument list explicitly.
WEB_CERT_ARGS=()
for d in $WEB_CERT_DOMAINS; do
  WEB_CERT_ARGS+=(-d "$d")
done
WEB_CERT_DIR="${WEB_CERT_ARGS[1]/-d /}"
if [ ! -f "/etc/letsencrypt/live/$WEB_CERT_DIR/fullchain.pem" ]; then
  certbot certonly --standalone "${WEB_CERT_ARGS[@]}" --non-interactive --agree-tos -m "$CERT_EMAIL" \
    || die "Certificate issuance failed for $WEB_CERT_DOMAINS. Confirm DNS resolves to this host and that port 80 is reachable, then re-run."
  # The apex and www live in one certificate directory; the cert paths in
  # konthora.dev.bd.conf already point at konthora.dev.bd (the first domain).
  log "Certificate issued for $WEB_CERT_DOMAINS."
else
  log "Certificate for $WEB_CERT_DOMAINS already present; skipping issuance."
fi

# ---------------------------------------------------------------------------
log "11/12 Validating and starting Nginx..."
nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl start nginx
systemctl reload nginx

# ---------------------------------------------------------------------------
log "12/12 Starting services..."
systemctl restart "$SERVICE_NAME"
systemctl restart "$WEB_SERVICE_NAME"

log "Deployment complete."
log "   Check:  sudo systemctl status $SERVICE_NAME $WEB_SERVICE_NAME"
log "   Logs:   ./logs.sh"
log "   Health: ./healthcheck.sh  (expect HTTP 200 with status=alive)"