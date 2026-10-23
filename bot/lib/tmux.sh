# shellcheck shell=bash
# shellcheck disable=SC2016 # a bash -c script names its $arguments in single quotes
# bot/lib/tmux.sh — the bot's tmux server: one session, where the bot's own processes and every
# worker turn each have a window, so you can attach and watch, type to a worker or stop it
# (docs/bot.md#watching-a-worker). Source it after bot.sh.

BOT_TMUX_SESSION=vhabot

bot_tmux() { tmux -L "$BOT_TMUX_SOCKET" "$@"; }

# tmux_attach_hint [window]: the command that attaches you to the bot's session, at that window.
tmux_attach_hint() { printf 'tmux -L %s attach -t %s%s\n' "$BOT_TMUX_SOCKET" "$BOT_TMUX_SESSION" "${1:+:$1}"; }

# Every window's command starts in the isolated environment, whoever made the session (you, from
# bot:attach, or a worker), so no token reaches it.
TMUX_ENV=(env -i "${ISOLATED_ENV[@]}" TERM=tmux-256color)
# The session's fixed windows: bot — bot:status kept fresh, over the orchestrator's pane — and
# events, the event log. Until bot:start runs the orchestrator in its pane, the pane follows its log.
STATUS_COMMAND=("${TMUX_ENV[@]}" bash "$BOT_CODE/bot/status.sh" --follow)
ORCHESTRATOR_LOG_COMMAND=("${TMUX_ENV[@]}" tail -n 200 -F "$BOT_DIR/orchestrator.log")
EVENTS_COMMAND=("${TMUX_ENV[@]}" bash "$BOT_CODE/bot/watch.sh")
# The orchestrator, in a fixed environment whatever shell ran bot:start (it reads bot.env itself),
# its output both on its pane and in .bot/orchestrator.log.
ORCHESTRATOR_COMMAND=(env -i "HOME=$HOME" "USER=${USER:-$(id -un)}" "LOGNAME=${LOGNAME:-${USER:-$(id -un)}}"
  "SHELL=${SHELL:-/bin/bash}" "TMPDIR=${TMPDIR:-/tmp}" LANG=en_US.UTF-8 TERM=tmux-256color "PATH=$BOT_PATH"
  "BOT_DIR=$BOT_DIR" bash -c 'exec bash "$0" > >(tee -a "$1") 2>&1'
  "${BOT_ORCHESTRATOR:-$BOT_CODE/bot/orchestrator.sh}" "$BOT_DIR/orchestrator.log")
# The sidebar (docs/bot.md#the-sidebar): one pane down the left of whichever window you are on,
# moved there by the session's hooks (bot/sidebar.sh place), started again wherever it is missing.
SIDEBAR_WIDTH="${BOT_SIDEBAR_WIDTH:-44}"
SIDEBAR_COMMAND=("${TMUX_ENV[@]}" "BOT_CODE=$BOT_CODE" "$BOT_TS" "$BOT_CODE/bot/sidebar.ts")

# tmux_ensure: the session with its fixed windows. When several workers start at once, only the one
# whose new-session wins adds the windows; the others find its session.
tmux_ensure() {
  local window
  if bot_tmux has-session -t "=$BOT_TMUX_SESSION" 2>/dev/null; then return 0; fi
  if ! window=$(bot_tmux new-session -d -P -F '#{window_id}' -s "$BOT_TMUX_SESSION" -n bot -x 220 -y 50 \
    "${STATUS_COMMAND[@]}" 2>/dev/null); then
    bot_tmux has-session -t "=$BOT_TMUX_SESSION"
    return
  fi
  add_orchestrator_pane "$window" >/dev/null
  bot_tmux new-window -d -t "=$BOT_TMUX_SESSION:" -n events "${EVENTS_COMMAND[@]}"
  sidebar_hooks
}

# tmux_restore: the fixed windows and the orchestrator's pane, made again if somebody closed one
# (from bot:attach and bot:start, which nothing races).
tmux_restore() {
  local window
  window=$(tmux_window_named bot) ||
    window=$(bot_tmux new-window -d -P -F '#{window_id}' -t "=$BOT_TMUX_SESSION:" -n bot "${STATUS_COMMAND[@]}")
  orchestrator_pane >/dev/null || add_orchestrator_pane "$window" >/dev/null
  tmux_window_named events >/dev/null || bot_tmux new-window -d -t "=$BOT_TMUX_SESSION:" -n events "${EVENTS_COMMAND[@]}"
  sidebar_hooks
}

