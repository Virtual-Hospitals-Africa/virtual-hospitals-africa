#!/usr/bin/env bash
# A worker's Claude Code hook (bot/claude-worker.sh): appends the event and its payload, one line,
# to the turn's hook log, which is how the worker knows when Claude is busy, idle or gone.
#   bash bot/lib/turn-hook.sh <event> <hook log>     (the payload on stdin)
# Prints nothing: a UserPromptSubmit hook's output would join the prompt.
jq -c --arg event "$1" '{event: $event, payload: .}' >> "$2" 2>/dev/null ||
  printf '{"event":"%s","payload":null}\n' "$1" >> "$2"
exit 0
