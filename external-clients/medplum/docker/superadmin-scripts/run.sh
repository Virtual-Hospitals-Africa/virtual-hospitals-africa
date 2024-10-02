#! /usr/bin/env bash
set -euo pipefail

echo "PORT=$PORT"
cd /app/packages/app
/app/node_modules/.bin/vite --port "$PORT" --host