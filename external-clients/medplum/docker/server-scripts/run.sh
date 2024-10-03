#! /usr/bin/env bash
set -euo pipefail

node /app/rewrite-config.js < /app/packages/server/medplum.config.json > /app/rewritten-config.json
cat /app/rewritten-config.json > /app/packages/server/medplum.config.json
NODE_TLS_REJECT_UNAUTHORIZED=0 node --require /app/packages/server/dist/otel/instrumentation.js /app/packages/server/dist/index.js