#! /usr/bin/env bash
set -o pipefail

watch_mode=false
[[ "$1" == "--watch" ]] && watch_mode=true

# Set up a temporary file for the test server output so we can check if it's ready
test_server_output=$(mktemp)
echo "Check server output via:"
echo "cat $test_server_output"
# trap 'rm -f $test_server_output' EXIT

kill_test_server() {
  test_server_pid=$(lsof -i tcp:8005 | awk 'NR==2 { print $2 }')
  [[ -n "$test_server_pid" ]] && kill "$test_server_pid"
}

start_test_server() {
  if $watch_mode; then
    deno task start
  else
    deno task web
  fi
}

# In watch mode, this may happen several times
wait_until_test_server_ready() {
  while ! grep -q "Virtual Hospitals Africa ready" "$test_server_output"; do
    sleep 0.1
  done
  truncate -s 0 "$test_server_output"
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

# Ensure there is no prior test server, that the database is up to date, and that the log file is empty
kill_test_server
deno task db:migrate:check
rm -f test_server.log

# Start the test server
LOG_FILE=test_server.log PORT=8005 IS_TEST=true start_test_server >> "$test_server_output" 2>&1 &
trap "kill_test_server" EXIT

wait_until_test_server_ready

if ! $watch_mode; then
  run_tests "$@"
  exit 0
fi

# In watch mode, run the tests in a background process
# If the test server restarts (due to a file change), kill and restart the tests
# We do this because deno test --watch only watches local files from entry point module graph
while true; do
  run_tests "$@" &
  tests_pid=$!
  wait_until_test_server_ready
  pkill -TERM -P "$tests_pid"
done

