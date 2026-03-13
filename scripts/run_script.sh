#! /usr/bin/env bash
set -euo pipefail

script="$1"
shift

if [ -f "$script" ]; then
  :
elif [ -f "./scripts/$script" ]; then
  script="./scripts/$script"
elif [ -f "./scripts/$script.sh" ]; then
  script="./scripts/$script.sh"
elif [ -f "./scripts/$script.ts" ]; then
  script="./scripts/$script.ts"
else
  echo "could not find script: $script"
  exit 1
fi

if [[ "$script" == *.ts ]]; then
  deno task run:trusted "$script" "$@"
else
  $script "$@"
fi
