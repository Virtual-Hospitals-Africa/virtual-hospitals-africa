#!/usr/bin/env bash
# shellcheck disable=SC2016 # bash -c scripts name their $arguments in single quotes
# One test of one card, then exit (docs/bot.md#how-it-works). Started by bot/tester-supervisor.sh:
#   bot/tester.sh <card> --request <id>
# Brings the branch up to origin/main and through the protected-path gate, then, in the card's own
# worktree on its own ports and databases (bot/lib/resources.sh), runs the command a worker's `run`
# outcome or a human's `bot:test` asks for, with a run dir of its own in .vha/runs. A command that
# needs the web servers (test/web) gets them pre-started on the card's ports and waited on until
# healthy (bot/lib/servers.sh); they, and the events processor with them, are stopped when the run
# ends. Every outcome is an event; a TERM ends it without one (the supervisor records it as
# interrupted).
set -euo pipefail

usage() { sed -n 4p "$0" >&2; exit 1; }
card="${1:-}"
[[ -n "$card" ]] || usage
shift
request=""
while (( $# > 0 )); do
  case "$1" in
    --request) request="${2:?}"; shift 2 ;;
    *) usage ;;
  esac
done
[[ -n "$request" ]] || usage

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/prompts.sh
source "$BOT_CODE/bot/lib/prompts.sh"
# shellcheck source=bot/lib/names.sh
source "$BOT_CODE/bot/lib/names.sh"
# shellcheck source=bot/lib/worktree.sh
source "$BOT_CODE/bot/lib/worktree.sh"
# shellcheck source=bot/lib/servers.sh
source "$BOT_CODE/bot/lib/servers.sh"
LOG_SOURCE=tester

TEST_CAP_SECONDS="${BOT_TEST_CAP_SECONDS:-2700}"

WT=$(bot_state card "$card" | jq -r '.worktree.path // empty')
[[ -d "$WT" ]] || { log "card $card has no worktree"; exit 1; }
cd "$WT"
exec > >(card_log "$WT" tester) 2>&1
# .vha/runs/current is this test's run dir once it has one (the sidebar follows it), never a past run.
rm -f "$WT/.vha/runs/current"
req=$(bot_state request "$card" "$request")
kind=$(jq -r .kind <<<"$req")
servers=$(jq -r .servers <<<"$req")
command=$(jq -r .command <<<"$req")

RUN_DIR="" STARTED=0 SERVERS_PID="" CMD_PID="" FOLLOW_PID="" FAILURE="" REPORTED=0
FAILED_AT=""

nullable() { jq -n --arg v "$1" 'if $v == "" then null else $v end'; }

# report <event args…>: the test's one result event.
report() {
  emit "$@"
  REPORTED=1
}

finished() {
  local code="$1" failure="$FAILURE"
  if (( code != 0 )) && [[ -z "$failure" ]]; then failure=$(failure_summary "$RUN_DIR" "$code"); fi
  report test.finished "$card" --argjson request "$request" --arg kind "$kind" --argjson exitCode "$code" \
    --argjson runDir "$(nullable "$RUN_DIR")" --argjson failure "$(nullable "$failure")"
}

# A step that fails unexpectedly is this test's failure, counted toward the card's limits — never a
# silent exit, which the supervisor would record as interrupted and run again, and again.
on_exit() {
  local code=$?
  if (( code == 0 || code == 143 || REPORTED )); then return; fi
  # A run dir that was never made is no run's: nothing to stop, nothing to record in it.
  if [[ -n "$RUN_DIR" && ! -d "$RUN_DIR" ]]; then RUN_DIR=""; fi
  if [[ -n "$RUN_DIR" ]]; then
    stop_children
    record_run 70
  fi
  FAILURE="tester.sh stopped unexpectedly (exit $code at line ${FAILED_AT:-?})"
  finished 70
}
trap 'FAILED_AT=$LINENO' ERR
trap on_exit EXIT

