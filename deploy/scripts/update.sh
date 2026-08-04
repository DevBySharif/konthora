#!/usr/bin/env bash
# =============================================================================
# Konthora — update deployment
# =============================================================================
# Pulls the latest main, reinstalls dependencies, refreshes Nginx/systemd
# configs, and restarts the service. Run with sudo:
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

log "1/4 Fetching latest main..."
git -C "$REPO_DIR" fetch --prune origin
git -C "$REPO_DIR" reset --hard origin/main

log "2/4 Updating Python dependencies..."
"$BACKEND_DIR/.venv/bin/pip" install --upgrade pip
"$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
"$BACKEND_DIR/.venv/bin/python" -m pip check

log "3/4 Refreshing Nginx and systemd configuration..."
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/nginx.conf" /etc/nginx/nginx.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/security_headers.conf" "$NGINX_CONF_DIR/security_headers.conf"
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/proxy_params.conf" /etc/nginx/proxy_params.conf
install -o root -g root -m 644 "$SCRIPT_DIR/../nginx/$NGINX_API_CONF" "$NGINX_SITES_AVAILABLE/$NGINX_API_CONF"
install -o root -g root -m 644 "$SCRIPT_DIR/../systemd/$SERVICE_NAME" "/etc/systemd/system/$SERVICE_NAME"
nginx -t
systemctl daemon-reload
systemctl reload nginx

log "4/4 Restarting service..."
systemctl restart "$SERVICE_NAME"

AFTER=$(git -C "$REPO_DIR" rev-parse --short HEAD)
log "Updated: $BEFORE -> $AFTER"
log "Verify with ./healthcheck.sh"
