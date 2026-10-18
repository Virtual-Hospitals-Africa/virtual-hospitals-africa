#!/usr/bin/env bash
# shellcheck disable=SC2016 # a bash -c script names its $arguments in single quotes
# One worker turn on one card, then exit (docs/bot.md#a-worker-turn):
#   bot/claude-worker.sh <card>
# Runs Claude in the card's worktree, in a window of the bot's tmux session you can attach to — the
# card itself on the first turn, `bot/state.ts resume` after — and turns how the turn ended into one
# event: its outcome, why it has none, or a usage limit. A TERM ends it without one (the supervisor
# records it as interrupted), and so does somebody closing its window.
set -euo pipefail

card="${1:?usage: bot/claude-worker.sh <card>}"
# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/prompts.sh
source "$BOT_CODE/bot/lib/prompts.sh"
# shellcheck source=bot/lib/worktree.sh
source "$BOT_CODE/bot/lib/worktree.sh"
# shellcheck source=bot/lib/usage.sh
source "$BOT_CODE/bot/lib/usage.sh"
# shellcheck source=bot/lib/names.sh
source "$BOT_CODE/bot/lib/names.sh"
# shellcheck source=bot/lib/checks.sh
source "$BOT_CODE/bot/lib/checks.sh"
# shellcheck source=bot/lib/pr.sh
source "$BOT_CODE/bot/lib/pr.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"
LOG_SOURCE=worker

info=$(bot_state card "$card")
WT=$(jq -r '.worktree.path // empty' <<<"$info")
session=$(jq -r '.session // empty' <<<"$info")
[[ -d "$WT" ]] || { log "card $card has no worktree"; exit 1; }
cd "$WT"
exec > >(card_log "$WT" worker) 2>&1

CLAUDE_WINDOW="" FOLLOW_PID="" REPORTED=0 FAILED_AT="" CHECKING=0
# report <event args…>: the turn's one result event.
report() {
  emit "$@"
  REPORTED=1
}
stop_all() {
  if [[ -n "$CLAUDE_WINDOW" ]]; then tmux_close "$CLAUDE_WINDOW"; fi
  CLAUDE_WINDOW=""
  rm -f "$WT/.vha/worker.window"
  stop_group "$CHECKS_PID" 25
  sleep 0.5
  stop_group "$FOLLOW_PID" 1
}
# A step that fails unexpectedly is this turn's failure, counted toward the card's limits — never a
# silent exit, which the supervisor would record as interrupted and resume, and again.
on_exit() {
  local code=$?
  if (( code == 0 || code == 143 || REPORTED )); then return; fi
  stop_all
  local detail="claude-worker.sh stopped unexpectedly (exit $code at line ${FAILED_AT:-?})"
  # During its checks the card is Checking, where only a checks' result settles it.
  if (( CHECKING )); then
    report checks.failed "$card" --arg result failed --argjson log null --arg failure "$detail" --argjson files '[]'
  else
    report worker.failed "$card" --arg why crashed --arg detail "$detail"
  fi
}
trap 'FAILED_AT=$LINENO' ERR
trap on_exit EXIT

