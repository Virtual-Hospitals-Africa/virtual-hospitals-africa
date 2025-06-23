#! /usr/bin/env bash
set -euo pipefail

if [ -f .env.local ]; then
  >&2 echo "CONFLIT: You already have a .env.local file"
  >&2 echo "Clear it to reattempt initialization of your local databases"
  exit
fi

me=$(whoami)

echo "DATABASE_URL=postgres://${me}@localhost:5432/vha_dev" > .env.local

deno task db:local reset
