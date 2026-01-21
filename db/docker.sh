#! /usr/bin/env bash
set -xeuo pipefail

if [ $# -eq 0 ]; then
  echo "Please provide a script to run against the vha_dev & vha_test databases"
  exit 1
fi

script=$1
shift

diff .env .env.docker >/dev/null || {
  echo "ERROR: .env and .env.docker differ. Please run 'deno task switch:docker' and try again"
  exit 1
}

# Sync version
# IS_TEST=true deno task db:$script "$@"
# deno task db:$script "$@"

# Async version
test_output=$(mktemp)

# shellcheck disable=SC2086
IS_TEST=true deno task db:$script "$@" >$test_output &
running_against_test_pid="$!"

# shellcheck disable=SC2086
deno task db:$script "$@"

wait $running_against_test_pid || {
  cat "$test_output" >&2
  exit 1
}
