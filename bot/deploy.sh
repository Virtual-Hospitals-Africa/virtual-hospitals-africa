#!/usr/bin/env bash
# Brings the bot's checkout up to origin/main and restarts the bot (docs/bot.md#running):
#   deno task bot:deploy
# The checkout changes only here, never while the bot runs from it.
set -euo pipefail

checkout="$(cd "$(dirname "$0")/.." && pwd)"
branch=$(git -C "$checkout" branch --show-current)
if [[ "$branch" != main ]]; then
  echo "deploy: $checkout is on $branch; the bot runs from main" >&2
  exit 1
fi
bash "$checkout/bot/run.sh" stop
git -C "$checkout" pull -q --ff-only origin main
npm --prefix "$checkout" ci --silent
npm --prefix "$checkout/functions" ci --silent
bash "$checkout/bot/run.sh" start
