#!/usr/bin/env bash
# =============================================================================
# Konthora — backup storage, environment and configuration
# =============================================================================
# Backs up the ephemeral job storage (only .gitkeep normally), the backend
# secrets file, and the installed config files. Old backups are pruned after
# BACKUP_KEEP_DAYS. Run with sudo:
#   sudo bash backup.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

log() { printf '\033[1;34m[backup]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[backup] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash backup.sh)."

STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Storage content (job files / transcripts). Excludes symlinks.
if [ -d "$STORAGE_DIR" ]; then
  tar -czf "$BACKUP_DIR/storage-$STAMP.tar.gz" -C "$(dirname "$STORAGE_DIR")" \
      "$(basename "$STORAGE_DIR")" 2>/dev/null || true
fi

# Secrets + deployed configs
tar -czf "$BACKUP_DIR/config-$STAMP.tar.gz" \
    -C / etc/konthora 2>/dev/null || true

# Keep only the most recent BACKUP_KEEP_DAYS days
find "$BACKUP_DIR" -name '*.tar.gz' -mtime +"$BACKUP_KEEP_DAYS" -delete

log "Backup written to $BACKUP_DIR (storage-$STAMP.tar.gz, config-$STAMP.tar.gz)"
log "Pruning backups older than $BACKUP_KEEP_DAYS days."
ls -1 "$BACKUP_DIR"
