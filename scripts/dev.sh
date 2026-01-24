#!/usr/bin/env bash
set -euo pipefail

source .env
HTTP_SERVER_PORT="${HTTP_SERVER_PORT-8001}"
HTTPS_PROXY_SERVER_PORT="${HTTPS_PROXY_SERVER_PORT-8000}"
PROXY_PID=

ensure_no_process_on_port() {
  local port=$1
  if lsof -i ":$port" >/dev/null 2>&1; then
    echo "Error: Port $port is already in use"
    exit 1
  fi
}

clean_up() {
  [ ! -z $PROXY_PID ] && kill $PROXY_PID || true
}

ensure_no_process_on_port "$HTTP_SERVER_PORT"
ensure_no_process_on_port "$HTTPS_PROXY_SERVER_PORT"

HTTP_SERVER_PORT=$HTTP_SERVER_PORT HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT deno task proxy &
PROXY_PID="$!"

trap 'clean_up' EXIT

PORT=$HTTP_SERVER_PORT HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT deno task vite
