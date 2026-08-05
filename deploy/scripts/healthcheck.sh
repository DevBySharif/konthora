#!/usr/bin/env bash
# =============================================================================
# Konthora — health check
# =============================================================================
# Verifies the API and the frontend are alive. Checks:
#   1. systemd unit state (backend konthora + frontend konthora-web)
#   2. local health endpoint on 127.0.0.1:8000 and homepage on 127.0.0.1:3000
#   3. public endpoints through Nginx/TLS
#      (https://api.konthora.dev.bd + https://konthora.dev.bd)
# Usage:
#   ./healthcheck.sh            full check against the public URLs
#   ./healthcheck.sh --local    only check the local upstreams
#   ./healthcheck.sh --json     print the raw JSON body
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

MODE="${1:-public}"
WEB_SERVICE_NAME="${WEB_SERVICE_NAME:-konthora-web.service}"
API_BASE_URL="https://$CERT_DOMAIN/api/v1/health"
WEB_BASE_URL="https://konthora.dev.bd"
: "${FRONTEND_DOMAIN:=konthora.dev.bd}"

# 1. systemd state
for UNIT in "$SERVICE_NAME" "$WEB_SERVICE_NAME"; do
  if systemctl is-active --quiet "$UNIT"; then
    printf 'systemd:      ACTIVE (%s)\n' "$UNIT"
  else
    printf 'systemd:      INACTIVE/FAILED (run: sudo systemctl status %s)\n' "$UNIT"
    exit 1
  fi
done

# 2. local upstreams
LOCAL_API=$(curl -sf --max-time 5 http://127.0.0.1:8000/api/v1/health || true)
LOCAL_WEB=$(curl -sf --max-time 5 -o /dev/null http://127.0.0.1:3000/ || true)
if [ -n "$LOCAL_API" ]; then
  printf 'local API:    OK\n'
else
  printf 'local API:    FAILED (no response from uvicorn on 127.0.0.1:8000)\n'
  exit 1
fi
if [ -n "$LOCAL_WEB" ]; then
  printf 'local web:    OK\n'
else
  printf 'local web:    FAILED (no response from Next.js on 127.0.0.1:3000)\n'
  exit 1
fi

if [ "$MODE" = "--local" ]; then
  [ "${2:-}" = "--json" ] && echo "$LOCAL_API"
  exit 0
fi

# 3. public endpoints through Nginx + TLS
PUBLIC_API=$(curl -sf --max-time 10 "$API_BASE_URL" || true)
PUBLIC_WEB=$(curl -sf --max-time 10 -o /dev/null "$WEB_BASE_URL" || true)
if [ -n "$PUBLIC_API" ]; then
  printf 'public API:   OK (%s)\n' "$API_BASE_URL"
else
  printf 'public API:   FAILED (%s)\n' "$API_BASE_URL"
  exit 1
fi
if [ -n "$PUBLIC_WEB" ]; then
  printf 'public web:   OK (%s)\n' "$WEB_BASE_URL"
else
  printf 'public web:   FAILED (%s)\n' "$WEB_BASE_URL"
  exit 1
fi

if [ "${1:-}" = "--json" ] || [ "${2:-}" = "--json" ]; then
  echo "$PUBLIC_API"
fi

printf 'Model status: %s | ffmpeg: %s | queue: %s\n' \
  "$(printf '%s' "$PUBLIC_API" | sed -n 's/.*"modelStatus":"\([^"]*\)".*/\1/p')" \
  "$(printf '%s' "$PUBLIC_API" | sed -n 's/.*"ffmpegAvailable":\([a-z]*\).*/\1/p')" \
  "$(printf '%s' "$PUBLIC_API" | sed -n 's/.*"queueDepth":\([0-9]*\).*/\1/p')"