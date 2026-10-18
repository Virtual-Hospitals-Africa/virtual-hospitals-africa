# Shared by bot/test/*.bats: `load helpers`.

# `run ! cmd` is the reliable negative assertion: a bare `! cmd` only fails a test on its last line.
bats_require_minimum_version 1.5.0

repo_root() { cd "$BATS_TEST_DIRNAME" && git rev-parse --show-toplevel; }

# use_bot_dir: a fresh .bot for the test, with the bot's helpers loaded against it.
use_bot_dir() {
  export BOT_DIR="$BATS_TEST_TMPDIR/.bot" BOT_WORKTREES="$BATS_TEST_TMPDIR/worktrees"
  mkdir -p "$BOT_DIR" "$BOT_WORKTREES"
  # shellcheck source=bot/lib/bot.sh
  source "$(repo_root)/bot/lib/bot.sh"
}

# stub <name> <bash body>: an executable named <name> first on PATH; each call is logged to $STUB_LOG.
stub() {
  local dir="$BATS_TEST_TMPDIR/stubs"
  mkdir -p "$dir"
  export STUB_LOG="$BATS_TEST_TMPDIR/stub.log"
  printf '#!/usr/bin/env bash\necho "%s $*" >> "%s"\n%s\n' "$1" "$STUB_LOG" "$2" > "$dir/$1"
  chmod +x "$dir/$1"
  case ":$PATH:" in *":$dir:"*) ;; *) export PATH="$dir:$PATH" ;; esac
  # What bot.sh gave the isolated environment was the PATH before the stub: give it this one.
  if declare -p ISOLATED_ENV >/dev/null 2>&1; then
    local i
    for i in "${!ISOLATED_ENV[@]}"; do
      if [[ "${ISOLATED_ENV[i]}" == PATH=* ]]; then ISOLATED_ENV[i]="PATH=$PATH"; fi
    done
  fi
}

CARD_A=3ec91359-c53b-80cf-83a5-e88a6c4e37f0
CARD_B=3ec91359-c53b-805e-845a-c9aabc496ab6
CARD_C=3ea91359-c53b-8025-aa2c-c73113c5e58f

# stub_postgres: a Postgres that is up, whose databases are the lines of $PG_DBS, with a fresh dump
# (BOT_DB_DUMP) and stubs of the tools that restore and migrate it. Every call is logged to $STUB_LOG.
stub_postgres() {
  local dir="$BATS_TEST_TMPDIR/stubs"
  export PG_DBS="$BATS_TEST_TMPDIR/pg_databases" BOT_DB_DUMP="$BATS_TEST_TMPDIR/latest.dump"
  : > "$PG_DBS"
  echo dump > "$BOT_DB_DUMP"
  stub pg_restore 'exit 0'
  stub deno 'exit 0'
  stub psql 'true'
  cat > "$dir/psql" <<'SH'
#!/usr/bin/env bash
echo "psql ${*: -1}" >> "$STUB_LOG"
sql="${*: -1}"
case "$sql" in
  "select 1") echo 1 ;;
  "select 1 from pg_database where datname = "*)
    name="${sql##*= }"
    name="${name//\'/}"
    if grep -qx "$name" "$PG_DBS"; then echo 1; fi
    ;;
  "create database "*)
    name="${sql#create database \"}"
    echo "${name%%\"*}" >> "$PG_DBS"
    ;;
  "drop database if exists "*)
    name="${sql#drop database if exists \"}"
    name="${name%%\"*}"
    grep -vx "$name" "$PG_DBS" > "$PG_DBS.new" || true
    mv "$PG_DBS.new" "$PG_DBS"
    ;;
  "select datname from pg_database"*) grep -E '^vha_(dev|test)_bot_[0-9a-f]{8}$' "$PG_DBS" || true ;;
esac
SH
  chmod +x "$dir/psql"
}

# git_world: a bare origin with a commit on main, and $CHECKOUT, a clone of it, as the bot's checkout.
# It carries the .env.docker the card databases' URL comes from, and a stub Postgres (stub_postgres).
git_world() {
  local origin="$BATS_TEST_TMPDIR/origin.git"
  CHECKOUT="$BATS_TEST_TMPDIR/checkout"
  git init -q --bare -b main "$origin"
  git clone -q "$origin" "$CHECKOUT" 2>/dev/null
  printf 'DATABASE_URL=postgres://vha_superadmin:local_docker_pw@localhost:5432/vha_dev\nUSE_DOCKER_QUICKSTART=true' > "$CHECKOUT/.env.docker"
  printf '.env*\n!.env.docker\nnode_modules\n.vha/\nlogs\ndb/dumps/latest\n' > "$CHECKOUT/.gitignore"
  git -C "$CHECKOUT" add .env.docker .gitignore
  git -C "$CHECKOUT" -c user.email=t@t -c user.name=t commit -q -m init
  git -C "$CHECKOUT" push -q origin main
  export CHECKOUT
  stub_postgres
}

# admit <card> [title]: the card in the log, as the reader would put it there.
admit() {
  emit card.admitted "$1" --arg title "${2:-Fix $1}" --argjson priority null --arg created 2026-10-01T00:00:00.000Z
}

# with_worktree <card> <path>: the card has a worktree at <path> (made, with a .vha).
with_worktree() {
  mkdir -p "$2/.vha"
  emit worktree.created "$1" --arg path "$2" --arg branch "$(basename "$2")" --argjson portIndex 1
  # With a stub Postgres (stub_postgres), the card's databases are there, as they are for a worktree the bot made.
  if [[ -n "${PG_DBS:-}" ]]; then printf '%s\n' "$(card_db_dev "$1")" "$(card_db_test "$1")" >> "$PG_DBS"; fi
}

# events_of <type>: how many events of that type the log holds.
events_of() { jq -s --arg t "$1" '[.[] | select(.type == $t)] | length' "$BOT_DIR/events.jsonl"; }

# has_event <type>: whether the log holds one of that type yet.
has_event() { (( $(events_of "$1" 2>/dev/null || echo 0) > 0 )); }

# wait_for <seconds> <command…>: polls until the command succeeds; fails after the timeout.
wait_for() {
  local timeout="$1" waited=0
  shift
  until "$@"; do
    (( waited < timeout * 10 )) || return 1
    sleep 0.1
    waited=$((waited + 1))
  done
}
