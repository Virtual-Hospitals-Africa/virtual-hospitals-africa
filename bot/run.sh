#!/usr/bin/env bash
# Starts or stops the bot, whose orchestrator runs in the bot window of its tmux session
# (docs/bot.md#running):
#   deno task bot:start    (re)start the orchestrator there, and the sidebar, every card's branch first
#                        brought up to origin/main; deno task bot:attach to watch it
#   deno task bot:stop     stop it: every worker and test is stopped and recorded as interrupted, every
#                        card's servers stopped, and the sidebar closed
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"
# shellcheck source=bot/lib/worktree.sh
source "$BOT_CODE/bot/lib/worktree.sh"
# shellcheck source=bot/lib/servers.sh
source "$BOT_CODE/bot/lib/servers.sh"

# The orchestrator is given BOT_STOP_SECONDS to stop its workers and tests, then killed with
# everything under it.
stop_orchestrator() {
  local pid waited=0
  pid=$(orchestrator_pid) || return 0
  echo "Stopping the bot; its workers and tests are recorded as interrupted…"
  kill -TERM "$pid" 2>/dev/null || true
  while kill -0 "$pid" 2>/dev/null && (( waited < BOT_STOP_SECONDS )); do
    sleep 1
    waited=$((waited + 1))
  done
  if kill -0 "$pid" 2>/dev/null; then
    echo "It was still running after ${BOT_STOP_SECONDS}s; killed it"
    kill -KILL -- "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
  fi
}

# While nothing of the bot's runs in them, every card's worktree is brought up to origin/main, so a
# resumed worker builds on main as it is now. One you are talking to in its talk window is passed
# over, and one that won't merge — or is in the middle of a merge — is left as it was; either way
# its worker's next turn merges it first (bot/claude-worker.sh).
merge_main_into_worktrees() {
  local wt code
  while IFS= read -r wt; do
    [[ -d "$wt/.vha" ]] || continue
    if talk_open "$wt"; then
      echo "! ${wt##*/}: you are talking to its worker session; merged before its worker's next turn"
      emit worktree.unmerged "$(jq -r .id "$wt/.vha/card.json")" --arg why talking
      continue
    fi
    if merge_in_progress "$wt"; then
      echo "! ${wt##*/}: its worker is in the middle of a merge; left for its next turn"
      emit worktree.unmerged "$(jq -r .id "$wt/.vha/card.json")" --arg why would-not-merge
      continue
    fi
    code=0
    branch_merge_main "$wt" 2>&1 | card_log "$wt" start || code=$?
    case "$code" in
      0) ;;
      3)
        echo "! ${wt##*/}: origin/main won't merge (a conflict, or uncommitted changes in the way); merged before its worker's next turn"
        emit worktree.unmerged "$(jq -r .id "$wt/.vha/card.json")" --arg why would-not-merge
        ;;
      *) echo "! ${wt##*/}: bringing it up to origin/main failed (see $wt/.vha/card.log)" ;;
    esac
  done < <(card_worktrees)
}

# card_worktrees: the path of every card's worktree, one a line. Git names them by their real path,
# so the directory is looked for by its real path too (macOS's /var is /private/var).
card_worktrees() {
  local dir
  dir=$(cd "$BOT_WORKTREES" 2>/dev/null && pwd -P) || return 0
  git -C "$BOT_CHECKOUT" worktree list --porcelain |
    awk -v dir="$dir/" 'index($0, "worktree " dir) == 1 { print substr($0, 10) }'
}

# Once nothing of the bot's runs, no server a test or check started is left holding a card's ports
# or running its events processor on code that has since changed.
stop_stacks() {
  local wt
  while IFS= read -r wt; do
    stack_kill "$wt"
  done < <(card_worktrees)
}

case "${1:-}" in
  start)
    mkdir -p "$BOT_DIR"
    tmux_ensure
    tmux_restore
    stop_orchestrator
    stop_stacks
    echo "Bringing every card's worktree up to origin/main…"
    merge_main_into_worktrees
    run_orchestrator
    sidebar_restart
    sleep 1
    if ! orchestrator_pid >/dev/null; then
      echo "✘ the orchestrator exited at once; deno task bot:attach shows why" >&2
      exit 1
    fi
    echo "✔ bot started from $BOT_CODE ($(git -C "$BOT_CODE" rev-parse --short HEAD)); watch it: deno task bot:attach"
    ;;
  stop)
    stop_orchestrator
    stop_stacks
    sidebar_stop
    echo "✔ bot stopped"
    ;;
  *)
    sed -n 4,6p "$0" >&2
    exit 1
    ;;
esac
