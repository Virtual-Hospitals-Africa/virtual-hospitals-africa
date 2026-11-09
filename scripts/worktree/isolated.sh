#!/usr/bin/env bash
set -euo pipefail

# Create (or reuse) a git worktree with its own dev AND test databases.
#
# Usage: ./scripts/worktree/isolated.sh [--skipdb] [--from <start-point>] <branch-name>
#
# Options:
#   --skipdb               Share the main checkout's databases instead of creating new ones.
#   --from <start-point>   Create or reset <branch-name> at <start-point> (like `git checkout -B`).
#
# Environment:
#   VHA_WORKTREES_DIR      Where worktrees go (default: ../vha-worktrees).
#
# Without --skipdb the worktree gets databases vha_dev_<suffix> and vha_test_<suffix>, both restored
# from db/dumps/latest. <suffix> is the branch name lowercased with every run of non-alphanumeric
# characters turned into "_", so any branch name works (Puellula-patch-12 -> puellula_patch_12).
#
# Prints the worktree path on stdout as its last line; everything else goes to stderr.

fail() {
  echo "Error: $*" >&2
  exit 1
}

SKIP_DB=false
FROM_REF=""
while [ $# -gt 0 ]; do
  case "$1" in
    --skipdb) SKIP_DB=true; shift ;;
    --from) FROM_REF="${2:-}"; [ -n "$FROM_REF" ] || fail "--from needs a start point"; shift 2 ;;
    --) shift; break ;;
    -*) fail "unknown option $1" ;;
    *) break ;;
  esac
done

[ -n "${1:-}" ] || fail "Branch name is required
Usage: $0 [--skipdb] [--from <start-point>] <branch-name>"
BRANCH_NAME="$1"

start_dir=$(pwd)
WORKTREES_DIR="${VHA_WORKTREES_DIR:-../vha-worktrees}"
WORKTREE_DIR="$WORKTREES_DIR/$BRANCH_NAME"
latest_dump="${start_dir}/db/dumps/latest"

# Which env flavour the main checkout uses. The task wrappers (scripts/env/*.sh, db/*.sh) compare
# .env against .env.docker / .env.local and run switch:* when they differ, which copies that file
# over .env. So the worktree needs its own isolated copies of those files, not just an edited .env.
if [ -f .env.docker ]; then
  ENV_KIND=docker
elif [ -f .env.local ]; then
  ENV_KIND=local
else
  fail "Need .env.docker or .env.local in $(pwd)"
fi

