#!/usr/bin/env bash
# =============================================================================
# Konthora — first deployment / provisioning (Ubuntu 24.04 VPS)
# =============================================================================
# Run as a user with passwordless sudo:
#   sudo bash deploy.sh
#
# What this does:
#   1. Installs system packages (Python 3.11, FFmpeg, eSpeak NG, Nginx, git).
#   2. Creates the unprivileged 'konthora' service account.
#   3. Clones the repository into /opt/konthora/repo.
#   4. Creates a virtualenv and installs requirements.
#   5. Generates /etc/konthora/konthora.env from backend/.env.production.example.
#   6. Creates storage + log directories owned by 'konthora'.
#   7. Installs Nginx configs and the systemd unit.
#   8. Obtains a Let's Encrypt certificate for api.konthora.dev.bd.
#   9. Starts konthora.service and reloads Nginx.
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
log "1/9 Installing system packages..."
apt-get update -qq
apt-get install -y \
  python3 python3-venv python3-pip python3-dev \
  ffmpeg espeak-ng \
  nginx \
  git curl ca-certificates \
  build-essential

# ---------------------------------------------------------------------------
log "2/9 Creating service account..."
if ! id -u "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir /opt/konthora --shell /usr/sbin/nologin "$SERVICE_USER"
fi

# ---------------------------------------------------------------------------
log "3/9 Cloning repository..."
mkdir -p "$APP_DIR"
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
else
  log "Repo already present, pulling latest."
  git -C "$REPO_DIR" fetch --prune origin
  git -C "$REPO_DIR" reset --hard origin/main
fi
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$REPO_DIR"

# ---------------------------------------------------------------------------
log "4/9 Creating virtualenv and installing dependencies..."
if [ ! -x "$BACKEND_DIR/.venv/bin/python" ]; then
  python3 -m venv "$BACKEND_DIR/.venv"
fi
"$BACKEND_DIR/.venv/bin/pip" install --upgrade pip setuptools wheel
"$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
"$BACKEND_DIR/.venv/bin/python" -m pip check
log "pip check OK (no broken requirements)"

# ---------------------------------------------------------------------------
log "5/9 Generating backend secrets file..."
mkdir -p "$(dirname "$BACKEND_ENV_FILE")"
if [ ! -f "$BACKEND_ENV_FILE" ]; then
  install -o root -g root -m 600 "$BACKEND_ENV_TEMPLATE" "$BACKEND_ENV_FILE"
  log "Created $BACKEND_ENV_FILE from template. Review it before continuing:"
  log "   sudo nano $BACKEND_ENV_FILE"
else
  log "$BACKEND_ENV_FILE already exists; keeping existing values."
fi

# ---------------------------------------------------------------------------
log "6/9 Creating storage and log directories..."
mkdir -p "$STORAGE_DIR" "$LOG_DIR"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$STORAGE_DIR" "$LOG_DIR"

# ---------------------------------------------------------------------------
log "7/9 Installing Nginx and systemd configuration..."
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/nginx.conf" /etc/nginx/nginx.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/security_headers.conf" "$NGINX_CONF_DIR/security_headers.conf"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/proxy_params.conf" /etc/nginx/proxy_params.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/$NGINX_API_CONF" "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF"
# OPTIONAL: self-hosted frontend (only if NOT using Vercel) — see the config file.
# install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/konthora.dev.bd.conf" "$NGINX_SITES_AVAILABLE/konthora.dev.bd.conf"

ln -sfn "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF" "$NGINX_SITES_ENABLED/$NGINX_API_CONF"
install -o root -g root -m 644 "$SCRIPT_DIR/../systemd/$SERVICE_NAME" "/etc/systemd/system/$SERVICE_NAME"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

# Validate and reload Nginx BEFORE requesting the certificate so the HTTP-01
# challenge is served by the api.konthora.dev.bd server block.
nginx -t
systemctl reload nginx

# ---------------------------------------------------------------------------
log "8/9 Obtaining Let's Encrypt certificate..."
if [ ! -f "/etc/letsencrypt/live/$CERT_DOMAIN/fullchain.pem" ]; then
  apt-get install -y certbot python3-certbot-nginx >/dev/null
  certbot certonly --nginx -d "$CERT_DOMAIN" --non-interactive --agree-tos -m "$CERT_EMAIL"
  # Reload again so Nginx picks up the freshly issued certificate.
  nginx -t
  systemctl reload nginx
else
  log "Certificate already present; skipping issuance."
fi

# ---------------------------------------------------------------------------
log "9/9 Starting services..."
systemctl restart "$SERVICE_NAME"

log "Deployment complete."
log "   Check:  sudo systemctl status $SERVICE_NAME"
log "   Logs:   ./logs.sh"
log "   Health: ./health.sh  (expect HTTP 200 with status=alive)"