# verify_done <outcome file>: a done's checks, then its PR — one result event either way. A TERM
# exits without one; the supervisor records it as interrupted and the worker is resumed.
verify_done() {
  local file="$1" dir="$WT/.vha/checks" code=0 failure url
  local log="$dir/$n.log" protected="$dir/$n.protected" body="$dir/$n.pr.md" err="$dir/$n.pr.log"
  mkdir -p "$dir"
  : > "$log"
  CHECKING=1
  emit checks.started "$card" --arg file "$file"
  trap 'stop_all; exit 143' TERM INT
  checks_run "$WT" "$log" "$protected" || code=$?
  trap - TERM INT
  case "$code" in
    0) ;;
    2)
      report checks.failed "$card" --arg result refused --argjson log null --arg failure "protected paths changed" \
        --argjson files "$(jq -Rnc '[inputs]' < "$protected")"
      return ;;
    3)
      report checks.failed "$card" --arg result conflicted --argjson log null --arg failure "merging origin/main conflicted" \
        --argjson files '[]'
      return ;;
    4)
      report checks.failed "$card" --arg result failed --arg log "$log" \
        --arg failure "bringing the branch up to origin/main failed (see $log)" --argjson files '[]'
      return ;;
    *)
      if (( code == 124 )); then failure="the checks ran past $((CHECKS_CAP_SECONDS / 60)) minutes"; else failure=$(checks_failure "$log"); fi
      report checks.failed "$card" --arg result failed --arg log "$log" --arg failure "$failure" --argjson files '[]'
      return ;;
  esac
  printf '%s\n\nThe bot'"'"'s checks passed before this PR was opened (%s); CI is the gate, and also runs the web tests, the migrations test and the builds.\n' \
    "$(jq -r .prBody "$file")" "$(bash "$BOT_CODE/bot/lib/run-checks.sh" --list | paste -sd, - | sed 's/,/, /g')" > "$body"
  if url=$(pr_publish "$WT" "$(jq -r .prTitle "$file")" "$body" 2> "$err") && [[ -n "$url" ]]; then
    report pr.pushed "$card" --arg url "$url" --arg sha "$(git -C "$WT" rev-parse HEAD)"
  else
    failure=$(grep -v '^$' "$err" | tail -1 || true)
    report pr.failed "$card" --arg error "${failure:-gh printed no PR URL}"
  fi
}

# A worker owed a merge of origin/main (bot:start could not make it) has it made here, outside the
# sandbox, which won't let Claude write some paths a merge can touch (.claude/skills, …): its
# uncommitted work is committed first, and a merge that conflicts is left in progress for Claude to
# resolve. What happened opens the turn's prompt.
MERGE_NOTE=""
# db.d.ts is generated, so a conflict in it is never merged by hand (bot/lib/worktree.sh branch_merge_main).
DB_TYPES_STEPS='run `deno task local db:migrate latest` and then `deno task db:codegen` (both against your card'"'"'s own database), `git add db.d.ts`'
conflicts_note() {
  local files
  files=$(git diff --name-only --diff-filter=U | sed 's/^/- /')
  if [[ -z "$files" ]]; then
    MERGE_NOTE=$(printf 'Before anything else: the bot is merging origin/main into your branch.%s Every file merged cleanly except db.d.ts, which is generated: the bot took origin/main'"'"'s version and staged it, but could not migrate your database and regenerate it (see %s). db.d.ts conflicts: do not edit it by hand. Instead %s, and commit the merge (git commit --no-edit). If db:migrate fails, read why: if it is the order of migrations (yours and main'"'"'s), end with a "blocked" outcome naming the error. Then continue.' \
      "$1" "$WT/.vha/merge-main.log" "$DB_TYPES_STEPS")
    return
  fi
  MERGE_NOTE=$(printf 'Before anything else: the bot is merging origin/main into your branch.%s Every file that merged cleanly is in place; these conflict:\n\n%s\n\nResolve them and commit the merge (git commit --no-edit). Do not run git merge again. Then continue.' \
    "$1" "$files")
  if [[ "$MERGE_DB_TYPES" == pending ]] || grep -qx -- '- db.d.ts' <<<"$files"; then
    MERGE_NOTE+=$(printf '\n\ndb.d.ts conflicts too, but it is generated: do not merge it by hand. Resolve the files above, then, before you commit the merge, %s (if the bot already took origin/main'"'"'s version of it, it is staged and not in the list above). If db:migrate fails because of the order of migrations, end with a "blocked" outcome naming the error.' \
      "$DB_TYPES_STEPS")
  fi
}
merge_main_for_worker() {
  local log="$WT/.vha/merge-main.log" committed=0 merged=0 wip="" last
  if merge_in_progress "$WT"; then conflicts_note ""; return; fi
  git fetch -q origin > "$log" 2>&1 || true
  if git merge-base --is-ancestor origin/main HEAD; then return; fi
  commit_work_in_progress "$WT" >> "$log" 2>&1 || committed=$?
  if (( committed == 2 )); then
    MERGE_NOTE="Before anything else: origin/main has moved, and the bot could not commit your uncommitted work to merge it (see $log). Commit your work, merge origin/main and resolve any conflicts, then continue."
    return
  fi
  if (( committed == 0 )); then wip=' It committed your uncommitted work first, as a "wip:" commit.'; fi
  branch_merge_main "$WT" keep >> "$log" 2>&1 || merged=$?
  last=$(grep -v '^$' "$log" | tail -1 || true)
  if (( merged == 0 )); then
    MERGE_NOTE="The bot merged origin/main into your branch.$wip"
    if [[ "$MERGE_DB_TYPES" == regenerated ]]; then
      MERGE_NOTE+=" db.d.ts conflicted: it took origin/main's version, ran db:migrate latest on your card's databases and regenerated db.d.ts from them."
    elif (( MERGE_MIGRATED )); then
      MERGE_NOTE+=" main brought migrations, which it ran on your card's databases (deno task local db:migrate latest)."
    fi
    MERGE_NOTE+=" Check that what you were doing still fits main as it is now, then continue."
  elif merge_in_progress "$WT"; then
    conflicts_note "$wip"
  elif git merge-base --is-ancestor origin/main HEAD; then
    MERGE_NOTE="Before anything else: the bot merged origin/main into your branch, but a step after the merge failed ($last; see $log).$wip The step is migrating your card's databases (deno task local db:migrate latest) or refreshing packages (deno install --allow-scripts): see why it failed and do it yourself, then continue."
  else
    MERGE_NOTE="Before anything else: the bot could not merge origin/main into your branch ($last; see $log).$wip Merge origin/main and resolve any conflicts, then continue."
  fi
}
if [[ "$(jq -r .mergeMainDelivered <<<"$info")" == true ]]; then merge_main_for_worker; fi

