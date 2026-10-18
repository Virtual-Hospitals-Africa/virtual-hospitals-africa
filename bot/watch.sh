#!/usr/bin/env bash
# Follows the bot as it works (docs/bot.md#debugging). Ctrl-C to stop.
#   deno task bot:watch            every card's events, as they happen
#   deno task bot:watch <card>  everything about one card: its card.log (id, hex id or branch)
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"

if [[ $# -eq 0 ]]; then
  touch "$BOT_DIR/events.jsonl"
  tail -n 20 -F "$BOT_DIR/events.jsonl" | bot_state render
  exit 0
fi
worktree=$(bot_state card "$1" | jq -r '.worktree.path // empty') || { echo "watch: no card known as $1" >&2; exit 1; }
if [[ -z "$worktree" ]]; then
  echo "watch: $1 has no worktree yet" >&2
  exit 1
fi
touch "$worktree/.vha/card.log"
tail -n 40 -F "$worktree/.vha/card.log"
