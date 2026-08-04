#!/usr/bin/env bash
# =============================================================================
# Konthora — resource benchmark helper (Linux only)
# =============================================================================
# Non-intrusive collectors to gather the numbers needed to size the EC2
# instance (see deploy/AWS.md -> "Benchmark"). Run it on the box, then exercise
# real requests/jobs so you can read peak usage alongside.
#
# Usage:
#   bash benchmark_resources.sh [--watch <PID|unit>] [--interval N] [--count M]
#
#   --interval N   seconds between samples (default 10)
#   --count M      number of samples (default 6)
#   --watch PID    also sample that process RSS/CPU (e.g. the uvicorn PID)
#   --watch unit   'konthora' -> resolve to the service's main PID
#
# Examples:
#   bash benchmark_resources.sh --watch 1234            # watch a process
#   bash benchmark_resources.sh --watch konthora        # watch the service
#   bash benchmark_resources.sh --interval 10 --count 6 # timed snapshot loop
#   bash benchmark_resources.sh                          # one idle snapshot
#
# NOTE: This script only MEASURES. It does not create load or change the app.
# =============================================================================
set -u

INTERVAL=10
COUNT=6
WATCH_PICK=""     # a PID or a systemd unit name

while [ $# -gt 0 ]; do
  case "$1" in
    --interval) INTERVAL="${2:-10}"; shift 2 ;;
    --count)    COUNT="${2:-6}";     shift 2 ;;
    --watch)    WATCH_PICK="${2:-}"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 2;;
  esac
done

ec2_type() {
  # Instance type from the EC2 instance-identity (or nothing if not on EC2)
  command -v curl >/dev/null && \
    curl -s --max-time 2 "http://169.254.169.254/latest/meta-data/instance-type" 2>/dev/null || true
}

resolve_watch_pid() {
  local target="$1" pid_line pid
  if [[ "$target" =~ ^[0-9]+$ ]]; then
    echo "$target"; return
  fi
  # unit name (e.g. konthora) -> main PID
  pid_line="$(systemctl show -p MainPID --value "$target".service 2>/dev/null)"
  pid="${pid_line:-}"
  if [[ -z "$pid" || "$pid" = "0" ]]; then
    pid="$(systemctl show -p MainPID --value "$target" 2>/dev/null)"
  fi
  [[ "$pid" =~ ^[0-9]+$ ]] && echo "$pid"
}

snapshot() {
  echo
  echo "=== snapshot $(date -u +%FT%TZ) ==="

  if type=$(ec2_type); then echo "instance:          $type"; fi
  echo "cpu_cores:         $(getconf _NPROCESSORS_ONLN)"
  echo "total_ram:         $(free -h | awk '/^Mem:/{print $2}')"

  echo "--- free -h ---"
  free -h
  echo "--- df -h (storage/root) ---"
  df -h / /opt 2>/dev/null

  echo "--- model cache (HF_HOME if set, else default) ---"
  hf="${HF_HOME:-$HOME/.cache/huggingface}"
  if [ -d "$hf" ]; then
    du -sh "$hf" 2>/dev/null
    du -sh "$hf"/hub/*/ 2>/dev/null | sort -rh | head -6
  else
    echo "no model cache yet at $hf"
  fi

  echo "--- job storage: $TTS_STORAGE_ROOT (env) ---"
  root="${TTS_STORAGE_ROOT:-./storage}"
  du -sh "$root" 2>/dev/null

  if [ -n "${WATCH_PID:-}" ]; then
    echo "--- watched pid ${WATCH_PID}: RSS / %CPU ---"
    ps -o pid,etime,rss,%cpu,%mem,cmd -p "${WATCH_PID}" | sed -n '1,3p'
  fi
}

WATCH_PID=""
if [ -n "${WATCH_PICK:-}" ]; then
  WATCH_PID="$(resolve_watch_pid "$WATCH_PICK")"
  echo "Watching PID ${WATCH_PID:-<none found>} for $WATCH_PICK"
fi

count=0
while [ "$count" -lt "$COUNT" ]; do
  snapshot
  count=$((count + 1))
  [ "$count" -lt "$COUNT" ] && sleep "$INTERVAL"
done

echo
echo "Record these in deploy/AWS.md (§5 Benchmark): idle RAM, RAM after each "
echo "model load, peak RAM during TTS and transcription, peak with overlap,"
echo "CPU, TTS time, transcription real-time factor, model-cache + temp size."