if ! merge_in_progress "$WT" && ! deps_refresh "$WT"; then
  report worker.failed "$card" --arg why crashed --arg detail "deno install failed in the worktree"
  exit 0
fi

mkdir -p .vha/sessions .vha/outcomes .vha/hooks
n=$(( $(find .vha/sessions -name '*.jsonl' | wc -l) + 1 ))
: > ".vha/sessions/$n.jsonl"
hooks="$WT/.vha/hooks/$n.jsonl" exit_file="$WT/.vha/hooks/$n.exit" prompt_file="$WT/.vha/hooks/$n.prompt"
settings="$WT/.vha/hooks/settings.json"
: > "$hooks"
rm -f "$exit_file"
: > "$prompt_file"
if [[ -n "$MERGE_NOTE" ]]; then printf '%s\n\n' "$MERGE_NOTE" >> "$prompt_file"; fi
if [[ -z "$session" ]]; then
  start_prompt "$card" "$WT" >> "$prompt_file"
  session_args=(--session-id "$(uuidgen | tr '[:upper:]' '[:lower:]')")
else
  bot_state resume "$card" >> "$prompt_file"
  session_args=(--resume "$session")
fi
# An outcome written between turns — in a talk window, or by a turn cut off before the bot read it —
# is kept: the turn opens on it, and ends at once if it still stands.
if [[ -e .vha/outcome.json ]]; then
  printf '\n.vha/outcome.json is already there (kind: %s), written before this turn began. If it still stands after what this prompt says, stop now without rewriting it and the bot acts on it; otherwise replace it.\n' \
    "$(jq -r '.kind // "unreadable"' .vha/outcome.json 2>/dev/null || echo unreadable)" >> "$prompt_file"
fi

