# shellcheck shell=bash
# bot/lib/resources.sh — what each card owns on this machine (docs/bot.md#a-cards-resources): a pair
# of ports and two databases, a dev one and a test one. Source after bot.sh. Only the worker
# supervisor makes or drops a card's resources, one card at a time, so an index it picks cannot be
# picked twice.
#
#   ports   block i >= 1 is HTTP_SERVER_PORT = BOT_PORT_BASE + 2i, HTTPS_PROXY_SERVER_PORT = +1. The
#           base (21000) is clear of human worktrees (../vha-worktrees/port_counter, 8004 + 2n),
#           Postgres (5432), Redis (6379/6380), adminer (8888) and macOS's ephemeral range (49152+).
#   dbs     vha_dev_bot_<first 8 hex of the card id> and vha_test_bot_<same>. db/db.ts rewrites
#           vha_dev to vha_test under IS_TEST, so the card's worktree, whose DATABASE_URL names the
#           first, tests against the second. Derived from the card id, never from the branch, which
#           holds characters a database name cannot.
#   redis   nothing: no code writes to Redis today (external-clients/cache.ts is only used by
#           commented-out code), and the bot's databases are dropped with dropdb, never with
#           db:drop, which flushes the shared Redis. If a cache is ever switched on, give each card a
#           key prefix here.

PORTS_BASE="${BOT_PORT_BASE:-21000}"
PORTS_MAX_INDEX="${PORTS_MAX_INDEX:-200}"
BOT_DUMP_MAX_AGE_DAYS="${BOT_DUMP_MAX_AGE_DAYS:-30}"

# ── ports ────────────────────────────────────────────────────────────────────────────────────────
# card_id8 <card id>: the first 8 hex characters of the id.
card_id8() {
  local hex="${1//-/}"
  printf '%s\n' "${hex:0:8}"
}

card_db_dev() { printf 'vha_dev_bot_%s\n' "$(card_id8 "$1")"; }
card_db_test() { printf 'vha_test_bot_%s\n' "$(card_id8 "$1")"; }

# db_base_url: the server's URL without a database name: BOT_DB_URL, else the one in the checkout's
# .env.docker (the Postgres in Docker).
db_base_url() {
  local url="${BOT_DB_URL:-}"
  if [[ -z "$url" ]]; then url=$(sed -n 's/^DATABASE_URL=//p' "$BOT_CHECKOUT/.env.docker" | head -n 1); fi
  [[ -n "$url" ]] || return 1
  printf '%s\n' "${url%/*}"
}
db_url() { printf '%s/%s\n' "$(db_base_url)" "$1"; }

# ports_env <i> <card id>: the contents of a worktree's .vha/ports.env.
ports_env() {
  local i="$1" card="$2" http
  if ! [[ "$i" =~ ^[0-9]+$ ]] || (( i < 1 || i > PORTS_MAX_INDEX )); then
    echo "ports: index must be 1-$PORTS_MAX_INDEX (got '$i')" >&2
    return 1
  fi
  http=$((PORTS_BASE + 2 * i))
  cat <<ENV
export VHA_PORT_INDEX=$i
export HTTP_SERVER_PORT=$http
export HTTPS_PROXY_SERVER_PORT=$((http + 1))
export DATABASE_URL=$(db_url "$(card_db_dev "$card")")
ENV
}

# ports_load <worktree>: exports the worktree's ports and database when it has its own.
ports_load() {
  if [[ -f "$1/.vha/ports.env" ]]; then
    # shellcheck source=/dev/null
    source "$1/.vha/ports.env"
  fi
}

# port_listening <port>: something is listening on it.
port_listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

