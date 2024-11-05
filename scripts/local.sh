#! /usr/bin/env bash
set -euo pipefail

cmd="$1"
shift

deno task switch:local

if [[ "$cmd" == db:* ]]; then
  cmd="${cmd#db:}"
  deno task db:local "$cmd" "$@"
else
  deno task "$cmd" "$@"
fi