DB_SUFFIX=$(printf '%s' "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/_/g; s/^_+//; s/_+$//')
[[ "$DB_SUFFIX" =~ ^[a-z] ]] || DB_SUFFIX="b_${DB_SUFFIX}"
DEV_DB="vha_dev_${DB_SUFFIX}"
TEST_DB="vha_test_${DB_SUFFIX}"
[ ${#TEST_DB} -le 63 ] || fail "database name $TEST_DB is longer than Postgres' 63-character limit; use a shorter branch name"

if [ "$SKIP_DB" = false ]; then
  [ -f "$latest_dump" ] || fail "Need a latest dump to make an isolated worktree. Please run
deno task db:rebuild && deno task db:dump > ./db/dumps/latest"
  # db/db.ts derives the test database by replacing "vha_dev" with "vha_test" in DATABASE_URL,
  # so the main checkout must point at exactly .../vha_dev for both names to be isolated.
  for f in .env.docker .env.local; do
    [ -f "$f" ] || continue
    grep -Eq '^DATABASE_URL=.*/vha_dev([?].*)?$' "$f" ||
      fail "$f: DATABASE_URL must end in /vha_dev for isolated databases (use --skipdb to share them)"
  done
fi

# Writes the worktree's env files: isolated copies of .env.docker / .env.local, an .env.extra with
# its ports, and .env built exactly the way `deno task switch:<kind>` builds it.
write_env_files() {
  local http_port="$1" https_port="$2"
  for f in .env.docker .env.local; do
    [ -f "$f" ] || continue
    if $SKIP_DB; then
      cp "$f" "$WORKTREE_DIR/$f"
    else
      sed -E "s#^(DATABASE_URL=.*/)vha_dev([?].*)?\$#\1${DEV_DB}\2#" "$f" >"$WORKTREE_DIR/$f"
    fi
  done
  {
    [ -f .env.extra ] && cat .env.extra && echo ''
    echo "HTTP_SERVER_PORT=$http_port"
    echo "HTTPS_PROXY_SERVER_PORT=$https_port"
  } >"$WORKTREE_DIR/.env.extra"
  (cd "$WORKTREE_DIR" && deno task -q "switch:$ENV_KIND" >&2)
  # .env.docker is tracked, so keep the worktree's isolated copy out of `git status` and commits.
  for f in .env.docker .env.local .env.extra; do
    if git -C "$WORKTREE_DIR" ls-files --error-unmatch "$f" >/dev/null 2>&1; then
      git -C "$WORKTREE_DIR" update-index --skip-worktree "$f"
    fi
  done
}

next_ports() {
  local port_counter="$WORKTREES_DIR/port_counter"
  if [ ! -f "$port_counter" ]; then
    printf 'HTTP_SERVER_PORT=8004\nHTTPS_PROXY_SERVER_PORT=8005\n' >"$port_counter"
  fi
  # shellcheck disable=SC1090
  source "$port_counter"
  HTTP_SERVER_PORT=$((HTTP_SERVER_PORT + 2))
  HTTPS_PROXY_SERVER_PORT=$((HTTPS_PROXY_SERVER_PORT + 2))
  printf 'HTTP_SERVER_PORT=%s\nHTTPS_PROXY_SERVER_PORT=%s\n' "$HTTP_SERVER_PORT" "$HTTPS_PROXY_SERVER_PORT" >"$port_counter"
}

# Asks the app's own db.ts which database it will use, with and without IS_TEST.
# (Writes to stdout directly because db.ts patches console.log to prefix timestamps.)
assert_isolated() {
  local dev test
  dev=$(cd "$WORKTREE_DIR" && NO_EXTERNAL_CONNECT=true deno eval --env-file=.env \
    "import { opts } from './db/db.ts'; Deno.stdout.writeSync(new TextEncoder().encode(opts!.database + '\\n'))" 2>/dev/null | tail -n 1)
  test=$(cd "$WORKTREE_DIR" && IS_TEST=true NO_EXTERNAL_CONNECT=true deno eval --env-file=.env \
    "import { opts } from './db/db.ts'; Deno.stdout.writeSync(new TextEncoder().encode(opts!.database + '\\n'))" 2>/dev/null | tail -n 1)
  [ "$dev" = "$DEV_DB" ] || fail "worktree dev database resolves to '$dev', expected '$DEV_DB'"
  [ "$test" = "$TEST_DB" ] || fail "worktree test database resolves to '$test', expected '$TEST_DB'"
  echo "Isolated databases: $DEV_DB, $TEST_DB" >&2
}

mkdir -p "$WORKTREES_DIR"

if [ -d "$WORKTREE_DIR" ]; then
  echo "Worktree already exists at $WORKTREE_DIR" >&2
  [ -f "$WORKTREE_DIR/.env" ] || fail "no .env file found in ${WORKTREE_DIR}"
  if [ -n "$FROM_REF" ]; then
    git -C "$WORKTREE_DIR" checkout -B "$BRANCH_NAME" "$FROM_REF" >&2
  fi
  $SKIP_DB || assert_isolated
else
  if [ -n "$FROM_REF" ]; then
    echo "Creating $BRANCH_NAME at $FROM_REF" >&2
    git worktree add -B "$BRANCH_NAME" "$WORKTREE_DIR" "$FROM_REF" >&2
  elif git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "Checking out existing local branch: $BRANCH_NAME" >&2
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME" >&2
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
    echo "Checking out existing remote branch: origin/$BRANCH_NAME" >&2
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME" >&2
  else
    echo "Creating new branch: $BRANCH_NAME from main" >&2
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" main >&2
  fi

  next_ports
  write_env_files "$HTTP_SERVER_PORT" "$HTTPS_PROXY_SERVER_PORT"

  cd "$WORKTREE_DIR"
  deno install --allow-scripts >&2

  if ! $SKIP_DB; then
    cd "$start_dir"
    assert_isolated
    ln -s "$latest_dump" "$WORKTREE_DIR/db/dumps/latest"
    cd "$WORKTREE_DIR"
    # Create and restore the dev database, then (IS_TEST=true) the test database.
    # The .env written above already holds the isolated names, so call the db tasks directly.
    deno task db:create >&2
    deno task db:restore latest >&2
    IS_TEST=true deno task db:create >&2
    IS_TEST=true deno task db:restore latest >&2
  fi
fi

cd "$start_dir"
echo "$WORKTREE_DIR"
