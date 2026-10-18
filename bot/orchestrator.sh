#!/usr/bin/env bash
# shellcheck disable=SC2329 # shutdown runs from a trap
# The bot (docs/bot.md#how-it-works): keeps one each of its five processes running. bot:start runs
# this one in the bot window of the bot's tmux session. It holds no state; .bot/processes.json says
# what it is running, for bot:status.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
LOG_SOURCE=orchestrator

CHILDREN=(notion-reader notion-writer gh-reader claude-worker-supervisor tester-supervisor)
RESTART_DELAY="${BOT_RESTART_DELAY:-5}"
CRASH_WINDOW=300
CRASH_LIMIT=5
BOT_CHILD_DIR="${BOT_CHILD_DIR:-$BOT_CODE/bot}"

declare -A PID=() EXITS=() GAVE_UP=()

write_processes() {
  local name
  for name in "${CHILDREN[@]}"; do
    jq -nc --arg name "$name" --arg pid "${PID[$name]:-}" --arg exits "${EXITS[$name]:-}" --arg gaveUp "${GAVE_UP[$name]:-}" \
      '{name: $name, pid: (if $pid == "" then null else ($pid | tonumber) end),
        recentExits: ($exits | split(" ") | map(select(. != "")) | length), gaveUp: ($gaveUp != "")}'
  done | jq -s . > "$BOT_DIR/processes.json"
}

start() {
  bash "$BOT_CHILD_DIR/$1.sh" &
  PID[$1]=$!
  log "started $1 (pid ${PID[$1]})"
}

# A child that exited CRASH_LIMIT times within CRASH_WINDOW seconds is left down, for a human.
on_exit() {
  local name="$1" code="$2" now recent=() at
  now=$(date +%s)
  unset 'PID[$name]'
  for at in ${EXITS[$name]:-} "$now"; do
    if (( now - at < CRASH_WINDOW )); then recent+=("$at"); fi
  done
  EXITS[$name]="${recent[*]}"
  if (( ${#recent[@]} >= CRASH_LIMIT )); then
    GAVE_UP[$name]=1
    log "$name exited $CRASH_LIMIT times in $((CRASH_WINDOW / 60)) minutes (last: exit $code); leaving it down — see above, then deno task bot:start"
    return
  fi
  log "$name exited ($code); starting it again in ${RESTART_DELAY}s"
  sleep "$RESTART_DELAY"
  start "$name"
}

shutdown() {
  local name
  trap - TERM INT
  log "stopping"
  for name in "${!PID[@]}"; do kill -TERM "${PID[$name]}" 2>/dev/null || true; done
  wait || true
  PID=()
  write_processes
  exit 0
}

mkdir -p "$BOT_DIR"
trap shutdown TERM INT
for name in "${CHILDREN[@]}"; do start "$name"; done
write_processes
while (( ${#PID[@]} > 0 )); do
  died="" code=0
  wait -n -p died || code=$?
  [[ -n "$died" ]] || continue
  for name in "${!PID[@]}"; do
    if [[ "${PID[$name]}" == "$died" ]]; then on_exit "$name" "$code"; fi
  done
  write_processes
done
log "every process has given up; exiting — see above, then deno task bot:start"
exit 1
