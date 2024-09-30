#! /usr/bin/env bash
set -euo pipefail

echo $PORT
/app/node_modules/.bin/vite --base /app/packages/app --port "$PORT"