#! /usr/bin/env bash
set -euo pipefail

cmd="$1"
shift

deno task switch:docker

if [[ "$cmd" == db:* ]]; then
  cmd="${cmd#db:}"
  deno task db:docker "$cmd" "$@"
else
  deno task "$cmd" "$@"
fi
