#!/usr/bin/env bash
# Looks at the Notion board every minute and records what humans did there as events
# (docs/bot.md#how-it-works): a card ticked, held, unticked, unblocked, moved to Done, replied to.
# A failed look records nothing and is tried again next minute.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
LOG_SOURCE=notion-reader
BOT_READ_SECONDS="${BOT_READ_SECONDS:-60}"

trap 'exit 0' TERM INT
loops=0
while (( ${BOT_LOOPS:-0} == 0 || loops < BOT_LOOPS )); do
  notion poll || log "reading Notion failed (above); trying again in ${BOT_READ_SECONDS}s"
  sleep "$BOT_READ_SECONDS" &
  wait $! || true
  loops=$((loops + 1))
done
