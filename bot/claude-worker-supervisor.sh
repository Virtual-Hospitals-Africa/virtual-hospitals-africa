#!/usr/bin/env bash
# shellcheck disable=SC2329 # shutdown runs from a trap
# Runs up to BOT_WORKERS worker turns at once (docs/bot.md#how-it-works). Owns the bot's worktrees and
# each card's resources (bot/lib/resources.sh): makes a card's worktree, ports and databases before its
# first turn, and removes them once the card is withdrawn or done and nothing of it runs. Each turn is
# bot/claude-worker.sh.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/worktree.sh
source "$BOT_CODE/bot/lib/worktree.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"
# shellcheck source=bot/lib/servers.sh
source "$BOT_CODE/bot/lib/servers.sh"
LOG_SOURCE=worker-supervisor
BOT_WORKER="${BOT_WORKER:-$BOT_CODE/bot/claude-worker.sh}"

declare -A PID=() WT=()

# A turn that ended without saying how is recorded as interrupted, so its card is resumed.
settle() {
  local card="$1"
  if [[ "$(bot_state card "$card" | jq -r .worker)" == true ]]; then
    emit worker.interrupted "$card"
    log "card $card: its worker ended without a result; recorded as interrupted"
  fi
  tmux_close_recorded "${WT[$card]}/.vha/worker.window"
  rm -f "${WT[$card]}/.vha/worker.pid"
  unset 'PID[$card]' 'WT[$card]'
}

reap() {
  local card
  for card in "${!PID[@]}"; do
    if kill -0 "${PID[$card]}" 2>/dev/null; then continue; fi
    wait "${PID[$card]}" 2>/dev/null || true
    settle "$card"
  done
}

# Withdrawn and done cards: their worker stopped, then their worktree removed once nothing runs.
clean_gone() {
  local line card path branch
  while read -r line; do
    card=$(jq -r .card <<<"$line")
    if [[ -n "${PID[$card]:-}" ]]; then
      log "card $card is withdrawn or done; stopping its worker"
      stop_group "${PID[$card]}"
      continue
    fi
    if [[ "$(jq -r '.worker or .tester' <<<"$line")" == true || "$(jq -r '.worktree == null' <<<"$line")" == true ]]; then
      continue
    fi
    path=$(jq -r .worktree.path <<<"$line")
    branch=$(jq -r .worktree.branch <<<"$line")
    # Whatever stack a test left running on the card's ports goes first, then its databases, so a
    # worktree is never removed while its databases are kept.
    stack_kill "$path"
    if ! card_db_drop "$card"; then
      log "card $card: could not drop its databases; trying again"
      continue
    fi
    if worktree_remove "$path" "$branch" "$(jq -r 'if .by == "done" then 1 else 0 end' <<<"$line")"; then
      emit worktree.removed "$card"
      log "card $card: removed $path"
    else
      log "card $card: could not remove $path; trying again"
    fi
  done < <(bot_state gone)
}

# Makes the card's worktree, ports and databases; the next look at the queue then starts its worker.
# A dump that is missing or stale, which retrying cannot fix, blocks the card (worktree.failed's
# `resource`); a Postgres that is down is waited out: nothing is recorded and this returns 1, so the
# caller stops looking at the queue until the next time round.
make_worktree() {
  local card="$1" title="$2" made code=0 message err="$BOT_DIR/worktree-error.log"
  log "card $card: making its worktree"
  if made=$(worktree_create "$card" "$title" 2> "$err"); then
    read -r path branch index <<<"$made"
    emit worktree.created "$card" --arg path "$path" --arg branch "$branch" --argjson portIndex "$index"
    return 0
  else
    code=$?
  fi
  message=$(grep -v '^$' "$err" | tail -1 | cut -c1-500)
  case "$code" in
    10) emit worktree.failed "$card" --arg error "$message" --arg resource dump_missing ;;
    11) emit worktree.failed "$card" --arg error "$message" --arg resource dump_stale ;;
    12)
      log "card $card: $message; waiting for it"
      return 1
      ;;
    *) emit worktree.failed "$card" --arg error "$message" ;;
  esac
  log "card $card: making its worktree failed: $message"
}

# ensure_databases <card> <worktree>: the card's databases are there before its worker starts — made
# again when something (docker compose down -v, a human) dropped them. 0 when they are; 1 when the
# worker must not start now, the reason recorded as for a new worktree, or the Postgres waited for.
ensure_databases() {
  local card="$1" worktree="$2" message code=0
  if ! db_server_ready; then
    log "the Postgres at $(db_base_url) is not reachable; no worker starts until it is"
    return 1
  fi
  if card_db_ready "$card"; then return 0; fi
  log "card $card: its databases are gone; making them again"
  message=$(dump_check) || code=$?
  case "$code" in
    10) emit worktree.failed "$card" --arg error "$message" --arg resource dump_missing; return 1 ;;
    11) emit worktree.failed "$card" --arg error "$message" --arg resource dump_stale; return 1 ;;
  esac
  if card_db_create "$card" "$worktree"; then return 0; fi
  emit worktree.failed "$card" --arg error "recreating the databases failed: $(grep -v '^$' "$worktree/.vha/db.log" | tail -1 | cut -c1-400)"
  return 1
}

