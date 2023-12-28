#! /usr/bin/env bash
set -euo pipefail

deno task build &
deno task db:migrate:latest &
wait

deno task web