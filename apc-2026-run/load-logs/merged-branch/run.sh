#!/bin/sh
# Local checks of the apc-2026-conversion branch against plain VHA main. Deno 2.8.0, type-checking on.
# Nothing is pushed; the only database touched is the local Docker one (rules:rebuild = compile +
# docker db:seed recreate 31_rules).
set -u
L=$(cd "$(dirname "$0")" && pwd)
BR=$HOME/Developer/vha-apc2026; BASE=$HOME/Developer/vha-main-base
SHIM=$(mktemp -d); ln -s "$HOME/.local/bin/deno-2.8.0" "$SHIM/deno"
PATH="$SHIM:$PATH:/Applications/Docker.app/Contents/Resources/bin"; export PATH
trap 'rm -rf "$SHIM"' EXIT
deno --version | head -1 > "$L/deno-version.txt"
docker info >/dev/null 2>&1 || { echo "Docker not running"; exit 1; }
R="$L/results.txt"; : > "$R"
note() { echo "$1" | tee -a "$R"; }

static() {  # $1 = label, $2 = dir
  cd "$2" || exit 1
  deno check > "$L/$1-deno-check.log" 2>&1;     note "$1 deno check: exit $?"
  deno fmt --check > "$L/$1-fmt.log" 2>&1;      note "$1 deno fmt --check: exit $?"
  deno lint > "$L/$1-lint.log" 2>&1;            note "$1 deno lint: exit $?"
  deno task hygiene > "$L/$1-hygiene.log" 2>&1; note "$1 deno task hygiene: exit $?"
}

# 1. branch: rebuild rules into the local database, then Will's merged test
cd "$BR" || exit 1
[ "$(git -C "$BR" config remote.origin.pushurl)" = no_push ] || { echo "push not disabled"; exit 1; }
deno task rules:rebuild > "$L/branch-rules-rebuild.log" 2>&1; note "branch rules:rebuild: exit $?"
note "branch seed inserts: $(grep -c 'Inserting' "$L/branch-rules-rebuild.log")"
git -C "$BR" status --short > "$L/branch-status-after-rebuild.txt"
note "branch files changed by rebuild: $(wc -l < "$L/branch-status-after-rebuild.txt" | tr -d ' ') (compiled output should match the commit)"
deno task test test/shared/compiled_s_expressions.test.ts > "$L/branch-will-test.log" 2>&1; note "branch Will's test: exit $?"

# 2. base: the same merged-in test file does not exist on main; run main's own test as the baseline
cd "$BASE" || exit 1
deno task test test/shared/compiled_s_expressions.test.ts > "$L/base-main-test.log" 2>&1; note "base (main) compiled_s_expressions test: exit $?"

# 3. static checks, both trees
static branch "$BR"
static base "$BASE"
