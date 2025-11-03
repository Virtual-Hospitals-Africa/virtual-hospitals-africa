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
  cmp --silent .env .env.local || cmp --silent .env .env.docker || fail ".env differs from .env.local and .env.docker\nrun deno task switch:local before running tests"
elif [ -f .env.local ]; then 
  cmp --silent .env .env.local || fail ".env differs from .env.local\nrun deno task switch:local before running tests"
elif [ -f .env.docker ]; then 
  cmp --silent .env .env.docker || fail ".env differs from .env.docker\nrun deno task switch:docker before running tests"
fi

HTTP_SERVER_PORT=8004
HTTPS_PROXY_SERVER_PORT=8005

migrate_check=true
[[ "$1" == "--skip-migrate-check" ]] && {
  migrate_check=false
  shift
}

# Set up a temporary file for the test server outputs so we can check if it's ready
test_http_server_output=$(mktemp)
test_https_proxy_server_output=$(mktemp)

kill_test_servers() {
  ./scripts/kill_process_on_port.sh $HTTPS_PROXY_SERVER_PORT
  ./scripts/kill_process_on_port.sh $HTTP_SERVER_PORT
}

https_proxy_server_ready() {
  while ! grep -q "Virtual Hospitals Africa ready" "$test_https_proxy_server_output"; do
    # Deno prints "error" with color codes, so we remove them before checking
    # shellcheck disable=SC2002
    if cat "$test_https_proxy_server_output" | sed -r 's/\x1b\[[^@-~]*[@-~]//g' | grep -q "^error:"; then
      cat "$test_https_proxy_server_output"
      exit 1
    fi
    sleep 0.1
  done
  truncate -s 0 "$test_https_proxy_server_output"
}

http_server_ready() {
  while ! grep -q "http://localhost:$HTTP_SERVER_PORT/" "$test_http_server_output"; do
    # Deno prints "error" with color codes, so we remove them before checking
    # shellcheck disable=SC2002
    if cat "$test_http_server_output" | sed -r 's/\x1b\[[^@-~]*[@-~]//g' | grep -q "^error:"; then
      cat "$test_http_server_output"
      exit 1
    fi
    sleep 0.1
  done
  truncate -s 0 "$test_http_server_output"
}

wait_until_vha_test_servers_ready() {
  https_proxy_server_ready
  http_server_ready
}

run_tests() {
  DENO_TLS_CA_STORE=system IS_TEST=true \
  deno test \
    -A \
    --unstable-temporal \
    --env \
    --unsafely-ignore-certificate-errors \
    --ignore=test/chatbot \
    --parallel \
    "$@"
}

start_http_server() {
  IS_TEST=true \
  PORT=$HTTP_SERVER_PORT \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  FAKE_GOOGLE_AUTH=false \
  deno task vite \
  >> "$test_http_server_output" 2>&1 &
}

start_https_proxy_server() {
  VERBOSE=1 \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  HTTP_SERVER_PORT=$HTTP_SERVER_PORT \
  deno task proxy \
  >> "$test_https_proxy_server_output" 2>&1 &
}

# Ensure there is no prior test servers, that the database is up to date, and that the log file is empty
kill_test_servers
if $migrate_check; then
  IS_TEST=true deno task db:migrate check
fi

# Start the test servers
start_http_server
start_https_proxy_server

trap "kill_test_servers" EXIT

wait_until_vha_test_servers_ready

run_tests "$@" || {
  if [ -s "$test_http_server_output" ]; then
    echo "Tests failed."
    echo "Server output available at $test_http_server_output"
    echo "Proxy output available at $test_https_proxy_server_output"
  else
    echo "Tests failed. Server log is empty."
  fi
  exit 1
}
exit 0