# shellcheck shell=bash
# bot/lib/bot.sh — the bot's paths, settings and the helpers every bot process uses (docs/bot.md).
# Source it first.

# Where the bot's code is; and the checkout its worktrees branch from, which is the same one (a test
# points it elsewhere).
BOT_CODE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BOT_CHECKOUT="${BOT_CHECKOUT:-$BOT_CODE}"
export BOT_DIR="${BOT_DIR:-$BOT_CHECKOUT/.bot}"
BOT_WORKTREES="${BOT_WORKTREES:-$(dirname "$BOT_CHECKOUT")/vha-bot-worktrees}"
# shellcheck source=bot/lib/proc.sh
source "$BOT_CODE/bot/lib/proc.sh"

# Read, never exported: each token is handed only to the one command that needs it (notion, gh), so
# no worker or test command can see it.
if [[ -f "$BOT_DIR/bot.env" ]]; then
  # shellcheck source=/dev/null
  source "$BOT_DIR/bot.env"
fi
# Claude workers at once. 2 because this runs on a laptop: each is a Claude session plus its own
# worktree, checks and servers.
BOT_WORKERS="${BOT_WORKERS:-2}"
# Web tests (test/web) are the heavy ones, so they share this many slots: each is a vite/proxy/events
# processor stack and a Postgres load. 1 until measured on the machine.
BOT_TESTERS="${BOT_TESTERS:-1}"
BOT_SESSION_CAP_SECONDS="${BOT_SESSION_CAP_SECONDS:-5400}"
# Higher than the 3 a `done` gets: a `run` is the worker exploring, and failing is how it learns.
BOT_MAX_FAILED_RUNS="${BOT_MAX_FAILED_RUNS:-5}"
BOT_PERMISSION_MODE="${BOT_PERMISSION_MODE:-auto}"
# The bot's tmux server (`tmux -L <socket>`), where the orchestrator and each worker turn run
# (docs/bot.md#watching-a-worker).
BOT_TMUX_SOCKET="${BOT_TMUX_SOCKET:-vhabot}"
# How long bot:stop waits for the orchestrator to stop its workers and tests before killing it.
BOT_STOP_SECONDS="${BOT_STOP_SECONDS:-120}"
# The PATH the orchestrator runs with, whatever shell started it: one a tool is only on from fnm or
# nvm would pass bot:setup and then fail mid-run as "command not found". libpq is where Homebrew
# keeps psql and pg_restore without linking them.
# shellcheck disable=SC2034 # read by lib/tmux.sh and setup.sh
BOT_PATH="${BOT_PATH:-$HOME/.deno/bin:/opt/homebrew/bin:/opt/homebrew/opt/libpq/bin:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin}"
# A turn whose Claude is done ends once nobody has looked at its window for this long.
BOT_DETACH_GRACE_SECONDS="${BOT_DETACH_GRACE_SECONDS:-10}"
# A worker whose Claude has not taken its prompt by then is stuck before it started (a dialog, a crash).
BOT_START_SECONDS="${BOT_START_SECONDS:-120}"
# The deno the bot's TypeScript runs on, found on the bot's PATH (not the caller's, where a test's
# `deno` stub for `deno task …` would shadow it); empty when there is none, which bot:setup reports.
BOT_DENO="${BOT_DENO:-$(PATH="$BOT_PATH" command -v deno || true)}"
export BOT_DENO
# What runs the bot's own TypeScript: `"$BOT_TS" <file.ts> [args…]` (lib/run-ts.sh: deno run, scoped
# permissions). A test points it at a stub.
BOT_TS="${BOT_TS:-$BOT_CODE/bot/lib/run-ts.sh}"
# How long a supervisor sleeps between looks at the event log.
BOT_POLL_SECONDS="${BOT_POLL_SECONDS:-5}"

bot_state() {
  BOT_DIR="$BOT_DIR" BOT_MAX_FAILED_RUNS="$BOT_MAX_FAILED_RUNS" "$BOT_TS" "$BOT_CODE/bot/state.ts" "$@"
}