# ports_free_index <worktrees dir>: the lowest block no worktree there has taken and whose two ports
# nothing is listening on.
ports_free_index() {
  local taken i http
  taken=$(cat "$1"/*/.vha/ports.env 2>/dev/null | sed -n 's/^export VHA_PORT_INDEX=//p' | sort -n)
  for (( i = 1; i <= PORTS_MAX_INDEX; i++ )); do
    if grep -qx "$i" <<<"$taken"; then continue; fi
    http=$((PORTS_BASE + 2 * i))
    if port_listening "$http" || port_listening $((http + 1)); then continue; fi
    echo "$i"
    return
  done
  echo "ports: all $PORTS_MAX_INDEX port blocks are taken or in use (worktrees in $1)" >&2
  return 1
}

# card_env_write <worktree> <card id>: the worktree's .env.local and .env, which `deno task test`,
# `deno task local …` and every deno script read. .env.local is the checkout's .env.docker with the
# card's dev database and ports; .env is it plus the few extra variables the tests need, as `deno task
# switch:local` builds it, so scripts/test/test.sh's check that .env starts with .env.local holds.
# Only an allowlist of .env.extra goes in: no token the card's worker could read. `deno task docker …`
# and `switch:*` would rewrite .env to the human's own database: workers never run them.
card_env_write() {
  local wt="$1" card="$2" dev line
  local docker_env="$BOT_CHECKOUT/.env.docker" extra="$BOT_CHECKOUT/.env.extra"
  dev=$(card_db_dev "$card")
  [[ -f "$docker_env" ]] || { echo "resources: $docker_env is missing" >&2; return 1; }
  {
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" == DATABASE_URL=* ]]; then line="DATABASE_URL=$(db_url "$dev")"; fi
      printf '%s\n' "$line"
    done < "$docker_env"
    sed -n 's/^export //p' "$wt/.vha/ports.env" | grep -E '^(HTTP_SERVER_PORT|HTTPS_PROXY_SERVER_PORT)='
  } > "$wt/.env.local"
  grep -q "^DATABASE_URL=.*/$dev\$" "$wt/.env.local" || { echo "resources: no DATABASE_URL in $docker_env to give the card" >&2; return 1; }
  {
    cat "$wt/.env.local"
    printf '\nGOOGLE_MAPS_API_KEY=TEST_GOOGLE_MAPS_API_KEY\n'
    if [[ -f "$extra" ]]; then grep -E '^(GOOGLE_CLIENT_ID|VAPID_PUBLIC_KEY|VAPID_PRIVATE_KEY|VAPID_SUBJECT)=' "$extra" || true; fi
  } > "$wt/.env"
}

# ── databases ────────────────────────────────────────────────────────────────────────────────────
# db_psql <sql>: one statement against the server's maintenance database, its result unaligned.
db_psql() { psql "$(db_url postgres)" -v ON_ERROR_STOP=1 -Atqc "$1"; }

# db_server_ready: the Postgres is up and takes the bot's login.
db_server_ready() { db_psql 'select 1' >/dev/null 2>&1; }

db_exists() { [[ "$(db_psql "select 1 from pg_database where datname = '$1'" 2>/dev/null)" == 1 ]]; }

# db_drop <name>: gone, connections and all; fine if it never was.
db_drop() { db_psql "drop database if exists \"$1\" with (force)" >/dev/null; }

# dump_check: whether db/dumps/latest can make a card's databases. 0 when it can; otherwise says why and
# returns 10 (missing) or 11 (stale or unreadable), which the worker supervisor records as a block
# reason on the card rather than a failure to retry. BOT_DB_DUMP names another dump.
dump_check() {
  local dump="${BOT_DB_DUMP:-$BOT_CHECKOUT/db/dumps/latest}" modified age_days
  if [[ ! -f "$dump" ]]; then
    echo "$dump does not exist"
    return 10
  fi
  if [[ "$(head -c 23 "$dump" 2>/dev/null | tr -d '\000')" == 'version https://git-lfs' ]]; then
    echo "$dump is a Git LFS pointer, not a dump"
    return 10
  fi
  modified=$(stat -f %m "$dump" 2>/dev/null || stat -c %Y "$dump")
  age_days=$(( ($(date +%s) - modified) / 86400 ))
  if (( age_days > BOT_DUMP_MAX_AGE_DAYS )); then
    echo "$dump is $age_days days old; the limit is $BOT_DUMP_MAX_AGE_DAYS (BOT_DUMP_MAX_AGE_DAYS)"
    return 11
  fi
  if ! pg_restore --list "$dump" >/dev/null 2>&1; then
    echo "pg_restore cannot read $dump ($(pg_restore --list "$dump" 2>&1 >/dev/null | head -n 1)); is its pg_dump newer than this machine's pg_restore?"
    return 11
  fi
}

# restore_into <url> <dump>: pg_restore of the dump into that database. An error it ignores on a
# restore is a failure, as db/restore.ts has it, except the one a newer pg_restore than the server
# causes against a dump from a newer pg_dump: `SET transaction_timeout`, which changes nothing.
restore_into() {
  local url="$1" dump="$2" err code=0 errors benign
  err=$(mktemp)
  pg_restore --no-owner -d "$url" "$dump" 2> "$err" || code=$?
  cat "$err" >&2
  if (( code != 0 )); then
    errors=$(grep -c '^pg_restore: error:' "$err" || true)
    benign=$(grep -c '^pg_restore: error:.*transaction_timeout' "$err" || true)
    if (( errors > 0 && errors == benign )); then
      echo "(only SET transaction_timeout was refused, which changes nothing: counted as restored)" >&2
      code=0
    fi
  fi
  rm -f "$err"
  return "$code"
}

# card_db_build <card id> <worktree>: the steps of card_db_create, in the foreground.
card_db_build() {
  local card="$1" wt="$2" dev test dump dev_pid code=0
  dev=$(card_db_dev "$card")
  test=$(card_db_test "$card")
  dump="${BOT_DB_DUMP:-$BOT_CHECKOUT/db/dumps/latest}"
  echo "creating $dev and $test from $dump"
  db_drop "$dev" && db_drop "$test" || return 1
  db_psql "create database \"$dev\"" >/dev/null && db_psql "create database \"$test\" template template0" >/dev/null || return 1
  # The two restores are independent, so they run side by side.
  restore_into "$(db_url "$dev")" "$dump" &
  dev_pid=$!
  restore_into "$(db_url "$test")" "$dump" || code=$?
  wait "$dev_pid" || code=$?
  (( code == 0 )) || { echo "pg_restore failed"; return 1; }
  (cd "$wt" && env -i "${ISOLATED_ENV[@]}" bash -c "${BOT_DB_MIGRATE:-deno task local db:migrate latest}") || { echo "migrating failed"; return 1; }
}

# card_db_create <card id> <worktree>: the card's dev and test databases, each restored from the dump
# and migrated to the worktree's latest migration (BOT_DB_MIGRATE, run in the worktree, which has its
# .env by now). Their output goes to <worktree>/.vha/db.log. A failure drops both again. A database a
# crashed earlier attempt left is dropped first.
card_db_create() {
  local card="$1" log="$2/.vha/db.log"
  : > "$log"
  if card_db_build "$card" "$2" >> "$log" 2>&1; then return 0; fi
  card_db_drop "$card" >> "$log" 2>&1 || true
  return 1
}

# card_db_drop <card id>: both databases gone. Fails, leaving whichever it could not drop, when the
# server cannot be asked; the caller tries again.
card_db_drop() {
  local card="$1" failed=0
  db_drop "$(card_db_dev "$card")" || failed=1
  db_drop "$(card_db_test "$card")" || failed=1
  return "$failed"
}

# card_db_ready <card id>: both databases exist.
card_db_ready() { db_exists "$(card_db_dev "$1")" && db_exists "$(card_db_test "$1")"; }

# db_orphans: the bot's databases on the server, one a line.
db_orphans() {
  db_psql "select datname from pg_database where datname ~ '^vha_(dev|test)_bot_[0-9a-f]{8}\$' order by 1"
}

# db_sweep <keep: card ids that own a worktree, one a line, on stdin>: drops every bot database that
# belongs to no such card — what a crash between making a database and recording its worktree leaves.
db_sweep() {
  local keep name id8 ids
  ids=$(while IFS= read -r keep; do card_id8 "$keep"; done)
  while IFS= read -r name; do
    id8="${name##*_}"
    if grep -qx "$id8" <<<"$ids"; then continue; fi
    if db_drop "$name"; then echo "dropped $name, which no card owns"; else echo "could not drop $name"; fi
  done < <(db_orphans)
}
