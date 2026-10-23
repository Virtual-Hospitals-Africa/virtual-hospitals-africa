# shellcheck shell=bash
# bot/lib/prompts.sh — a worker's first prompt, and a failed run in one line (docs/bot.md). Source
# after bot.sh. Later turns' messages are bot/state.ts's `resume`.

replies_markdown() {
  jq -r '.[] | "**\(.author)** (\(.created)):\n\(.text)\n"
    + (if (.files | length) > 0 then "Attached: " + ([.files[].url] | join(", ")) + "\n" else "" end)' "$1"
}

# start_prompt <page> <worktree>: the card, its comments so far (attachments downloaded into the
# worktree's .vha/inbox/) and the pointer to the contract.
start_prompt() {
  local page="$1" worktree="$2" replies
  replies=$(mktemp)
  notion comments "$page" --since "" --into "$worktree/.vha/inbox" > "$replies"
  notion card-markdown "$page"
  printf '\n\n## Comments so far\n\n'
  if [[ "$(jq length "$replies")" == 0 ]]; then echo "(none)"; else replies_markdown "$replies"; fi
  printf '\nWork this card in this worktree. Follow bot/WORKER.md.\n'
  rm -f "$replies"
}

# failure_summary <run dir|""> <exit code>: one line for the card, from the run's command.log. A
# `deno test` run is its summary line (`FAILED | 3 passed | 2 failed (12s)`) and the first error it
# printed; anything else is the log's last line.
failure_summary() {
  local run_dir="$1" code="$2" log step error
  if [[ -z "$run_dir" ]]; then
    printf 'the run stopped before it started (exit %s)' "$code"
    return
  fi
  log="$run_dir/command.log"
  step=$(grep -aE '^(FAILED|ok) \|' "$log" 2>/dev/null | tail -n 1 || true)
  if [[ -n "$step" ]]; then
    error=$(grep -aE -m1 '^error: ' "$log" 2>/dev/null || true)
  else
    step=$(awk 'NF { last = $0 } END { print last }' "$log" 2>/dev/null || true)
  fi
  printf 'exit %s' "$code"
  if [[ -n "$step" ]]; then printf " at \`%s\`" "$(one_line "$step")"; fi
  if [[ -n "${error:-}" ]]; then printf ': %s' "$(one_line "$error")"; fi
  printf ' (run %s)' "$(basename "$run_dir")"
}

# one_line <text>: trimmed, capped at 200 characters, and free of backticks so it cannot break out of
# a code span.
one_line() {
  local text="${1//\`/\'}"
  text="${text#"${text%%[![:space:]]*}"}"
  text="${text%"${text##*[![:space:]]}"}"
  if (( ${#text} > 200 )); then text="${text:0:199}…"; fi
  printf '%s' "$text"
}