# sidebar_hooks: the sidebar follows you to each window, and the cards' titles are links (OSC 8).
# The hook prints nothing and never fails: tmux would show either over the window you went to.
sidebar_hooks() {
  local place
  place=$(printf 'run-shell -b "%q %q place #{window_id} >/dev/null 2>&1 || true"' "$BASH" "$BOT_CODE/bot/sidebar.sh")
  bot_tmux set-hook -g session-window-changed "$place"
  bot_tmux set-hook -g client-attached "$place"
  if ! bot_tmux show-options -sv terminal-features | grep -q hyperlinks; then
    bot_tmux set-option -as terminal-features ',*:hyperlinks'
  fi
}

# kill_pane <pane>: the pane closed, if a racing hook has not closed it already.
kill_pane() { bot_tmux kill-pane -t "$1" 2>/dev/null || true; }

# sidebar_panes: the sidebar's pane ids, oldest first. Two hooks racing can briefly make two.
sidebar_panes() {
  bot_tmux list-panes -s -t "=$BOT_TMUX_SESSION" -F '#{pane_id}|#{@role}' 2>/dev/null |
    awk -F'|' '$2 == "sidebar" { print substr($1, 2) }' | sort -n | sed 's/^/%/'
}

# sidebar_place <window>: the sidebar down the left of that window, moved there or started there.
# Of two racing, the oldest pane is kept, whichever race this is.
sidebar_place() {
  local window="$1" pane extra
  pane=$(sidebar_panes | head -n 1)
  if [[ -z "$pane" ]]; then
    pane=$(bot_tmux split-window -d -f -h -b -l "$SIDEBAR_WIDTH" -P -F '#{pane_id}' -t "$window" "${SIDEBAR_COMMAND[@]}")
    bot_tmux set-option -p -t "$pane" @role sidebar
    pane=$(sidebar_panes | head -n 1)
  elif [[ "$(bot_tmux display -p -t "$pane" '#{window_id}')" != "$window" ]]; then
    bot_tmux join-pane -d -f -h -b -l "$SIDEBAR_WIDTH" -s "$pane" -t "$window"
  fi
  for extra in $(sidebar_panes | tail -n +2); do kill_pane "$extra"; done
}

# sidebar_stop: the sidebar closed, wherever it is (bot:stop).
sidebar_stop() {
  local pane
  for pane in $(sidebar_panes); do kill_pane "$pane"; done
}

# sidebar_restart: the sidebar started afresh, on its code as it is now, in the session's window
# (bot:start).
sidebar_restart() {
  sidebar_stop
  sidebar_place "$(bot_tmux display -p -t "=$BOT_TMUX_SESSION" '#{window_id}')"
}

# tmux_main_pane <window>: the pane the window is for, not the sidebar's.
tmux_main_pane() {
  bot_tmux list-panes -t "$1" -F '#{pane_id}|#{@role}' 2>/dev/null |
    awk -F'|' '$2 != "sidebar" { print $1; found = 1; exit } END { exit !found }'
}

# add_orchestrator_pane <window>: the orchestrator's pane, under bot:status; prints its id. It stays
# on screen after the orchestrator exits, to show why.
add_orchestrator_pane() {
  local pane
  pane=$(bot_tmux split-window -d -P -F '#{pane_id}' -v -l 40% -t "$1" "${ORCHESTRATOR_LOG_COMMAND[@]}")
  bot_tmux set-option -p -t "$pane" @role orchestrator ';' set-option -p -t "$pane" remain-on-exit on
  printf '%s\n' "$pane"
}

# tmux_window_named <name>: the id of the session's window of that name, if there is one.
tmux_window_named() {
  bot_tmux list-windows -t "=$BOT_TMUX_SESSION" -F '#{window_id}|#W' 2>/dev/null |
    awk -F'|' -v name="$1" '$2 == name { print $1; found = 1; exit } END { exit !found }'
}

