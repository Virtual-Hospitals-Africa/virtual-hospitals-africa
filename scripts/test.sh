#! /usr/bin/env bash
set -euo pipefail

kill_test_server() {
  set +e
  pid_existing_test_server=$(lsof -i tcp:8005 | awk 'NR==2 { print $2 }')
  set -e

  if [[ -n "$pid_existing_test_server" ]]; then
    kill "$pid_existing_test_server"
  fi
}

# Ensure there is no prior test server, that the database is up to date, and that the log file is empty
kill_test_server
deno task db:migrate:check
rm -f test_server.log

# Set up a temporary file for the test server output so we can check if it's ready
test_server_output=$(mktemp)
trap 'rm -f $test_server_output' EXIT

# Start the test server
LOG_FILE=test_server.log PORT=8005 IS_TEST=true deno task web >> "$test_server_output" 2>&1 &
trap "kill_test_server" EXIT

# Wait until the test server is ready
while ! grep -q "Virtual Hospitals Africa ready" "$test_server_output"; do
  sleep 0.1
done

# Run the tests
DENO_TLS_CA_STORE=system IS_TEST=true \
deno test \
  -A \
  --unstable-temporal \
  --env \
  --unsafely-ignore-certificate-errors \
  --ignore=test/chatbot \
  --parallel \
  "$@"
