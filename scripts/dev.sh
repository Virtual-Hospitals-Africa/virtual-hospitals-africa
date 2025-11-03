#!/usr/bin/env bash
set -euo pipefail

ensure_no_process_on_port() {
  local port=$1
  if lsof -i ":$port" >/dev/null 2>&1; then
    echo "Error: Port $port is already in use"
    exit 1
  fi
}

clean_up() {
  kill $VITE_PID
  kill $PROXY_PID
}

ensure_no_process_on_port 8000
ensure_no_process_on_port 8001

deno task vite &
VITE_PID="$!"

deno task run:trusted proxy.ts &
PROXY_PID="$!"

trap 'clean_up' EXIT

wait $VITE_PID
wait $PROXY_PID
