#!/usr/bin/env bash
# =============================================================================
# Konthora — update deployment
# =============================================================================
# Pulls the latest main, reinstalls backend + frontend dependencies, rebuilds
# the Next.js app, refreshes Nginx/systemd configs, and restarts both services.
# Run with sudo:
#   sudo bash update.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

log() { printf '\033[1;34m[update]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[update] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash update.sh)."
[ -d "$REPO_DIR/.git" ] || die "Repository not found at $REPO_DIR. Run deploy.sh first."

# Remember the current commit for potential rollback.
BEFORE=$(git -C "$REPO_DIR" rev-parse --short HEAD)
log "Current release: $BEFORE"
mkdir -p "$BACKUP_DIR"
printf '%s\n' "$BEFORE" > "$BACKUP_DIR/last-release"

# Defaults for keys added after existing konthora.env files were created.
NODE_MAJOR="${NODE_MAJOR:-22}"
WEB_ENV_FILE="${WEB_ENV_FILE:-/etc/konthora/web.env}"
WEB_ENV_TEMPLATE="${WEB_ENV_TEMPLATE:-$REPO_DIR/.env.production.example}"
WEB_SERVICE_NAME="${WEB_SERVICE_NAME:-konthora-web.service}"
NGINX_WEB_CONF="${NGINX_WEB_CONF:-konthora.dev.bd.conf}"

log "1/7 Fetching latest remote..."
git -C "$REPO_DIR" fetch --prune origin
git -C "$REPO_DIR" reset --hard origin/main
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$REPO_DIR"
if [ -d "$BACKEND_DIR/.venv" ]; then
  chown -R root:root "$BACKEND_DIR/.venv"
fi

log "2/7 Updating backend Python dependencies..."
"$BACKEND_DIR/.venv/bin/pip" install --upgrade pip
"$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
"$BACKEND_DIR/.venv/bin/python" -m pip check

log "3/7 Provisioning ML models (spaCy + Kokoro + Whisper warm-up)..."
bash "$SCRIPT_DIR/provision_models.sh"

log "4/7 Rebuilding frontend..."
if [ ! -f "$WEB_ENV_FILE" ]; then
  install -o root -g root -m 600 "$WEB_ENV_TEMPLATE" "$WEB_ENV_FILE"
  log "Created $WEB_ENV_FILE from template."
fi
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
(cd "$REPO_DIR" && npm ci --no-audit --no-fund)
set -a
# shellcheck disable=SC1090
source "$WEB_ENV_FILE"
set +a
(cd "$REPO_DIR" && npm run build)
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$REPO_DIR/.next" "$REPO_DIR/node_modules"

log "5/7 Refreshing Nginx and systemd configuration..."
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/nginx.conf" /etc/nginx/nginx.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/security_headers.conf" "$NGINX_CONF_DIR/security_headers.conf"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/frontend_security_headers.conf" "$NGINX_CONF_DIR/frontend_security_headers.conf"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/proxy_params.conf" /etc/nginx/proxy_params.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/$NGINX_API_CONF" "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/$NGINX_WEB_CONF" "$NGINX_SITES_AVAILABLE/$NGINX_WEB_CONF"
ln -sfn "$NGINX_SITES_AVAILABLE/$NGINX_WEB_CONF" "$NGINX_SITES_ENABLED/$NGINX_WEB_CONF"
install -o root -g root -m 644 "$SCRIPT_DIR/../systemd/$SERVICE_NAME" "/etc/systemd/system/$SERVICE_NAME"
install -o root -g root -m 644 "$SCRIPT_DIR/../systemd/$WEB_SERVICE_NAME" "/etc/systemd/system/$WEB_SERVICE_NAME"
nginx -t
systemctl daemon-reload
systemctl reload nginx

log "6/7 Restarting services..."
systemctl restart "$SERVICE_NAME"
systemctl restart "$WEB_SERVICE_NAME"

AFTER=$(git -C "$REPO_DIR" rev-parse --short HEAD)
log "7/7 Updated: $BEFORE -> $AFTER"
log "Verify with ./healthcheck.sh"