# orchestrator_pane: the id of the orchestrator's pane, if there is one.
orchestrator_pane() {
  bot_tmux list-panes -s -t "=$BOT_TMUX_SESSION" -F '#{pane_id}|#{@role}' 2>/dev/null |
    awk -F'|' '$2 == "orchestrator" { print $1; found = 1; exit } END { exit !found }'
}

# orchestrator_pid: the orchestrator's pid, while bot:start's orchestrator is running.
orchestrator_pid() {
  bot_tmux list-panes -s -t "=$BOT_TMUX_SESSION" -F '#{@role}|#{@runs}|#{pane_dead}|#{pane_pid}' 2>/dev/null |
    awk -F'|' '$1 == "orchestrator" && $2 == "orchestrator" && $3 == 0 { print $4; found = 1; exit } END { exit !found }'
}

# run_orchestrator: the orchestrator started in its pane, in place of whatever the pane was showing.
run_orchestrator() {
  local pane
  pane=$(orchestrator_pane)
  bot_tmux set-option -p -t "$pane" @runs orchestrator
  bot_tmux respawn-pane -k -t "$pane" "${ORCHESTRATOR_COMMAND[@]}"
}

# tmux_open <name> <dir> <command…>: a new background window running the command; prints its id.
tmux_open() {
  local name="$1" dir="$2"
  shift 2
  tmux_ensure
  bot_tmux new-window -d -P -F '#{window_id}' -t "=$BOT_TMUX_SESSION:" -n "$name" -c "$dir" "$@"
}

# tmux_alive <window>: it is open and still running its command (a remain-on-exit in your own
# tmux.conf, which the bot's server reads too, would keep a finished one on screen). The sidebar
# does not count: a window it is in outlives the command it was opened for.
tmux_alive() {
  local pane
  pane=$(tmux_main_pane "$1") && [[ "$(bot_tmux display -p -t "$pane" '#{pane_dead}' 2>/dev/null)" == 0 ]]
}

# tmux_watched <window>: somebody attached is looking at it.
tmux_watched() { (( $(bot_tmux display -p -t "$1" '#{window_active_clients}' 2>/dev/null || echo 0) > 0 )); }

# tmux_screen <window>: its last non-blank lines, as one line.
tmux_screen() {
  { bot_tmux capture-pane -p -t "$(tmux_main_pane "$1")" 2>/dev/null || true; } | sed '/^[[:space:]]*$/d' | tail -5 | tr '\n' ' ' | cut -c1-400
}

tmux_close() { bot_tmux kill-window -t "$1" 2>/dev/null || true; }

# live_window <worktree>: the window its worker is running in, if one is.
live_window() {
  local window
  window=$(cat "$1/.vha/worker.window" 2>/dev/null) || return 1
  tmux_alive "$window" && printf '%s\n' "$window"
}

# talk_open <worktree>: a human is talking to its worker session in its talk window (bot/sidebar.sh).
talk_open() { [[ -s "$1/.vha/talk.window" ]] && tmux_alive "$(cat "$1/.vha/talk.window")"; }

# tmux_attach [window]: you, attached to the bot's session, at that window — from inside your own
# tmux too.
tmux_attach() {
  if [[ -n "${1:-}" ]]; then bot_tmux select-window -t "$1"; fi
  exec env -u TMUX tmux -L "$BOT_TMUX_SOCKET" attach -t "$BOT_TMUX_SESSION"
}

# tmux_close_recorded <file>: closes the window a file names, then removes the file.
tmux_close_recorded() {
  if [[ -s "$1" ]]; then tmux_close "$(cat "$1")"; fi
  rm -f "$1"
}

# window_name_for <worktree>: the card's branch without its prefix and most of its id —
# bot_fix_bus_stop_3ec91359… is fix_bus_stop-3ec9.
window_name_for() {
  local branch
  branch=$(basename "$1")
  branch="${branch#bot_}"
  if [[ "$branch" =~ ^(.*)_([0-9a-f]{4})[0-9a-f]{28}$ ]]; then
    printf '%s-%s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
  else
    printf '%s\n' "$branch"
  fi
}
