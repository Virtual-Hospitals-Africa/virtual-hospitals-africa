# shellcheck shell=bash
# bot/lib/checks.sh — what a `done` must pass before its PR (docs/bot.md#a-done): origin/main merged
# in, the protected-path gate, then the checks of bot/lib/run-checks.sh (deno check, fmt, lint,
# hygiene, and the tests outside test/web) side by side on the worktree's own database and ports.
# Source after bot.sh and worktree.sh.

CHECKS_CAP_SECONDS="${CHECKS_CAP_SECONDS:-1800}"
# shellcheck disable=SC2016 # eval'd by checks_run, where $2 is the bot's checkout
CHECKS_COMMAND='bash "$2/bot/lib/run-checks.sh"'
CHECKS_PID=""

# checks_run <worktree> <log> <protected files out>: 0 passed; 1 a check failed (its output in
# <log>); 2 protected paths changed (listed in <protected files out>); 3 merging origin/main
# conflicted; 4 bringing the branch up to origin/main failed otherwise (a fetch, deno install,
# migrating the card's database; in <log>); 124 the checks ran past CHECKS_CAP_SECONDS. Run it in the calling shell, never in
# $(…), so a TERM is not held while they run. The checks get the isolated environment, so no token
# reaches them; CHECKS_PID is theirs while they run.
checks_run() {
  local wt="$1" log="$2" protected="$3" merged=0 gate_out gate_code=0 waited=0 code=0
  branch_merge_main "$wt" >> "$log" 2>&1 || merged=$?
  if (( merged == 3 )); then return 3; elif (( merged != 0 )); then return 4; fi
  gate_out=$(bash "${BOT_PROTECTED_GATE:-$BOT_CODE/scripts/protected-gate.sh}" "$wt" 2>&1) || gate_code=$?
  if (( gate_code == 2 )); then
    sed -n 's/^  //p' <<<"$gate_out" > "$protected"
    return 2
  elif (( gate_code != 0 )); then
    echo "the protected-path gate failed: $(head -1 <<<"$gate_out")" >> "$log"
    return 1
  fi
  # shellcheck disable=SC2016 # a bash -c script names its $arguments in single quotes
  spawn "" env -i "${ISOLATED_ENV[@]}" bash -c \
    'cd "$1" && source "$2/bot/lib/resources.sh" && ports_load "$1" && eval "$3"' _ "$wt" "$BOT_CODE" "$CHECKS_COMMAND" \
    >> "$log" 2>&1
  CHECKS_PID=$SPAWNED
  while kill -0 "$CHECKS_PID" 2>/dev/null && (( waited < CHECKS_CAP_SECONDS )); do
    sleep 1
    waited=$((waited + 1))
  done
  if kill -0 "$CHECKS_PID" 2>/dev/null; then
    stop_group "$CHECKS_PID" 25
    CHECKS_PID=""
    return 124
  fi
  wait "$CHECKS_PID" || code=$?
  CHECKS_PID=""
  (( code == 0 )) || return 1
}

# checks_failure <log>: what failed, for the card — the runner's last line.
checks_failure() {
  one_line "$(awk 'NF { l = $0 } END { print l }' "$1")"
}
