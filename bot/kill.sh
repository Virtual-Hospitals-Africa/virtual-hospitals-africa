#!/usr/bin/env bash
# Takes a card back from the bot for good (docs/bot.md#running):
#   deno task bot:kill <card> [--yes]      (id, hex id or branch)
# The supervisors stop its worker or test, drop its databases and remove its worktree — uncommitted
# work is lost; the branch is kept — and the Notion writer unticks Bot.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"

name="" yes=0
for arg in "$@"; do
  if [[ "$arg" == --yes ]]; then yes=1; else name="$arg"; fi
done
[[ -n "$name" ]] || { sed -n 3p "$0" >&2; exit 1; }
if ! card=$(bot_state card "$name"); then
  echo "kill: no card known as $name" >&2
  exit 1
fi
id=$(jq -r .id <<<"$card")
echo "Take back \"$(jq -r .title <<<"$card")\" ($id), now $(jq -r .state <<<"$card")?"
echo "  its worker or test is stopped, its databases are dropped, and $(jq -r '.worktree.path // "its worktree (none yet)"' <<<"$card") is removed; Bot is unticked."
if (( ! yes )); then
  read -rp "Kill it? [y/N]: " answer || true
  [[ "$answer" =~ ^[Yy] ]] || { echo "Left as it was."; exit 0; }
fi
emit card.withdrawn "$id" --arg by kill
echo "✔ withdrawn; the bot cleans it up within a few seconds (deno task bot:status $id)"