# ── before the run ───────────────────────────────────────────────────────────────────────────────
merged=0
branch_merge_main "$WT" || merged=$?
if (( merged == 3 )); then
  report test.conflicted "$card" --argjson request "$request"
  exit 0
elif (( merged != 0 )); then
  FAILURE="bringing the branch up to origin/main failed"
  finished 70
  exit 0
fi
gate_code=0
gate_out=$(bash "${BOT_PROTECTED_GATE:-$BOT_CODE/scripts/protected-gate.sh}" "$WT" 2>&1) || gate_code=$?
if (( gate_code == 2 )); then
  report test.refused "$card" --argjson request "$request" \
    --argjson files "$(sed -n 's/^  //p' <<<"$gate_out" | jq -Rnc '[inputs]')"
  exit 0
elif (( gate_code != 0 )); then
  FAILURE="the protected-path gate failed: $(head -1 <<<"$gate_out")"
  finished "$gate_code"
  exit 0
fi
sha=$(git rev-parse HEAD)

# ── the run ──────────────────────────────────────────────────────────────────────────────────────
# A worktree with no ports of its own is no test's: before any run dir, so there is nothing to stop.
if [[ ! -f "$WT/.vha/ports.env" ]]; then
  FAILURE="$WT has no .vha/ports.env"
  finished 70
  exit 0
fi
ports_load "$WT"
RUN_DIR="$WT/.vha/runs/$(date +%Y%m%d-%H%M%S)-bot-$kind"
STARTED=$(date +%s)
mkdir -p "$RUN_DIR"
ln -sfn "$(basename "$RUN_DIR")" "$WT/.vha/runs/current"
jq -n --arg run_label "bot-$kind" --arg command "$command" --argjson servers "$servers" --argjson started "$STARTED" \
  --arg sha "$sha" --arg http "$HTTP_SERVER_PORT" --arg https "$HTTPS_PROXY_SERVER_PORT" --arg database "$(card_db_dev "$card")" \
  '{"label": $run_label, command: $command, servers: $servers, sha: $sha, started: $started,
    ports: {http: ($http | tonumber), https: ($https | tonumber)}, database: $database, exitCode: null, durationMs: null}' \
  > "$RUN_DIR/run.json"

run_json() { jq "$@" "$RUN_DIR/run.json" > "$RUN_DIR/run.json.tmp" && mv "$RUN_DIR/run.json.tmp" "$RUN_DIR/run.json"; }

# The run's logs, into card.log as they are written, each under its own name. They exist before the
# follower starts, so it reads each from its first line. The servers' own logs (server.log, proxy.log,
# events.log) are in the worktree's logs/ while they run and copied here when it ends.
RUN_LOGS=(build.log servers.log command.log)
follow_logs() {
  local name="" line
  tail -n +1 -F "${RUN_LOGS[@]/#/$RUN_DIR/}" 2>/dev/null |
    while IFS= read -r line; do
      if [[ "$line" =~ ^==\>\ .*/([a-z-]+)\.log\ \<==$ ]]; then
        name="${BASH_REMATCH[1]}"
        name="${name/command/test}"
      elif [[ -n "$line" ]]; then
        printf '%(%H:%M:%S)T %s │ %s\n' -1 "$name" "$line" >> "$WT/.vha/card.log"
      fi
    done
}

stop_children() {
  if [[ -n "$SERVERS_PID" ]]; then servers_stop "$WT" "$SERVERS_PID"; fi
  stop_group "$CMD_PID" 25
  SERVERS_PID="" CMD_PID=""
  sleep 1
  stop_group "$FOLLOW_PID" 1
}

record_run() {
  run_json --argjson code "$1" --argjson ms $(( ($(date +%s) - STARTED) * 1000 )) '.exitCode = $code | .durationMs = $ms'
  ln -sfn "$(basename "$RUN_DIR")" "$WT/.vha/runs/latest"
}

# stopped <exit code>: the run ends here, its children stopped and run.json written.
stopped() {
  stop_children
  record_run "$1"
}

