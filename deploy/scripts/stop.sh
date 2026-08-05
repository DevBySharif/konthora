#!/usr/bin/env bash
# =============================================================================
# Konthora — stop the backend service
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

[[ "$(id -u)" -eq 0 ]] || { printf 'Run with sudo (sudo bash stop.sh).\n' >&2; exit 1; }

WEB_SERVICE_NAME="${WEB_SERVICE_NAME:-konthora-web.service}"

systemctl stop "$SERVICE_NAME" "$WEB_SERVICE_NAME"
printf 'Konthora backend + frontend services stopped.\n'