# Databases no card with a worktree owns — a crash between making them and recording the worktree —
# are dropped once, as this process starts.
sweep_databases() {
  local line
  if ! db_server_ready; then
    log "the Postgres at $(db_base_url) is not reachable; not looking for leftover databases"
    return 0
  fi
  bot_state owned | jq -r .card | db_sweep | while IFS= read -r line; do log "$line"; done
}

# talking: `--except <worktree>` for each card a human is talking to in its talk window
# (bot/sidebar.sh), so no turn of the bot's joins its session meanwhile.
talking() {
  local file
  for file in "$BOT_WORKTREES"/*/.vha/talk.window; do
    if talk_open "${file%/.vha/talk.window}"; then printf -- '--except\n%s\n' "${file%/.vha/talk.window}"; fi
  done
}

# talk_said <worktree>: the human typed to the worker session after its talk window opened — a prompt
# in its transcript newer than .vha/talk.window, not a tool result or a slash command.
talk_said() {
  local transcript opened
  transcript=$(cat "$1/.vha/transcript" 2>/dev/null) || return 1
  [[ -s "$transcript" ]] || return 1
  opened=$(date -u -r "$1/.vha/talk.window" +%Y-%m-%dT%H:%M:%S)
  jq -R -n -e --arg opened "$opened" '
    [inputs | fromjson? | select(.type == "user" and (.isMeta | not) and (.timestamp // "")[0:19] >= $opened)
      | .message.content
      | if type == "string" then . else (map(select(.type == "text") | .text) | join("")) end
      | select(length > 0 and (startswith("<command-name>") or startswith("<local-command-") | not))]
    | length > 0' "$transcript" > /dev/null 2>&1
}

# A talk window that has closed is a reply when the human said something there or the worker left an
# outcome: the card is resumed on it (card.talked). Its record goes either way.
talks_ended() {
  local file worktree card
  for file in "$BOT_WORKTREES"/*/.vha/talk.window; do
    [[ -e "$file" ]] || continue
    worktree=${file%/.vha/talk.window}
    if talk_open "$worktree"; then continue; fi
    card=$(jq -r '.id // empty' "$worktree/.vha/card.json" 2>/dev/null || true)
    if [[ -n "$card" ]] && bot_state card "$card" > /dev/null 2>&1 &&
      { [[ -e "$worktree/.vha/outcome.json" ]] || talk_said "$worktree"; }; then
      emit card.talked "$card"
      log "card $card: its talk window closed; it will be resumed"
    fi
    rm -f "$file"
  done
}

fill() {
  local job card worktree except=()
  mapfile -t except < <(talking)
  while (( ${#PID[@]} < BOT_WORKERS )) && job=$(bot_state next worker "${except[@]}"); do
    card=$(jq -r .card <<<"$job")
    worktree=$(jq -r '.worktree.path // empty' <<<"$job")
    if [[ -z "$worktree" ]]; then
      make_worktree "$card" "$(jq -r .title <<<"$job")" || break
      continue
    fi
    ensure_databases "$card" "$worktree" || break
    emit worker.launched "$card"
    spawn "$worktree/.vha/worker.pid" env -i "${ISOLATED_ENV[@]}" bash "$BOT_WORKER" "$card"
    PID[$card]=$SPAWNED
    WT[$card]=$worktree
    log "card $card: worker started"
  done
}

# Turns a previous run of this process left behind are stopped and recorded as interrupted.
recover() {
  local line card worktree
  while read -r line; do
    card=$(jq -r .card <<<"$line")
    worktree=$(jq -r '.worktree.path // empty' <<<"$line")
    if [[ -n "$worktree" ]]; then
      stop_recorded "$worktree/.vha/worker.pid"
      tmux_close_recorded "$worktree/.vha/worker.window"
    fi
    emit worker.interrupted "$card"
    log "card $card: its worker was cut off by a restart; it will be resumed"
  done < <(bot_state live worker)
}

shutdown() {
  local card
  trap - TERM INT
  for card in "${!PID[@]}"; do stop_group "${PID[$card]}"; done
  for card in "${!PID[@]}"; do settle "$card"; done
  exit 0
}

mkdir -p "$BOT_WORKTREES"
recover
sweep_databases
trap shutdown TERM INT
loops=0
while (( ${BOT_LOOPS:-0} == 0 || loops < BOT_LOOPS )); do
  reap
  clean_gone
  talks_ended
  fill
  sleep "$BOT_POLL_SECONDS" &
  wait $! || true
  loops=$((loops + 1))
done
