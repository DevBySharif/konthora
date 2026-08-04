#!/usr/bin/env bash
# =============================================================================
# Konthora — health check
# =============================================================================
# Verifies the API is alive. Checks:
#   1. systemd unit state (running / failed)
#   2. local health endpoint on 127.0.0.1:8000
#   3. public health endpoint through Nginx/TLS (https://api.konthora.dev.bd)
# Usage:
#   ./health.sh            full check against the public URL
#   ./health.sh --local    only check the local upstream
#   ./health.sh --json     print the raw JSON body
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

MODE="${1:-public}"
BASE_URL="https://$CERT_DOMAIN/api/v1/health"

# 1. systemd state
if systemctl is-active --quiet "$SERVICE_NAME"; then
  printf 'systemd:      ACTIVE (running)\n'
else
  printf 'systemd:      INACTIVE/FAILED (run: sudo systemctl status %s)\n' "$SERVICE_NAME"
  exit 1
fi

# 2. local upstream
LOCAL=$(curl -sf --max-time 5 http://127.0.0.1:8000/api/v1/health || true)
if [ -n "$LOCAL" ]; then
  printf 'local API:    OK\n'
else
  printf 'local API:    FAILED (no response from uvicorn on 127.0.0.1:8000)\n'
  exit 1
fi

if [ "$MODE" = "--local" ]; then
  [ "${2:-}" = "--json" ] && echo "$LOCAL"
  exit 0
fi

# 3. public endpoint through Nginx + TLS
PUBLIC=$(curl -sf --max-time 10 "$BASE_URL" || true)
if [ -n "$PUBLIC" ]; then
  printf 'public API:   OK (%s)\n' "$BASE_URL"
else
  printf 'public API:   FAILED (%s)\n' "$BASE_URL"
  exit 1
fi

if [ "${1:-}" = "--json" ] || [ "${2:-}" = "--json" ]; then
  echo "$PUBLIC"
fi

printf 'Model status: %s | ffmpeg: %s | queue: %s\n' \
  "$(printf '%s' "$PUBLIC" | sed -n 's/.*"modelStatus":"\([^"]*\)".*/\1/p')" \
  "$(printf '%s' "$PUBLIC" | sed -n 's/.*"ffmpegAvailable":\([a-z]*\).*/\1/p')" \
  "$(printf '%s' "$PUBLIC" | sed -n 's/.*"queueDepth":\([0-9]*\).*/\1/p')"
