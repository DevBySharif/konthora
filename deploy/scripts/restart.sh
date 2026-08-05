#!/usr/bin/env bash
# =============================================================================
# Konthora — restart the backend + frontend services
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

WEB_SERVICE_NAME="${WEB_SERVICE_NAME:-konthora-web.service}"

log() { printf '\033[1;34m[restart]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[restart] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash restart.sh)."

systemctl restart "$SERVICE_NAME"
systemctl restart "$WEB_SERVICE_NAME"
systemctl --no-pager --full status "$SERVICE_NAME" --lines=8
systemctl --no-pager --full status "$WEB_SERVICE_NAME" --lines=8
log "Done."