#! /usr/bin/env bash
set -euo pipefail

script=$1
shift

diff .env .env.local >/dev/null || {
  echo "ERROR: .env and .env.local differ. Please run 'deno task switch:local' and try again"
  exit 1
}

deno task db:migrate:$script "$@"
IS_TEST=true deno task db:migrate:$script "$@"
