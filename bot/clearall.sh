#!/usr/bin/env bash
# Starts the bot over from nothing (docs/bot.md#running):
#   deno task bot:clearall [--yes]
# Every card's worktree in $BOT_WORKTREES is removed — uncommitted work is lost; the branches are
# kept, and so is the folder — as are every bot database (vha_dev_bot_*, vha_test_bot_*), and the event
# log goes, so the bot forgets every card. Only while the bot is stopped.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"
# shellcheck source=bot/lib/worktree.sh
source "$BOT_CODE/bot/lib/worktree.sh"
# shellcheck source=bot/lib/servers.sh
source "$BOT_CODE/bot/lib/servers.sh"

yes=0
for arg in "$@"; do
  if [[ "$arg" == --yes ]]; then yes=1; else sed -n 3p "$0" >&2; exit 1; fi
done
if orchestrator_pid >/dev/null; then
  echo "clearall: the bot is running; deno task bot:stop first" >&2
  exit 1
fi

shopt -s nullglob
worktrees=("$BOT_WORKTREES"/*/)
echo "Clear the bot?"
echo "  ${#worktrees[@]} worktree(s) in $BOT_WORKTREES are removed (their branches are kept), every bot database is dropped, and $BOT_DIR/events.jsonl is deleted."
if (( ! yes )); then
  read -rp "Clear it all? [y/N]: " answer || true
  [[ "$answer" =~ ^[Yy] ]] || { echo "Left as it was."; exit 0; }
fi

registered=$(git -C "$BOT_CHECKOUT" worktree list --porcelain)
for path in "${worktrees[@]}"; do
  path="${path%/}"
  stack_kill "$path"
  if grep -qxF "worktree $(cd "$path" && pwd -P)" <<<"$registered"; then
    worktree_remove "$path" "" 0
  else
    rm -rf "$path"
  fi
  echo "✔ removed $path"
done
git -C "$BOT_CHECKOUT" worktree prune
if db_server_ready; then
  db_sweep < /dev/null
else
  echo "! the Postgres at $(db_base_url) is not reachable; its bot databases (vha_*_bot_*) were left" >&2
fi
rm -f "$BOT_DIR/events.jsonl"
echo "✔ cleared; deno task bot:start begins again from the cards ticked Bot"
