#! /usr/bin/env bash
set -eo pipefail

deno task switch:prod
deno task "$@"
