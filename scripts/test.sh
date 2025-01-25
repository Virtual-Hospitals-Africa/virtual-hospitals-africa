#! /usr/bin/env bash
set -eo pipefail

deno task switch:local &>/dev/null

VHA_SERVER_PORT=8005

watch_mode=false
[[ "$1" == "--watch" ]] && {
  watch_mode=true
  shift
}

migrate_check=true
[[ "$1" == "--skip-migrate-check" ]] && {
  migrate_check=false
  shift
}

# Set up a temporary file for the test server output so we can check if it's ready
test_vha_server_output=$(mktemp)

kill_test_server() {
  ./scripts/kill_process_on_port.sh $VHA_SERVER_PORT
}

start_vha_test_server() {
  if $watch_mode; then
    deno task start
  else
    deno task web
  fi
}

# In watch mode, this may happen several times
wait_until_vha_test_server_ready() {
  while ! grep -q "Virtual Hospitals Africa ready" "$test_vha_server_output"; do
    # Deno prints "error" with color codes, so we remove them before checking
    # shellcheck disable=SC2002
    if cat "$test_vha_server_output" | sed -r 's/\x1b\[[^@-~]*[@-~]//g' | grep -q "^error:"; then
      cat "$test_vha_server_output"
      exit 1
    fi
    sleep 0.1
  done
  truncate -s 0 "$test_vha_server_output"
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

# Ensure there is no prior test servers, that the database is up to date, and that the log file is empty
kill_test_server
if $migrate_check; then
  deno task db:migrate check
fi
rm -f test_server.log


# Start the test servers
IS_TEST=true IS_TEST_SERVER=true LOG_FILE=test_server.log PORT=8005 start_vha_test_server >> "$test_vha_server_output" 2>&1 &
trap "kill_test_server" EXIT

wait_until_vha_test_server_ready

if ! $watch_mode; then
  run_tests "$@" || {
    if [ -s "$test_vha_server_output" ]; then
      echo "Tests failed. Dumping server log:"
      cat "$test_vha_server_output"
    else
      echo "Tests failed. Server log is empty."
    fi
    exit 1
  }
  exit 0
fi

# In watch mode, run the tests in a background process
# If the test server restarts (due to a file change), kill and restart the tests
# We do this because deno test --watch only watches local files from entry point module graph
while true; do
  run_tests "$@" &
  tests_pid=$!
  wait_until_test_servers_ready
  pkill -TERM -P "$tests_pid" || true
done
