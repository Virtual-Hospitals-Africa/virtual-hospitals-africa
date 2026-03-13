#! /usr/bin/env bash
set -eo pipefail

FILES="${1-test/chatbot}"

DENO_TLS_CA_STORE=system IS_TEST=true deno test -A --unstable-temporal --env --unsafely-ignore-certificate-errors $FILES