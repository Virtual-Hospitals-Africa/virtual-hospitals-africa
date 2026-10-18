#!/usr/bin/env bash
# Copies the bot's state to Notion (docs/bot.md#how-it-works): one write at a time, each the first
# thing the mirror lacks (bot/state.ts next notion), acknowledged with an event once Notion has it.
# A failed write is retried with backoff, 5 s doubling to 5 minutes.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
LOG_SOURCE=notion-writer
BACKOFF_MAX=300

trap 'exit 0' TERM INT
backoff=5
loops=0
while (( ${BOT_LOOPS:-0} == 0 || loops < BOT_LOOPS )); do
  loops=$((loops + 1))
  if ! job=$(bot_state next notion); then
    sleep "$BOT_POLL_SECONDS" &
    wait $! || true
    continue
  fi
  if notion job <<<"$job"; then
    bot_state emit "$(jq -c .ack <<<"$job")"
    backoff=5
  else
    log "writing to Notion failed ($(jq -c '{kind, card}' <<<"$job")); trying again in ${backoff}s"
    sleep "$backoff" &
    wait $! || true
    backoff=$(( backoff * 2 > BACKOFF_MAX ? BACKOFF_MAX : backoff * 2 ))
  fi
done
