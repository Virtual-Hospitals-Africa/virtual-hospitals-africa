#!/usr/bin/env bash
set -euo pipefail

if [ ! -f fresh/server/server-entry.mjs ]; then 
  echo 'Run deno task build first'
  exit 1
fi

port=${PORT:-8000}

DENO_TLS_CA_STORE=system \
  deno serve \
    -A \
    --unstable-temporal \
    --unstable-node-globals \
    --env \
    --unsafely-ignore-certificate-errors \
    --port "$port" \
    fresh/server/server-entry.mjs