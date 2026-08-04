#!/usr/bin/env bash
# =============================================================================
# Konthora — manual cleanup of ephemeral data
# =============================================================================
# Removes expired job files from storage, old journal logs, and temporary
# upload partials. The application already auto-cleans on a schedule; this is
# a manual safety valve for disk-pressure emergencies. Run with sudo:
#   sudo bash cleanup.sh [--all]
#
#   (default)  only remove files older than 24h (safety margin over the 60 min
#              retention window so in-flight jobs are never touched)
#   --all      also stop the service and wipe the whole storage directory
#              (identical to what happens on app startup)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

log() { printf '\033[1;34m[cleanup]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[cleanup] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash cleanup.sh)."

if [ "${1:-}" = "--all" ]; then
  log "Stopping service and wiping storage..."
  systemctl stop "$SERVICE_NAME"
  find "$STORAGE_DIR" -mindepth 1 -maxdepth 2 -exec rm -rf {} +
  systemctl start "$SERVICE_NAME"
else
  log "Removing storage files older than 24h..."
  find "$STORAGE_DIR" -type f -mmin +1440 -delete
  find "$STORAGE_DIR" -type d -empty -delete 2>/dev/null || true
fi

# Vacuum systemd journal (keep last 2 days) to bound disk usage
journalctl --vacuum-time=2d >/dev/null 2>&1 || true

log "Done."
