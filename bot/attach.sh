#!/usr/bin/env bash
# Attaches you to the bot's tmux session, making it if there is none (docs/bot.md#watching-a-worker):
# the bot window (bot:status, kept fresh, over the orchestrator's log), the events window, then one
# window per running worker. C-b w picks a window, C-b d leaves everything running.
#   deno task bot:attach            the session, at the bot window
#   deno task bot:attach <card>  straight to that card's worker (id, hex id, branch or Notion URL)
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"

tmux_ensure
tmux_restore
if [[ $# -eq 0 ]]; then tmux_attach "$(tmux_window_named bot)"; fi
if ! card=$(card_named "$1"); then
  echo "attach: no card known as $1" >&2
  exit 1
fi
title=$(jq -r .title <<<"$card")
if ! window=$(live_window "$(jq -r '.worktree.path // empty' <<<"$card")"); then
  echo "attach: no worker is running on \"$title\" (deno task bot:resume $1 opens its session)" >&2
  exit 1
fi
tmux_attach "$window"
