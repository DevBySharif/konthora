#!/usr/bin/env bash
# =============================================================================
# Konthora — view logs
# =============================================================================
# Usage:
#   ./logs.sh            tail the last 100 lines (journald)
#   ./logs.sh -f         follow the live log stream
#   ./logs.sh --file     tail the rotating file at $LOG_DIR/konthora.log
#   ./logs.sh --grep foo search recent logs for 'foo'
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

MODE="${1:-}"

case "$MODE" in
  --file)
    test -f "$LOG_DIR/konthora.log" || { echo "No file log yet at $LOG_DIR/konthora.log" >&2; exit 1; }
    tail -n 100 "$LOG_DIR/konthora.log"
    ;;
  --grep)
    grep -i "${2:?usage: ./logs.sh --grep <pattern>}" \
      <(journalctl -u "$SERVICE_NAME" --no-pager -n 20000) || true
    ;;
  -f)
    journalctl -u "$SERVICE_NAME" -f
    ;;
  *)
    journalctl -u "$SERVICE_NAME" --no-pager -n 100
    ;;
esac
