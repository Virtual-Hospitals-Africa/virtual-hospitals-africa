#!/usr/bin/env bash
# shellcheck disable=SC2329 # shutdown runs from a trap
# Runs up to BOT_TESTERS tests at once (docs/bot.md#how-it-works): the global slots through which the
# heavy tests (a card's web tests, with their servers) are serialized. Each test runs in its card's own
# worktree, on its own ports and databases (bot/tester.sh); one that ends or is stopped here leaves
# no server of its card's running.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/servers.sh
source "$BOT_CODE/bot/lib/servers.sh"
LOG_SOURCE=tester-supervisor
BOT_TESTER="${BOT_TESTER:-$BOT_CODE/bot/tester.sh}"

# Per tester number, while busy: its test, and the test's card, request and worktree.
declare -A PID=() CARD=() REQUEST=() WT=()

# A test that ended without saying how is recorded as interrupted, so its card is tested again.
settle_test() {
  local t="$1" live
  live=$(bot_state card "${CARD[$t]}" | jq -r '.tester.request // empty')
  if [[ "$live" == "${REQUEST[$t]}" ]]; then
    emit test.interrupted "${CARD[$t]}" --argjson request "${REQUEST[$t]}"
    log "card ${CARD[$t]}: tester #$t ended without a result; recorded as interrupted"
  fi
  stack_kill "${WT[$t]}"
  rm -f "${WT[$t]}/.vha/tester.pid"
}

reap() {
  local t
  for t in "${!PID[@]}"; do
    if kill -0 "${PID[$t]}" 2>/dev/null; then continue; fi
    wait "${PID[$t]}" 2>/dev/null || true
    unset 'PID[$t]'
    settle_test "$t"
  done
}

stop_gone() {
  local card t
  while read -r card; do
    for t in "${!PID[@]}"; do
      if [[ "${CARD[$t]}" == "$card" ]]; then
        log "card $card is withdrawn or done; stopping tester #$t"
        stop_group "${PID[$t]}"
      fi
    done
  done < <(bot_state gone | jq -r 'select(.tester) | .card')
}

fill() {
  local t job card request worktree
  for t in $(seq 1 "$BOT_TESTERS"); do
    [[ -z "${PID[$t]:-}" ]] || continue
    job=$(bot_state next tester) || return 0
    card=$(jq -r .card <<<"$job")
    request=$(jq -r .request <<<"$job")
    worktree=$(jq -r .worktree <<<"$job")
    emit test.launched "$card" --argjson request "$request" --argjson tester "$t"
    spawn "$worktree/.vha/tester.pid" env -i "${ISOLATED_ENV[@]}" bash "$BOT_TESTER" "$card" --request "$request"
    PID[$t]=$SPAWNED CARD[$t]=$card REQUEST[$t]=$request WT[$t]=$worktree
    log "card $card: tester #$t started request $request"
  done
}

# Tests a previous run of this process left behind are stopped and recorded as interrupted.
recover() {
  local line card worktree
  while read -r line; do
    card=$(jq -r .card <<<"$line")
    worktree=$(jq -r '.worktree.path // empty' <<<"$line")
    if [[ -n "$worktree" ]]; then
      stop_recorded "$worktree/.vha/tester.pid"
      stack_kill "$worktree"
    fi
    emit test.interrupted "$card" --argjson request "$(jq -r .request <<<"$line")"
    log "card $card: its test was cut off by a restart; it will run again"
  done < <(bot_state live tester)
}

shutdown() {
  local t
  trap - TERM INT
  for t in "${!PID[@]}"; do stop_group "${PID[$t]}"; done
  for t in "${!PID[@]}"; do settle_test "$t"; done
  exit 0
}

recover
trap shutdown TERM INT
loops=0
while (( ${BOT_LOOPS:-0} == 0 || loops < BOT_LOOPS )); do
  reap
  stop_gone
  fill
  sleep "$BOT_POLL_SECONDS" &
  wait $! || true
  loops=$((loops + 1))
done
