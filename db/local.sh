#! /usr/bin/env bash
set -xeuo pipefail

if [ $# -eq 0 ]; then
  echo "Please provide a script to run against the vha_dev & vha_test databases"
  exit 1
fi

script=$1
shift

diff .env .env.local >/dev/null || {
  echo "ERROR: .env and .env.local differ. Please run 'deno task switch:local' and try again"
  exit 1
}

test_output=$(mktemp)

# shellcheck disable=SC2086
deno task db:$script "$@" &
pid_dev="$!"

# shellcheck disable=SC2086
IS_TEST=true deno task db:$script "$@" >$test_output &
pid_test="$!"

wait $pid_dev || {
  kill $pid_test
  exit 1
}

wait $pid_test || {
  cat "$test_output" >&2
  exit 1
}
