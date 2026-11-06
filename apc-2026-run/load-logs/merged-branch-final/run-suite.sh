#!/bin/sh
# CI's test_non_web job (deno task test --ignore=test/web), run locally on plain main and on the branch.
# Each tree first seeds its own rules into the local Docker database (rules:rebuild), so main is tested
# with the 2023 rules and the branch with the 2026 rules. The branch goes last, leaving the 2026 set
# seeded. CI uses a fresh database; this local one already holds data, so compare the two runs with
# each other, not with CI.
set -u
L=$(cd "$(dirname "$0")" && pwd)
SHIM=$(mktemp -d); ln -s "$HOME/.local/bin/deno-2.8.0" "$SHIM/deno"
PATH="$SHIM:$PATH:/Applications/Docker.app/Contents/Resources/bin"; export PATH
trap 'rm -rf "$SHIM"' EXIT
R="$L/results.txt"; note() { echo "$1" | tee -a "$R"; }
for pair in "base:$HOME/Developer/vha-main-base" "branch:$HOME/Developer/vha-apc2026"; do
  label=${pair%%:*}; dir=${pair#*:}; cd "$dir" || exit 1
  [ "$(git config remote.origin.pushurl)" = no_push ] || { echo "push not disabled in $dir"; exit 1; }
  deno task rules:rebuild > "$L/$label-suite-rules-rebuild.log" 2>&1; note "$label rules:rebuild for suite: exit $? ($(grep -c 'Inserting' "$L/$label-suite-rules-rebuild.log") inserts)"
  mkdir -p logs/slow_queries
  deno task test --ignore=test/web > "$L/$label-test-non-web.log" 2>&1; note "$label test --ignore=test/web: exit $?"
  sed 's/\x1b\[[0-9;]*m//g' "$L/$label-test-non-web.log" | grep -E '^(ok|FAILED) \|' | tail -1 | sed "s/^/$label summary: /" | tee -a "$R"
done
