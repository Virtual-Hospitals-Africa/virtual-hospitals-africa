#! /usr/bin/env bash
set -euo pipefail

deno task switch:prod
deno task "$@"