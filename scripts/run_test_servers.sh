#! /usr/bin/env bash
set -eo pipefail

fail() {
  >&2 echo "$@"
  exit 1
}

# On non-CI builds ensure the .env matches either .env.local or .env.docker
if [[ "${CI:-}" == "true" ]]; then
  :
elif [ -f .env.local ] && [ -f .env.docker ]; then
  cmp --silent .env .env.local || cmp --silent .env .env.docker || fail $'.env differs from .env.local and .env.docker\nrun deno task switch:local before running tests'
elif [ -f .env.local ]; then 
  cmp --silent .env .env.local || fail $'.env differs from .env.local\nrun deno task switch:local before running tests'
elif [ -f .env.docker ]; then 
  cmp --silent .env .env.docker || fail $'.env differs from .env.docker\nrun deno task switch:docker before running tests'
fi

HTTP_SERVER_PORT=8004
HTTPS_PROXY_SERVER_PORT=8005

mktemp_with_suffix() {
  local suffix="$1"
  # shellcheck disable=SC2155
  local filename=$(mktemp -u)
  local temp="$filename.$suffix"
  : >"$temp"
  echo "$temp"
}

test_http_server_output=$(mktemp_with_suffix log)
test_https_proxy_server_output=$(mktemp_with_suffix log)

use_build=false

while [[ "$#" -gt 0 && "$1" =~ "--" ]]; do
  if [[ "$1" == "--use-build" ]]; then
    use_build=true
  elif [[ "$1" == "--verbose" ]]; then
    set -x
  else
    fail "Unknown option: $1"
  fi
  shift
done

kill_test_servers() {
  kill "$http_server_pid"
  kill "$https_proxy_server"
}

ensure_test_servers_not_already_running() {
  if lsof -i "tcp:$HTTP_SERVER_PORT"; then
    fail "There's a process on port $HTTP_SERVER_PORT"
  fi

  if lsof -i "tcp:$HTTPS_PROXY_SERVER_PORT"; then
    fail "There's a process on port $HTTPS_PROXY_SERVER_PORT"
  fi
}

print_server_log_info() {
  echo "Proxy output available at $test_https_proxy_server_output"
  echo "Server output available at $test_http_server_output"
}

cleanup() {
  kill_test_servers
  if [[ "${CI:-}" == "true" ]]; then
    echo "Server output:"
    cat "$test_http_server_output"
    echo "Proxy output:"
    cat "$test_https_proxy_server_output"
  else
    print_server_log_info
  fi
}

http_server_command() {
  if $use_build; then
    deno task web
  else
    deno task vite
  fi
}

start_http_server() {
  IS_TEST=true \
  PORT=$HTTP_SERVER_PORT \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  FAKE_GOOGLE_AUTH=false \
  GOOGLE_CLIENT_ID=FAKE_GOOGLE_CLIENT_ID \
  http_server_command \
  >> "$test_http_server_output" 2>&1
}

start_https_proxy_server() {
  VERBOSE=1 \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  HTTP_SERVER_PORT=$HTTP_SERVER_PORT \
  deno task proxy \
  >> "$test_https_proxy_server_output" 2>&1
}

ensure_test_servers_not_already_running

trap cleanup EXIT

start_http_server &
http_server_pid="$!"

start_https_proxy_server &
https_proxy_server="$!"

print_server_log_info

wait $http_server_pid
wait $https_proxy_server