# The settings Claude is given with --settings (docs/bot.md#security): the sandbox and permission rules
# (host/sandbox-settings.sh, so a laptop that has no managed settings is sandboxed all the same), and
# a hook for each event, which writes it to the turn's hook log (bot/lib/turn-hook.sh): Claude busy,
# idle or gone. A failed render ends the turn as a crash: a worker never starts unsandboxed.
sandbox_settings=$(bash "$BOT_CODE/host/sandbox-settings.sh" "$WT")
# Nothing of the machine's own Claude Code setup reaches the worker: not the user's settings, hooks and
# plugins, and not their MCP servers (a laptop's may include Notion with write access).
worker_isolation=(--setting-sources 'project,local' --strict-mcp-config)
jq -n --argjson sandbox "$sandbox_settings" --arg hook "$BOT_CODE/bot/lib/turn-hook.sh" --arg log "$hooks" '
  def on($event): [{hooks: [{type: "command", command: "bash \($hook | @sh) \($event) \($log | @sh)"}]}];
  $sandbox + {hooks: (["UserPromptSubmit", "Stop", "StopFailure", "SessionEnd"] | map({key: ., value: on(.)}) | from_entries)}' > "$settings"

# Where the transcript of a resumed session already is, so card.log and sessions/<n>.jsonl take only
# this turn's part of it. Claude names it in its first hook; if that is elsewhere, the turn's part
# can't be told from the rest, so all of it is taken.
expected=$(cat .vha/transcript 2>/dev/null || printf '%s/.claude/projects/%s/%s.jsonl' "$HOME" "${WT//[^A-Za-z0-9]/-}" "$session")
offset=0
if [[ -n "$session" && -f "$expected" ]]; then offset=$(wc -c < "$expected" | tr -d ' '); fi
transcript=""

follow_session() {
  tail -c +$((offset + 1)) -F "$transcript" 2>/dev/null | jq -R --unbuffered -r -f "$BOT_CODE/bot/lib/session.jq" |
    card_log "$WT" "worker#$n"
}

# Once Claude's first hook names its session and transcript: the session recorded, card.log followed.
learn_session() {
  local first announced
  [[ -z "$transcript" && -s "$hooks" ]] || return 0
  first=$(head -n 1 "$hooks")
  announced=$(jq -r '.payload.session_id // empty' <<<"$first")
  transcript=$(jq -r '.payload.transcript_path // empty' <<<"$first")
  if [[ -n "$announced" && "$announced" != "$session" ]]; then
    emit worker.session "$card" --arg session "$announced"
    session=$announced
  fi
  [[ -n "$transcript" ]] || return 0
  printf '%s\n' "$transcript" > .vha/transcript
  if [[ "$transcript" != "$expected" ]]; then offset=0; fi
  spawn "" follow_session
  FOLLOW_PID=$SPAWNED
}

# What Claude is doing, from the last hook: busy, idle, waiting (stopped with background tasks still
# running, which wake it again), ended, or nothing yet.
claude_state() {
  tail -n 1 "$hooks" | jq -r '
    def tasks: (.payload.background_tasks // []) | if type == "array" then length elif type == "number" then . else 0 end;
    if .event == "Stop" then (if tasks > 0 then "waiting" else "idle" end)
    elif .event == "StopFailure" then "idle"
    elif .event == "SessionEnd" then "ended"
    else "busy" end'
}

# The transcript's last message is somebody pressing Esc in the window, which fires no Stop.
interrupted() {
  [[ -n "$transcript" && -s "$transcript" ]] || return 1
  tail -n 5 "$transcript" | jq -R -s -e '
    [split("\n")[] | fromjson? | select(.type == "user" or .type == "assistant")] | last
    | .type == "user" and (.message.content | tostring | contains("[Request interrupted by user"))' >/dev/null
}

# The turn is over once Claude is idle and nobody has looked at its window for a moment.
turn_over() {
  case "$(claude_state)" in
    idle | ended) return 0 ;;
    waiting) [[ .vha/outcome.json -nt "$prompt_file" ]] ;;
    busy) interrupted ;;
    *) return 1 ;;
  esac
}

trap 'stop_all; exit 143' TERM INT

