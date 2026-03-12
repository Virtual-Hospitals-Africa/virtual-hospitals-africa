#!/usr/bin/env bash
set -euo pipefail

source .env
HTTP_SERVER_PORT="${HTTP_SERVER_PORT-8001}"
HTTPS_PROXY_SERVER_PORT="${HTTPS_PROXY_SERVER_PORT-8000}"
PROXY_PID=
LISP_WATCHER_PID=

ensure_no_process_on_port() {
  local port=$1
  if lsof -i ":$port" >/dev/null 2>&1; then
    echo "Error: Port $port is already in use"
    exit 1
  fi
}

clean_up() {
  [ ! -z "$PROXY_PID" ] && kill "$PROXY_PID" || true
  [ ! -z "$LISP_WATCHER_PID" ] && kill "$LISP_WATCHER_PID" || true
}

ensure_no_process_on_port "$HTTP_SERVER_PORT"
ensure_no_process_on_port "$HTTPS_PROXY_SERVER_PORT"

# Compile s-expressions on startup
if [ -d "s_expression" ]; then
  echo "Compiling s-expressions..."
  deno task script ./scripts/compile_s_expressions.ts
fi

# Watch for changes to .lisp files and recompile
if [ -d "s_expression" ] && command -v fswatch >/dev/null 2>&1; then
  echo "Starting s-expression file watcher..."
  fswatch -o s_expression/*.lisp | while read -r; do
    echo "Detected .lisp file change, recompiling..."
    deno task script ./scripts/compile_s_expressions.ts
  done &
  LISP_WATCHER_PID="$!"
elif [ -d "s_expression" ]; then
  echo "Warning: fswatch not found. Install with: brew install fswatch"
  echo "S-expressions will compile on startup only."
fi

mkdir -p logs

HTTP_SERVER_PORT=$HTTP_SERVER_PORT HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT deno task proxy &
PROXY_PID="$!"

trap 'clean_up' EXIT

PORT=$HTTP_SERVER_PORT HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT deno task vite
