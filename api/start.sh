#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${STATUS_API_HOST:-0.0.0.0}"
PORT="${STATUS_API_PORT:-8743}"
FALLBACK_PORT="${STATUS_API_FALLBACK_PORT:-8744}"

exec python3 "$SCRIPT_DIR/server.py" --host "$HOST" --port "$PORT" --fallback-port "$FALLBACK_PORT"