# copy_server_logs: the servers' logs kept with the run, since the next run truncates them.
copy_server_logs() {
  local name
  for name in server proxy events; do
    if [[ -f "$WT/logs/$name.log" ]]; then cp "$WT/logs/$name.log" "$RUN_DIR/$name.log" || true; fi
  done
}

# bare_400_note: said, never fixed, when a failed run's proxy log has the known flake's signature —
# responses with empty headers, a connection the Deno server itself rejected (the memory note
# test-proxy-bare-400-flake). Rerunning the failing files alone tells a flake from a real failure.
bare_400_note() {
  local count
  count=$(grep -ac 'headers: Headers {}' "$RUN_DIR/proxy.log" 2>/dev/null || true)
  if (( ${count:-0} > 0 )); then
    printf '; proxy.log has %s responses with empty headers, the known bare-400 flake: rerun the failing files alone before suspecting the change' "$count"
  fi
}

trap 'stop_children; record_run 143; exit 143' TERM INT
for log in "${RUN_LOGS[@]}"; do : > "$RUN_DIR/$log"; done
spawn "" follow_logs
FOLLOW_PID=$SPAWNED

# The test runs in the card's worktree, so what it tests is what is checked out there: the commit,
# and no uncommitted change to a tracked file.
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  FAILURE="the worktree has uncommitted changes, which would be tested as ${sha:0:8}; commit or drop them"
  stopped 70
  finished 70
  exit 0
fi
if ! deps_refresh "$WT" >> "$RUN_DIR/build.log" 2>&1; then
  FAILURE="installing the packages failed (see $RUN_DIR/build.log)"
  stopped 70
  finished 70
  exit 0
fi
if ! card_db_ready "$card"; then
  FAILURE="the card's databases ($(card_db_dev "$card"), $(card_db_test "$card")) are not there; the worker supervisor makes them again before the card's next turn"
  stopped 70
  finished 70
  exit 0
fi

if [[ "$servers" == true ]]; then
  use_build=0
  if [[ "$command" == *--use-build* ]]; then use_build=1; fi
  if ! servers_start "$WT" "$use_build" "$RUN_DIR/servers.log"; then
    FAILURE="the web servers were not healthy (see servers.log in $(basename "$RUN_DIR"))"
    copy_server_logs
    stopped 70
    finished 70
    exit 0
  fi
  SERVERS_PID=$SPAWNED
fi

# The command: on the card's ports and database (its .env and .vha/ports.env), as the isolated user.
: > "$RUN_DIR/command.exit"
spawn "" env -i "${ISOLATED_ENV[@]}" bash -c 'cd "$1" && source .vha/ports.env && (eval "$2"); echo $? > "$3"' \
  _ "$WT" "$command" "$RUN_DIR/command.exit" >> "$RUN_DIR/command.log" 2>&1
CMD_PID=$SPAWNED
code=70
waited=0
while kill -0 "$CMD_PID" 2>/dev/null; do
  if (( waited >= TEST_CAP_SECONDS )); then
    FAILURE="the run hit the $((TEST_CAP_SECONDS / 60))-minute cap"
    code=124
    break
  fi
  if [[ -n "$SERVERS_PID" ]] && ! kill -0 "$SERVERS_PID" 2>/dev/null; then
    FAILURE="the web servers exited during the run (see servers.log, server.log and events.log in $(basename "$RUN_DIR"))"
    code=1
    break
  fi
  sleep 1
  waited=$((waited + 1))
done
if [[ -z "$FAILURE" ]]; then
  wait "$CMD_PID" || true
  code=$(cat "$RUN_DIR/command.exit" 2>/dev/null || echo 70)
  code=${code:-70}
fi
stop_children
copy_server_logs
trap - TERM INT
if (( code != 0 )); then
  if [[ -z "$FAILURE" ]]; then FAILURE=$(failure_summary "$RUN_DIR" "$code"); fi
  note=$(bare_400_note)
  FAILURE="$FAILURE$note"
  if [[ -n "$note" ]]; then log "${note#; }"; fi
fi
record_run "$code"
finished "$code"
