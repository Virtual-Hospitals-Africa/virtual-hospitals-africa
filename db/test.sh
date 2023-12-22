#! /usr/bin/env bash
set -eo pipefail

if "${GITHUB_ACTIONS-false}"; then
  deno task build
fi

DENO_TLS_CA_STORE=system IS_TEST=true deno test -A --unsafely-ignore-certificate-errors "$@"