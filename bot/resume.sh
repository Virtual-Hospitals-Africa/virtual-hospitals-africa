#!/usr/bin/env bash
# Opens a card's worker session in Claude, in its worktree (docs/bot.md#the-workers-reasoning):
#   deno task bot:resume <card> [claude args…]      (Notion URL, id, hex id or branch)
# While a worker is running, attaches you to its tmux window instead. Otherwise what you say joins
# the session the bot resumes next; pass --fork-session to talk over a copy.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"

[[ $# -ge 1 ]] || { sed -n 3p "$0" >&2; exit 1; }
name="$1"
shift
if ! card=$(card_named "$name"); then
  echo "resume: no card known as $name" >&2
  exit 1
fi
title=$(jq -r .title <<<"$card")
worktree=$(jq -r '.worktree.path // empty' <<<"$card")
session=$(jq -r '.session // empty' <<<"$card")
[[ -d "$worktree" ]] || { echo "resume: \"$title\" has no worktree" >&2; exit 1; }
if jq -e .worker <<<"$card" >/dev/null && [[ ! " $* " =~ " --fork-session " ]]; then
  if ! window=$(live_window "$worktree"); then
    echo "resume: a worker is starting on \"$title\"; try again in a moment, or pass --fork-session" >&2
    exit 1
  fi
  echo "Attaching to the worker on \"$title\" (C-b d leaves it running)"
  tmux_attach "$window"
fi
[[ -n "$session" ]] || { echo "resume: \"$title\" has no worker session yet" >&2; exit 1; }

echo "Resuming \"$title\" ($session) in $worktree"
cd "$worktree"
exec claude --resume "$session" "$@"
