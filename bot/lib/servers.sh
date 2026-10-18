# shellcheck shell=bash
# shellcheck disable=SC2016,SC2013 # bash -c scripts name their $arguments in single quotes
# bot/lib/servers.sh — the servers a web test (test/web) runs against, on a card's own ports
# (docs/bot.md#a-test): the HTTP server, the HTTPS proxy and the events processor, started by the
# repo's own scripts/test/run_servers.sh and waited on until they answer. Source after bot.sh.
#
# Pre-starting them is the point: `deno task test` starts them itself only to wait 25 s for the health
# check, and a cold vite start takes longer; given servers already on both ports it reuses them.
# CI=true makes run_servers.sh write its logs to ./logs in the worktree instead of /tmp, where every
# card, and the human, would share one file.

SERVERS_READY_SECONDS="${SERVERS_READY_SECONDS:-300}"

# stack_pids <worktree>: the pid of every deno or node process whose working directory is in the
# worktree — what a test's servers leave behind when their parent is killed.
stack_pids() {
  local wt pid cmd
  wt=$(cd "$1" 2>/dev/null && pwd -P) || return 0
  lsof -nP -a -d cwd -Fpn 2>/dev/null | awk -v wt="$wt" '
    /^p/ { pid = substr($0, 2) }
    /^n/ { dir = substr($0, 2); if (dir == wt || index(dir, wt "/") == 1) print pid }' | sort -u |
    while read -r pid; do
      cmd=$(ps -o comm= -p "$pid" 2>/dev/null || true)
      case "${cmd##*/}" in deno | node | vite) echo "$pid" ;; esac
    done
}

# stack_kill <worktree>: the servers of the card's worktree stopped — its events processor included, so
# no processor runs on code that has since changed — and whatever still listens on its two ports.
stack_kill() {
  local wt="$1" pid port
  [[ -d "$wt" ]] || return 0
  for pid in $(stack_pids "$wt"); do kill -TERM "$pid" 2>/dev/null || true; done
  sleep 1
  for pid in $(stack_pids "$wt"); do kill -KILL "$pid" 2>/dev/null || true; done
  if [[ -f "$wt/.vha/ports.env" ]]; then
    for port in $(sed -n 's/^export \(HTTP_SERVER_PORT\|HTTPS_PROXY_SERVER_PORT\)=//p' "$wt/.vha/ports.env"); do
      for pid in $(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true); do kill -KILL "$pid" 2>/dev/null || true; done
    done
  fi
}

# servers_start <worktree> <build: 0|1> <log>: run_servers.sh started in the worktree (its group is
# SPAWNED), then waited on until the proxy's /health-check says 200. With build=1 the app is built
# first (`deno task build`) and served from the build (--use-build). Fails, with the servers stopped,
# if one exits or they are not healthy within SERVERS_READY_SECONDS.
servers_start() {
  local wt="$1" build="$2" log="$3" port waited=0 code
  port=$(sed -n 's/^export HTTPS_PROXY_SERVER_PORT=//p' "$wt/.vha/ports.env")
  stack_kill "$wt"
  if [[ "$build" == 1 ]]; then
    echo "building the app (deno task build)" >> "$log"
    (cd "$wt" && env -i "${ISOLATED_ENV[@]}" deno task build) >> "$log" 2>&1 || { echo "deno task build failed" >> "$log"; return 1; }
  fi
  mkdir -p "$wt/logs/slow_queries"
  spawn "" env -i "${ISOLATED_ENV[@]}" CI=true bash -c \
    'cd "$1" && source .vha/ports.env && exec bash scripts/test/run_servers.sh ${2:+--use-build}' \
    _ "$wt" "$([[ "$build" == 1 ]] && echo yes || true)" >> "$log" 2>&1
  while :; do
    code=$(curl -ksS --max-time 5 -o /dev/null -w '%{http_code}' "https://localhost:$port/health-check" 2>/dev/null || true)
    if [[ "$code" == 200 ]]; then
      echo "the servers answered /health-check after ${waited}s" >> "$log"
      return 0
    fi
    if ! kill -0 "$SPAWNED" 2>/dev/null; then
      echo "the servers exited before they were healthy" >> "$log"
      stack_kill "$wt"
      return 1
    fi
    if (( waited >= SERVERS_READY_SECONDS )); then
      echo "the servers were not healthy after ${SERVERS_READY_SECONDS}s (last health-check status: ${code:-none})" >> "$log"
      stop_group "$SPAWNED" 5
      stack_kill "$wt"
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
}

# servers_stop <worktree> <pid>: the servers started in that group stopped, and everything of the
# worktree's that was left.
servers_stop() {
  stop_group "$2" 10
  stack_kill "$1"
}
