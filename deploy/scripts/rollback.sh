#!/usr/bin/env bash
# =============================================================================
# Konthora — rollback to a previous release
# =============================================================================
# Usage:
#   sudo bash rollback.sh              rollback to the previously deployed commit
#   sudo bash rollback.sh <sha>        rollback to a specific commit
#
# See DEPLOYMENT.md -> "Rollback" for the full procedure.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

log() { printf '\033[1;34m[rollback]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[rollback] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash rollback.sh [sha])."

[ -d "$REPO_DIR/.git" ] || die "Repository not found at $REPO_DIR."

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  TARGET="$(cat "$BACKUP_DIR/last-release" 2>/dev/null || echo '@{-1}')"
fi

log "Rolling back to: $TARGET"
git -C "$REPO_DIR" log --oneline -3
git -C "$REPO_DIR" checkout --force "$TARGET"

log "Reinstalling dependencies for the rolled-back commit..."
"$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"

log "Restarting service..."
systemctl restart "$SERVICE_NAME"

log "Rollback complete. Verify with ./health.sh"
