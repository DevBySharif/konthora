#!/usr/bin/env bash
# =============================================================================
# Konthora — model provisioning & warm-up (called by deploy.sh and update.sh)
# =============================================================================
# Installs the spaCy English model required by Kokoro's G2P stage, then warms
# the Kokoro and Faster Whisper weights into the HF cache owned by the service
# account. Safe to run repeatedly (idempotent); existing cached weights are
# reused. Fails fast with a clear error if any step cannot be completed.
#
# Usage (as root / sudo):
#   sudo bash provision_models.sh
#
# Optional: SKIP_MODEL_WARM=1 skips the (slow) model warm-up but still installs
# the spaCy model and verifies cache ownership/permissions.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=konthora.env
source "$SCRIPT_DIR/konthora.env"

# Robust defaults (overridable in konthora.env). They match the systemd unit's
# HF_HOME/XDG_CACHE_HOME so hosts with a pre-existing konthora.env (created
# before these keys existed) keep working without editing that file.
CACHE_ROOT="${CACHE_ROOT:-/opt/konthora/.cache}"
HF_CACHE_DIR="${HF_CACHE_DIR:-${CACHE_ROOT}/huggingface}"

log() { printf '\033[1;34m[models]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[models] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "Run with sudo (sudo bash provision_models.sh)."
[ -x "$BACKEND_DIR/.venv/bin/python" ] || die "Virtualenv missing at $BACKEND_DIR/.venv — run deploy.sh first."
id -u "$SERVICE_USER" >/dev/null 2>&1 || die "Service account '$SERVICE_USER' does not exist — run deploy.sh first."

# ---------------------------------------------------------------------------
log "1/4 Ensuring spaCy model 'en_core_web_sm' (Kokoro G2P dependency)..."
if "$BACKEND_DIR/.venv/bin/python" -c "import spacy.util as u, sys; sys.exit(0 if u.is_package('en_core_web_sm') else 1)"; then
  log "en_core_web_sm already installed; nothing to do."
else
  log "Installing en_core_web_sm into the virtualenv (one-time, needs network)..."
  "$BACKEND_DIR/.venv/bin/python" -m spacy download en_core_web_sm \
    || die "Failed to install en_core_web_sm. Confirm outbound access to the spaCy model index, then re-run."
  log "en_core_web_sm installed."
fi

# ---------------------------------------------------------------------------
log "2/4 Preparing model cache directories..."
mkdir -p "$CACHE_ROOT" "$HF_CACHE_DIR"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$CACHE_ROOT"
log "Cache dirs ready: $CACHE_ROOT"

# ---------------------------------------------------------------------------
log "3/4 Warming Kokoro + Faster Whisper..."
if [ -n "${SKIP_MODEL_WARM:-}" ]; then
  log "SKIP_MODEL_WARM is set — skipping model warm-up."
else
  log "Loading both models as the '$SERVICE_USER' user (first run downloads weights from Hugging Face)..."
  # Run as the service account so runtime permissions are validated exactly.
  if ! sudo -u "$SERVICE_USER" env \
        HF_HOME="$HF_CACHE_DIR" \
        XDG_CACHE_HOME="$CACHE_ROOT" \
        PYTHONPATH="$BACKEND_DIR" \
        "$BACKEND_DIR/.venv/bin/python" - <<'PY'
import sys, time
from app.services.kokoro_service import KokoroService
from app.services.transcription_service import TranscriptionService

t0 = time.time()
ks = KokoroService()
ks.load_pipeline("a")
ready, status, err = ks.get_status()
if not ready:
    sys.exit("Kokoro pipeline failed to initialize: status=%r error=%r" % (status, err))
print("KOKORO ready (%ds)" % int(time.time() - t0), flush=True)

ts = TranscriptionService()
ts.load_model()
ready, status, err = ts.get_status()
if not ready:
    sys.exit("Whisper model failed to initialize: status=%r error=%r" % (status, err))
print("WHISPER ready (%ds)" % int(time.time() - t0), flush=True)
print("MODEL_WARM_OK", flush=True)
PY
  then
    die "Model warm-up FAILED. Confirm outbound access to Hugging Face (huggingface.co) and review the traceback above. Re-run after fixing; existing downloads are cached."
  fi
  log "Model warm-up complete."
fi

# ---------------------------------------------------------------------------
log "4/4 Verifying cache ownership and permissions..."
SERVICE_UID="$(id -u "$SERVICE_USER")"
CACHE_UID="$(stat -c '%u' "$CACHE_ROOT")"
[ "$CACHE_UID" = "$SERVICE_UID" ] || die "Cache root $CACHE_ROOT is owned by UID $CACHE_UID; expected $SERVICE_UID ($SERVICE_USER). Fix with: chown -R $SERVICE_USER:$SERVICE_GROUP $CACHE_ROOT"
HF_UID="$(stat -c '%u' "$HF_CACHE_DIR")"
[ "$HF_UID" = "$SERVICE_UID" ] || die "HF cache dir $HF_CACHE_DIR is owned by UID $HF_UID; expected $SERVICE_UID ($SERVICE_USER)."
[ -r "$HF_CACHE_DIR" ] || die "HF cache dir $HF_CACHE_DIR is not readable."
log "Ownership OK ($CACHE_ROOT -> $SERVICE_USER:$SERVICE_GROUP)."

log "Model provisioning complete."
