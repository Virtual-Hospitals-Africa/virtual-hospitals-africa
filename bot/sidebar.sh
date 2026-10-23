#!/usr/bin/env bash
# The bot's sidebar (docs/bot.md#the-sidebar), the tmux half of bot/sidebar.ts:
#   bot/sidebar.sh place <window>                  the sidebar into that window (the session's hooks)
#   bot/sidebar.sh show <kind> <card> <worktree>   you, at what is running on a card (worker, test or
#                                                  log), or talking to its worker's session (talk)
#   bot/sidebar.sh follow-test <worktree>          its test's output as the run writes it
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/tmux.sh
source "$BOT_CODE/bot/lib/tmux.sh"

usage() { sed -n 3,6p "$0" >&2; exit 1; }

# focus <window>: you, at that window, typing to its own pane rather than the sidebar you clicked.
focus() {
  bot_tmux select-window -t "$1"
  bot_tmux select-pane -t "$(tmux_main_pane "$1")"
}

# show_window <name> <dir> <command…>: the window of that name running the command afresh, then you
# at it.
show_window() {
  local name="$1" dir="$2" window pane
  shift 2
  if window=$(tmux_window_named "$name") && pane=$(tmux_main_pane "$window"); then
    bot_tmux respawn-pane -k -t "$pane" -c "$dir" "$@"
  else
    if [[ -n "$window" ]]; then tmux_close "$window"; fi
    window=$(tmux_open "$name" "$dir" "$@")
  fi
  focus "$window"
}

# talk <card> <worktree>: you, talking to the card's worker session in its worktree — the talk already
# open if there is one. Its window is .vha/talk.window, so the bot starts no turn on the card while
# you talk (bot/claude-worker-supervisor.sh); what you say joins the session it resumes after.
talk() {
  local card="$1" worktree="$2" window session
  if window=$(cat "$worktree/.vha/talk.window" 2>/dev/null) && tmux_alive "$window"; then
    focus "$window"
    return
  fi
  session=$(bot_state card "$card" | jq -r '.session // empty')
  if [[ -z "$session" ]]; then
    echo "it has no worker session yet" >&2
    exit 1
  fi
  window=$(tmux_open "talk-$(window_name_for "$worktree")" "$worktree" "${TMUX_ENV[@]}" claude --resume "$session")
  printf '%s\n' "$window" > "$worktree/.vha/talk.window"
  focus "$window"
}

show() {
  local kind="$1" card="$2" worktree="$3" window name
  # A worker the bot started since the sidebar last looked is the one to see.
  if [[ "$kind" == worker || "$kind" == talk ]] && window=$(live_window "$worktree"); then
    focus "$window"
    return
  fi
  name=$(window_name_for "$worktree")
  case "$kind" in
    talk) talk "$card" "$worktree" ;;
    test) show_window "test-$name" "$worktree" "${TMUX_ENV[@]}" "$BASH" "$BOT_CODE/bot/sidebar.sh" follow-test "$worktree" ;;
    # A worker whose turn has just ended, or whose window is not up yet.
    log | worker) show_window "log-$name" "$worktree" "${TMUX_ENV[@]}" "$BASH" "$BOT_CODE/bot/watch.sh" "$card" ;;
    *) usage ;;
  esac
}

# A test's run directory is .vha/runs/current from the moment bot/tester.sh makes it.
follow_test() {
  local worktree="$1" runs="$1/.vha/runs"
  if [[ ! -L "$runs/current" ]]; then
    echo "Waiting for the test to make its run directory…"
    until [[ -L "$runs/current" ]]; do sleep 1; done
  fi
  cd "$runs/$(readlink "$runs/current")"
  printf '%s\n' "$PWD"
  exec tail -n +1 -F build.log servers.log command.log 2>/dev/null
}

case "${1:-}" in
  place)
    [[ $# -eq 2 ]] || usage
    sidebar_place "$2"
    ;;
  show)
    [[ $# -eq 4 ]] || usage
    show "$2" "$3" "$4"
    ;;
  follow-test)
    [[ $# -eq 2 ]] || usage
    follow_test "$2"
    ;;
  *) usage ;;
esac
