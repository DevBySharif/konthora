#!/usr/bin/env bash
# =============================================================================
# Konthora — first deployment / provisioning (Ubuntu 24.04 VPS)
# =============================================================================
# Run as a user with passwordless sudo:
#   sudo bash deploy.sh
#
# Idempotent — safe to re-run: existing state is preserved (the secrets file is
# not overwritten, an existing certificate is not re-issued, cached model
# weights are reused, and the venv is only created once).
#
# What this does:
#   1. Installs system packages (Python 3.11 via deadsnakes, FFmpeg, eSpeak NG,
#      Nginx, Certbot, git, build tools).
#   2. Creates the unprivileged 'konthora' service account.
#   3. Clones the repository into /opt/konthora/repo.
#   4. Creates a virtualenv and installs requirements.
#   5. Generates /etc/konthora/konthora.env from backend/.env.production.example.
#   6. Creates storage, log and model-cache directories.
#   7. Provisions ML models (spaCy en_core_web_sm + Kokoro + Faster Whisper
#      warm-up) — see provision_models.sh.
#   8. Installs Nginx configs and the systemd unit.
#   9. Obtains a Let's Encrypt certificate for api.konthora.dev.bd (standalone
#      bootstrap; skipped if one is already present) and wires renewal hooks.
#  10. Validates and starts Nginx.
#  11. Starts konthora.service.
#
# Prerequisites:
#   - DNS: an A record for api.konthora.dev.bd -> this VPS IP (create BEFORE run).
#   - The backend/.env.production.example values (CORS_ORIGINS, TRUSTED_HOSTS)
#     already match the production domains.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

export DEBIAN_FRONTEND=noninteractive

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[deploy] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash deploy.sh)."

# ---------------------------------------------------------------------------
log "1/11 Installing system packages..."
apt-get update -qq
apt-get install -y \
  python3 python3-venv python3-pip python3-dev \
  ffmpeg espeak-ng \
  nginx certbot \
  git curl ca-certificates \
  build-essential software-properties-common

# Konthora is verified on Python 3.11. Prefer it over the distro 3.12; the
# pinned requirements install on both, but 3.11 is the tested parity target.
if ! command -v python3.11 >/dev/null 2>&1; then
  add-apt-repository ppa:deadsnakes/ppa -y >/dev/null 2>&1 || true
  apt-get update -qq
  apt-get install -y python3.11 python3.11-venv python3.11-dev
fi

# ---------------------------------------------------------------------------
log "2/11 Creating service account..."
if ! id -u "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "$APP_DIR" --shell /usr/sbin/nologin "$SERVICE_USER"
fi

# ---------------------------------------------------------------------------
log "3/11 Cloning repository..."
mkdir -p "$APP_DIR"
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
else
  log "Repo already present, pulling latest."
  git -C "$REPO_DIR" fetch --prune origin
  git -C "$REPO_DIR" reset --hard origin/main
fi
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$REPO_DIR"
# Keep the virtualenv root-owned so the service user can never modify its own
# code (ProtectSystem=full leaves /opt writable, so a konthora-owned venv would
# be writable). Restore on every run so this holds even when deploy.sh is run
# again over an existing .venv.
if [ -d "$BACKEND_DIR/.venv" ]; then
  chown -R root:root "$BACKEND_DIR/.venv"
fi

# ---------------------------------------------------------------------------
log "4/11 Creating virtualenv and installing dependencies..."
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
log "5/11 Generating backend secrets file..."
mkdir -p "$(dirname "$BACKEND_ENV_FILE")"
if [ ! -f "$BACKEND_ENV_FILE" ]; then
  install -o root -g root -m 600 "$BACKEND_ENV_TEMPLATE" "$BACKEND_ENV_FILE"
  log "Created $BACKEND_ENV_FILE from template. Review it before continuing:"
  log "   sudo nano $BACKEND_ENV_FILE"
else
  log "$BACKEND_ENV_FILE already exists; keeping existing values."
fi

# ---------------------------------------------------------------------------
log "6/11 Creating storage, log and model-cache directories..."
mkdir -p "$STORAGE_DIR" "$LOG_DIR" "$CACHE_ROOT" "$HF_CACHE_DIR"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$STORAGE_DIR" "$LOG_DIR" "$CACHE_ROOT"

# ---------------------------------------------------------------------------
log "7/11 Provisioning ML models (spaCy + Kokoro + Faster Whisper)..."
bash "$SCRIPT_DIR/provision_models.sh"

# ---------------------------------------------------------------------------
log "8/11 Installing Nginx and systemd configuration..."
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/nginx.conf" /etc/nginx/nginx.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/security_headers.conf" "$NGINX_CONF_DIR/security_headers.conf"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/proxy_params.conf" /etc/nginx/proxy_params.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/$NGINX_API_CONF" "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF"
# OPTIONAL: self-hosted frontend (only if NOT using Vercel) — see the config file.
# install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/konthora.dev.bd.conf" "$NGINX_SITES_AVAILABLE/konthora.dev.bd.conf"

# The Ubuntu 'default' site is unused and would otherwise grab port 80 for the
# server's IP; remove it so only the API site (and its HTTP->HTTPS redirect)
# listen.
rm -f "$NGINX_SITES_ENABLED/default"
ln -sfn "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF" "$NGINX_SITES_ENABLED/$NGINX_API_CONF"
install -o root -g root -m 644 "$SCRIPT_DIR/../systemd/$SERVICE_NAME" "/etc/systemd/system/$SERVICE_NAME"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

# ---------------------------------------------------------------------------
log "9/11 Obtaining Let's Encrypt certificate..."
if [ ! -f "/etc/letsencrypt/live/$CERT_DOMAIN/fullchain.pem" ]; then
  # The api server block is TLS-only (listen 443 ssl) and references the cert
  # path, so Nginx cannot validate/start until the certificate exists. Bootstrap
  # with the standalone authenticator while port 80 is free (on a fresh box
  # Nginx is not running yet).
  systemctl stop nginx 2>/dev/null || true
  certbot certonly --standalone -d "$CERT_DOMAIN" --non-interactive --agree-tos -m "$CERT_EMAIL" \
    || die "Certificate issuance failed for $CERT_DOMAIN. Confirm DNS resolves to this host and that port 80 is reachable, then re-run."
  # Renewal hooks: standalone needs port 80 free, so stop/start Nginx around
  # renewals. certbot.timer runs certbot renew automatically.
  mkdir -p /etc/letsencrypt/renewal-hooks/pre /etc/letsencrypt/renewal-hooks/post
  printf '#!/bin/sh\nsystemctl stop nginx || true\n' > /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh
  printf '#!/bin/sh\nsystemctl start nginx || true\n' > /etc/letsencrypt/renewal-hooks/post/start-nginx.sh
  chmod +x /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh /etc/letsencrypt/renewal-hooks/post/start-nginx.sh
  log "Certificate issued for $CERT_DOMAIN (renewal hooks installed)."
else
  log "Certificate already present; skipping issuance."
fi

# ---------------------------------------------------------------------------
log "10/11 Validating and starting Nginx..."
nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl start nginx
systemctl reload nginx

# ---------------------------------------------------------------------------
log "11/11 Starting services..."
systemctl restart "$SERVICE_NAME"

log "Deployment complete."
log "   Check:  sudo systemctl status $SERVICE_NAME"
log "   Logs:   ./logs.sh"
log "   Health: ./healthcheck.sh  (expect HTTP 200 with status=alive)"
