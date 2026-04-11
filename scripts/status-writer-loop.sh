#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/data/.openclaw/workspace/projects/status-page"
WRITER="$REPO_DIR/scripts/update-live-status.mjs"
STATE_DIR="/data/.openclaw/workspace/state/status-writer"
LOG_FILE="$STATE_DIR/status-writer.log"
PID_FILE="$STATE_DIR/status-writer.pid"
INTERVAL_SECONDS="${STATUS_WRITER_INTERVAL_SECONDS:-300}"

mkdir -p "$STATE_DIR"
echo $$ > "$PID_FILE"
trap 'rm -f "$PID_FILE"' EXIT

cd "$REPO_DIR"

echo "[$(date -Is)] status writer loop started (interval ${INTERVAL_SECONDS}s)" >> "$LOG_FILE"

while true; do
  {
    echo "[$(date -Is)] tick"
    node "$WRITER"
    if ! git diff --quiet -- agent-status.json; then
      git add agent-status.json
      git commit -m "Update live agent telemetry" >/dev/null
      git push origin main >/dev/null
      echo "[$(date -Is)] pushed updated telemetry"
    else
      echo "[$(date -Is)] no telemetry changes"
    fi
  } >> "$LOG_FILE" 2>&1 || {
    echo "[$(date -Is)] loop error" >> "$LOG_FILE"
  }

  sleep "$INTERVAL_SECONDS"
done
