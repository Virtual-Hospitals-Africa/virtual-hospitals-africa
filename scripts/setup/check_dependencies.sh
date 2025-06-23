#! /usr/bin/env bash
set -euo pipefail

ensure_you_have() {
  if ! command -v "$1" &> /dev/null
  then
    echo "Please install ${2-$1}"
    exit 1
  fi
}

echo "Checking you have the right tools installed..."

ensure_you_have "git"
ensure_you_have "deno"
ensure_you_have "npm"
ensure_you_have "node"
ensure_you_have "heroku"
ensure_you_have "redis-server" "redis"
ensure_you_have "createdb" "postgresql"
