# shellcheck shell=bash
# bot/lib/proc.sh — process identity that survives pid reuse. Source it.
#
# A token is "<pid> <start time>": after a reboot, or once a pid is recycled, an unrelated process can
# hold the same pid, but not the same start time.

# proc_token <pid>: prints the process's token, or fails if it is not running.
proc_token() {
  local start
  start=$(ps -o lstart= -p "$1" 2>/dev/null) || return 1
  [[ -n "$start" ]] || return 1
  printf '%s %s\n' "$1" "$(tr -s ' ' <<<"$start")"
}

# proc_alive <token>: whether that very process is still running. A bare pid (no start time) falls
# back to whether the pid is running at all.
proc_alive() {
  local pid="${1%% *}"
  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  if [[ "$1" == "$pid" ]]; then
    kill -0 "$pid" 2>/dev/null
  else
    [[ "$(proc_token "$pid" 2>/dev/null)" == "$1" ]]
  fi
}

# proc_tree <pid>: the process and all its descendants, parents first — whatever process group each
# is in.
proc_tree() {
  local child
  echo "$1"
  for child in $(pgrep -P "$1" || true); do proc_tree "$child"; done
}
