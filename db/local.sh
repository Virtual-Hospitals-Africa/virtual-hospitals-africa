#! /usr/bin/env bash
set -euo pipefail

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

# shellcheck disable=SC2086
deno task db:$script "$@"

if [ "$script" = "reset" ]; then
  mkdir -p ./db/dumps
  deno task db:dump > ./db/dumps/latest
  IS_TEST=true deno task db:recreate
  IS_TEST=true deno task db:restore latest
else
  # shellcheck disable=SC2086
  IS_TEST=true deno task db:$script "$@"
fi
