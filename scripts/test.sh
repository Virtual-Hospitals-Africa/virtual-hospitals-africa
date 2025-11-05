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

use_test_servers=false
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

if [[ $# -eq 0 ]]; then
  use_test_servers=true
else
  for arg in "$@"; do
    if [[ "$arg" == "test/web" || "$arg" == test/web/* ]]; then
      use_test_servers=true
      break
    fi
  done
fi

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

kill_test_servers() {
  ./scripts/kill_process_on_port.sh $HTTPS_PROXY_SERVER_PORT
  ./scripts/kill_process_on_port.sh $HTTP_SERVER_PORT
}

cleanup() {
  if $use_test_servers; then
    kill_test_servers
    echo "Server output available at $test_http_server_output"
    echo "Proxy output available at $test_https_proxy_server_output"
  fi
}

rm_ansi_escape_codes() {
  sed -r 's/\x1b\[[^@-~]*[@-~]//g'
}

https_proxy_server_ready() {
  while ! grep -q "Virtual Hospitals Africa ready" "$test_https_proxy_server_output"; do
    if cat "$test_https_proxy_server_output" | rm_ansi_escape_codes | grep -q "^error:"; then
      fail "https proxy server failed"
    fi
    sleep 0.1
  done
  truncate -s 0 "$test_https_proxy_server_output"
}

http_server_ready() {
  while ! cat "$test_http_server_output" | rm_ansi_escape_codes | grep -q ":$HTTP_SERVER_PORT"; do
    cat "$test_http_server_output"
    if cat "$test_http_server_output" | rm_ansi_escape_codes | grep -q "^error:"; then
      fail "$test_http_server_output"
    fi
    sleep 0.1
  done
  truncate -s 0 "$test_http_server_output"
}

wait_until_servers_ready() {
  https_proxy_server_ready
  http_server_ready
}

run_tests() {
  DENO_TLS_CA_STORE=system \
  IS_TEST=true \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  deno test \
    -A \
    --unstable-temporal \
    --env \
    --unsafely-ignore-certificate-errors \
    --ignore=test/chatbot \
    --parallel \
    "$@"
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
  >> "$test_http_server_output" 2>&1 &
}

start_https_proxy_server() {
  VERBOSE=1 \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  HTTP_SERVER_PORT=$HTTP_SERVER_PORT \
  deno task proxy \
  >> "$test_https_proxy_server_output" 2>&1 &
}

start_servers() {
  start_http_server
  start_https_proxy_server
}

trap cleanup EXIT

if $use_test_servers; then
  kill_test_servers
  start_servers
  wait_until_servers_ready
fi

run_tests "$@"