# emit <type> <card> [--arg k v | --argjson k v]…: appends one event to the log.
emit() {
  local type="$1" card="$2"
  shift 2
  bot_state emit "$(jq -nc --arg type "$type" --arg card "$card" "$@" '$ARGS.named')"
}

# card_named <id, hex id, branch or Notion URL>: the card, as `bot_state card` prints it.
card_named() {
  local name="$1"
  if [[ "$name" == *notion* ]]; then name=$(grep -oE '[0-9a-f]{32}' <<<"$name" | tail -1) || return 1; fi
  bot_state card "$name"
}

# NOTION_DATA_SOURCE_ID empty means notion.ts's default: VHA's Tasks board.
notion() { NOTION_TOKEN="${NOTION_TOKEN:-}" NOTION_DATA_SOURCE_ID="${NOTION_DATA_SOURCE_ID:-}" "$BOT_TS" "$BOT_CODE/bot/notion.ts" "$@"; }

# log <message>: one line to stderr, which the orchestrator keeps in .bot/orchestrator.log.
log() { printf '%(%Y-%m-%dT%H:%M:%S)T %s %s\n' -1 "${LOG_SOURCE:-bot}" "$*" >&2; }

# card_log <worktree> <source>: stdin into the worktree's card.log, as `HH:MM:SS <source> │ <line>`.
card_log() {
  local file="$1/.vha/card.log" source="$2" line
  while IFS= read -r line || [[ -n "$line" ]]; do
    printf '%(%H:%M:%S)T %s │ %s\n' -1 "$source" "$line" >> "$file"
  done
}

# The environment a worker-controlled process starts with (`env -i "${ISOLATED_ENV[@]}" cmd`): an
# allowlist, so the bot's tokens never reach a worker or a test command. Always with a UTF-8 locale:
# a bare environment has none.
ISOLATED_ENV=("LANG=${LANG:-en_US.UTF-8}" "BOT_DIR=$BOT_DIR" "BOT_WORKTREES=$BOT_WORKTREES" "BOT_CHECKOUT=$BOT_CHECKOUT")
# The runner of the bot's own TypeScript (and the deno it uses) goes along, so a caller's override (a
# test's) reaches the bot's scripts that run in this environment too.
ISOLATED_ENV+=("BOT_TS=$BOT_TS" "BOT_DENO=$BOT_DENO")
for name in HOME USER LOGNAME PATH SHELL TMPDIR TERM; do
  if [[ -n "${!name:-}" ]]; then ISOLATED_ENV+=("$name=${!name}"); fi
done
unset name

# spawn <pid file|""> <command…>: runs the command in the background in its own process group, so
# stop_group ends it and everything under it. SPAWNED is its pid; the pid file gets its process
# token (scripts/lib/proc.sh), which a restarted supervisor uses to find it.
spawn() {
  local pid_file="$1"
  shift
  set -m
  "$@" &
  SPAWNED=$!
  set +m
  if [[ -n "$pid_file" ]]; then proc_token "$SPAWNED" > "$pid_file" 2>/dev/null || echo "$SPAWNED" > "$pid_file"; fi
}

# stop_group <pid> [grace seconds]: TERM to the process group, then KILL once the grace is up.
stop_group() {
  local pid="$1" grace="${2:-10}" waited=0
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null || return 0
  kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  while kill -0 "$pid" 2>/dev/null && (( waited < grace )); do
    sleep 1
    waited=$((waited + 1))
  done
  kill -KILL -- "-$pid" 2>/dev/null || true
}

# stop_recorded <pid file>: stops the process a pid file names, if that very process still runs.
stop_recorded() {
  local token
  token=$(cat "$1" 2>/dev/null || true)
  if [[ -n "$token" ]] && proc_alive "$token"; then stop_group "${token%% *}"; fi
  rm -f "$1"
}

# A card's ports and databases (docs/bot.md#a-cards-resources); `ports_load <worktree>` is also what a
# check or test run in a worktree sources to be on its own ports and database.
# shellcheck source=bot/lib/resources.sh
source "$BOT_CODE/bot/lib/resources.sh"