window=$(window_name_for "$WT")
CLAUDE_WINDOW=$(tmux_open "$window" "$WT" "${TMUX_ENV[@]}" \
  bash -c 'prompt=$1 system=$2 exit_file=$3; shift 3; claude "$@" --append-system-prompt "$(cat "$system")" "$(cat "$prompt")"; echo $? > "$exit_file"' \
  _ "$prompt_file" "$BOT_CODE/bot/WORKER.md" "$exit_file" \
  "${session_args[@]}" --permission-mode "$BOT_PERMISSION_MODE" --settings "$settings" "${worker_isolation[@]}")
printf '%s\n' "$CLAUDE_WINDOW" > .vha/worker.window
printf 'turn %s started; to watch or talk to it: %s\n' "$n" "$(tmux_attach_hint "$window")" | card_log "$WT" worker

# Only time nobody is watching counts toward the cap; whoever is attached holds the turn open.
waited=0 unwatched=$BOT_DETACH_GRACE_SECONDS overran=0 unstarted="" closed=0
while :; do
  if ! tmux_alive "$CLAUDE_WINDOW"; then closed=1; break; fi
  learn_session
  if tmux_watched "$CLAUDE_WINDOW"; then
    unwatched=0
  else
    if (( unwatched >= BOT_DETACH_GRACE_SECONDS )) && [[ -s "$hooks" ]] && turn_over; then break; fi
    if [[ ! -s "$hooks" ]] && (( waited >= BOT_START_SECONDS )); then unstarted=$(tmux_screen "$CLAUDE_WINDOW"); break; fi
    if (( waited >= BOT_SESSION_CAP_SECONDS )); then overran=1; break; fi
    waited=$((waited + 1)) unwatched=$((unwatched + 1))
  fi
  sleep 1
done
learn_session
code=$(cat "$exit_file" 2>/dev/null || true)
stop_all
trap - TERM INT
if [[ -n "$transcript" ]]; then tail -c +$((offset + 1)) "$transcript" > ".vha/sessions/$n.jsonl"; fi
printf 'turn %s ended\n' "$n" | card_log "$WT" worker

# Closed from outside — somebody shut the window — so no result: the supervisor resumes the card.
if (( closed )) && [[ -z "$code" ]]; then exit 0; fi
if [[ -n "$unstarted" ]]; then
  report worker.failed "$card" --arg why crashed --arg detail "claude did not start within ${BOT_START_SECONDS}s; its window showed: $unstarted"
  exit 0
fi

# A turn that ended on an API error saying "limit" is a usage limit.
limit=$(jq -R -r -s '[split("\n")[] | fromjson? | select(.type == "user" or .type == "assistant")] | last
  | select(.isApiErrorMessage == true) | .message.content | if type == "array" then map(.text // "") | join(" ") else tostring end' \
  ".vha/sessions/$n.jsonl")
if [[ -z "$limit" && "$(claude_state)" == idle ]]; then
  limit=$(tail -n 1 "$hooks" | jq -r 'select(.event == "StopFailure") | .payload | tostring')
fi
if [[ "$limit" =~ [Ll]imit ]]; then
  report worker.usage_limited "$card" --arg until "$(iso_of "$(usage_reset_epoch "$limit")")"
  exit 0
fi
if (( overran )); then
  report worker.failed "$card" --arg why overran --arg detail "stopped after ${BOT_SESSION_CAP_SECONDS}s"
  exit 0
fi
code=${code:-0}
if checked=$(bot_state check-outcome .vha/outcome.json "$WT"); then
  mv .vha/outcome.json ".vha/outcomes/$n.json"
  if [[ "$checked" == "done" ]]; then
    verify_done "$WT/.vha/outcomes/$n.json"
  else
    report worker.outcome "$card" --arg kind "$checked" --arg file "$WT/.vha/outcomes/$n.json"
  fi
elif [[ ! -e .vha/outcome.json ]]; then
  why=no_outcome
  if (( code != 0 )); then why=crashed; checked="claude exited $code without writing .vha/outcome.json"; fi
  report worker.failed "$card" --arg why "$why" --arg detail "$checked"
else
  mv .vha/outcome.json ".vha/outcomes/$n.rejected.json"
  report worker.failed "$card" --arg why bad_outcome --arg detail "$checked"
fi
