#!/usr/bin/env bash
# What a `done` must pass before its PR (docs/bot.md#a-done), run side by side in the worktree it is
# called from: what `deno task check` runs (typecheck, fmt, lint, hygiene), each on its own so a failure
# names itself, and the tests outside test/web, against the card's own database (the web tests are the
# worker's own `run`, and CI runs everything). Each check's output is its own section of this one's,
# written as it finishes. The first failure stops the rest, so the card hears at once; the last line
# says what failed. Exits 0 only if all passed.
#   bot/lib/run-checks.sh          run them
#   bot/lib/run-checks.sh --list   print their names, one a line, and exit
set -uo pipefail

# The checks: `name|command`, the command run by bash in the worktree. To add one, add a line.
# DENO_JOBS keeps the test files to a few at a time, the machine being shared by several cards.
checks=(
  "typecheck|deno check"
  "fmt|deno fmt --check"
  "lint|deno lint"
  "hygiene|deno task hygiene"
  "test-non-web|DENO_JOBS=2 deno task test --ignore=test/web"
)
names=()
commands=()
for check in "${checks[@]}"; do
  names+=("${check%%|*}")
  commands+=("${check#*|}")
done
if [[ "${1:-}" == --list ]]; then
  printf '%s\n' "${names[@]}"
  exit 0
fi

logs=$(mktemp -d)
pids=()
started=()
running=()

stop_running() {
  local i
  for i in ${running[@]+"${running[@]}"}; do kill -TERM -- "-${pids[i]}" 2>/dev/null || true; done
  sleep 2
  for i in ${running[@]+"${running[@]}"}; do kill -KILL -- "-${pids[i]}" 2>/dev/null || true; done
}

# shellcheck disable=SC2329 # the TERM and INT trap
interrupted() {
  local i
  stop_running
  for i in ${running[@]+"${running[@]}"}; do
    printf '── %s stopped (%ss)\n' "${names[i]}" $((SECONDS - started[i]))
    cat "$logs/${names[i]}.log"
  done
  exit 143
}
trap interrupted TERM INT
trap 'rm -rf "$logs"' EXIT

set -m
for i in "${!names[@]}"; do
  started[i]=$SECONDS
  bash -c "${commands[i]}" > "$logs/${names[i]}.log" 2>&1 < /dev/null &
  pids[i]=$!
done
set +m

finished() {
  local i="$1" code="$2" mark='✔'
  (( code == 0 )) || mark='✘'
  printf '── %s %s (%ss)\n' "${names[i]}" "$mark" $((SECONDS - started[i]))
  cat "$logs/${names[i]}.log"
}

running=("${!names[@]}")
failed=()
while (( ${#running[@]} > 0 )); do
  still=()
  for i in "${running[@]}"; do
    if kill -0 "${pids[i]}" 2>/dev/null; then
      still+=("$i")
      continue
    fi
    code=0
    wait "${pids[i]}" || code=$?
    finished "$i" "$code"
    (( code == 0 )) || failed+=("$i")
  done
  running=("${still[@]+"${still[@]}"}")
  if (( ${#failed[@]} > 0 )); then
    stop_running
    break
  fi
  (( ${#running[@]} == 0 )) || sleep 1
done

(( ${#failed[@]} == 0 )) && exit 0
first="${failed[0]}"
last=$(awk 'NF { l = $0 } END { print l }' "$logs/${names[first]}.log")
list=""
for i in "${failed[@]}"; do list+="${list:+, }${names[i]}"; done
printf 'checks failed: %s — %s\n' "$list" "$last"
exit 1
