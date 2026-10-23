#!/usr/bin/env bash
# What the bot is doing (docs/bot.md#debugging). Reads only.
#   deno task bot:status            the bot's processes, then every card
#   deno task bot:status <card>  one card, with the end of its card.log (id, hex id or branch)
#   bash bot/status.sh --follow   the first, redrawn every 5 s (the bot window of bot:attach)
set -euo pipefail

if [[ "${1:-}" == --follow ]]; then
  while :; do
    shown=$(bash "$0" 2>&1 || true)
    printf '\033[H\033[2J%s\n\n(every 5 s · %(%H:%M:%S)T)\n' "$shown" -1
    sleep 5
  done
fi

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"
CARD_LOG_LINES="${CARD_LOG_LINES:-40}"

if [[ $# -eq 0 ]]; then
  if pid=$(orchestrator_pid); then
    echo "Bot: running from $BOT_CODE (orchestrator pid $pid)"
  else
    echo "Bot: not running (deno task bot:start)"
  fi
  if [[ -f "$BOT_DIR/processes.json" ]]; then
    jq -r '.[] | "  \(.name): " + (if .gaveUp then "DOWN — exited too often; see .bot/orchestrator.log"
      elif .pid then "pid \(.pid)" + (if .recentExits > 0 then " (\(.recentExits) recent exits)" else "" end)
      else "not running" end)' "$BOT_DIR/processes.json"
  fi
  echo "Workers up to $BOT_WORKERS, testers up to $BOT_TESTERS"
  bot_state status
  exit 0
fi

bot_state status "$1"
info=$(bot_state card "$1")
worktree=$(jq -r '.worktree.path // empty' <<<"$info")
if [[ -n "$worktree" && -f "$worktree/.vha/ports.env" ]]; then
  id=$(jq -r .id <<<"$info")
  (
    ports_load "$worktree"
    printf '  ports:    http %s, https proxy %s\n' "$HTTP_SERVER_PORT" "$HTTPS_PROXY_SERVER_PORT"
    printf '  database: %s (tests use %s)\n' "$(card_db_dev "$id")" "$(card_db_test "$id")"
  )
fi
if [[ -n "$worktree" && -s "$worktree/.vha/worker.window" ]]; then
  printf '\nIts worker is live: deno task bot:attach %s, or %s' "$1" "$(tmux_attach_hint "$(window_name_for "$worktree")")"
fi
if [[ -n "$worktree" && -f "$worktree/.vha/card.log" ]]; then
  printf '\nLast %s lines of %s:\n' "$CARD_LOG_LINES" "$worktree/.vha/card.log"
  tail -n "$CARD_LOG_LINES" "$worktree/.vha/card.log"
fi
