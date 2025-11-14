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

use_test_servers=false
run_test_server_args=""
test_servers_were_already_running=false
test_servers_pid=

while [[ "$#" -gt 0 && "$1" =~ "--" ]]; do
  if [[ "$1" == "--use-build" ]]; then
    run_test_server_args="--use-build"
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

HTTP_SERVER_PORT=8004
HTTPS_PROXY_SERVER_PORT=8005

if lsof -i "tcp:$HTTP_SERVER_PORT" > /dev/null && lsof -i "tcp:$HTTPS_PROXY_SERVER_PORT" > /dev/null; then
  test_servers_were_already_running=true
fi

cleanup() {
  if ! [ -z $test_servers_pid ]; then
    ./scripts/kill_process_on_port.sh $HTTP_SERVER_PORT || true
    ./scripts/kill_process_on_port.sh $HTTPS_PROXY_SERVER_PORT || true
    kill $test_servers_pid || true
  fi
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

trap cleanup EXIT

if $use_test_servers; then
  if ! $test_servers_were_already_running; then
    ./scripts/run_test_servers.sh "$run_test_server_args" &
    test_servers_pid="$!"
  fi
fi

run_tests "$@"
