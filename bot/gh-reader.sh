#!/usr/bin/env bash
# Looks on GitHub every minute at the cards the bot waits on a PR for (docs/bot.md#how-it-works):
# a Blocked card whose branch has a merged PR is finished (pr.merged: a human took it the rest of the
# way); an Awaiting CI card whose PR was merged likewise, else its PR's checks are read — all passed is
# ci.passed, which finishes it; one failed is ci.failed, which sends it back to the worker. A PR no check
# ever started on (none) counts as passed once the card has waited BOT_CI_GRACE_SECONDS. A failed look
# records nothing and is tried again next minute.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/pr.sh
source "$BOT_CODE/bot/lib/pr.sh"
LOG_SOURCE=gh-reader
BOT_GH_READ_SECONDS="${BOT_GH_READ_SECONDS:-60}"
BOT_CI_GRACE_SECONDS="${BOT_CI_GRACE_SECONDS:-600}"

# finish_merged <card> <worktree> <branch>: records the branch's merged PR, if it has one. Fails, saying
# so, when GitHub could not be asked; succeeds with nothing recorded when there is no merged PR.
finish_merged() {
  local card="$1" path="$2" branch="$3" url
  if ! url=$(pr_merged "$path" "$branch"); then
    log "card $card: asking GitHub for $branch's merged PR failed (above)"
    return 2
  fi
  [[ -n "$url" ]] || return 1
  if emit pr.merged "$card" --arg url "$url"; then
    log "card $card: $url is merged; finished"
  else
    log "card $card: $url is merged, but recording it failed (above)"
  fi
  return 0
}

# read_ci <card> <worktree> <PR URL> <seconds the card has waited>: records the PR's checks once they are decided.
read_ci() {
  local card="$1" path="$2" pr="$3" waited="$4" verdict kind sha failure
  if ! verdict=$(pr_ci "$path" "$pr"); then
    log "card $card: asking GitHub for the checks on $pr failed (above)"
    return
  fi
  IFS=$'\t' read -r kind sha failure <<<"$verdict"
  if [[ "$kind" == none ]] && (( waited >= BOT_CI_GRACE_SECONDS )); then
    kind=passed
    sha=$(git -C "$path" rev-parse HEAD)
  fi
  case "$kind" in
    passed) emit ci.passed "$card" --arg url "$pr" --arg sha "$sha" && log "card $card: CI passed on $pr; finished" ;;
    failed) emit ci.failed "$card" --arg url "$pr" --arg sha "$sha" --arg failure "$failure failed" && log "card $card: CI failed on $pr: $failure" ;;
  esac
}

look() {
  local line card state path branch pr waited merged
  while read -r line; do
    card=$(jq -r .card <<<"$line")
    state=$(jq -r .state <<<"$line")
    path=$(jq -r .path <<<"$line")
    branch=$(jq -r .branch <<<"$line")
    pr=$(jq -r '.pr // empty' <<<"$line")
    waited=$(jq -r .waited <<<"$line")
    [[ -d "$path" ]] || continue
    merged=0
    finish_merged "$card" "$path" "$branch" || merged=$?
    # 0: finished by its merge; 2: GitHub could not be asked, so its checks cannot be either.
    (( merged == 1 )) || continue
    if [[ "$state" == "Awaiting CI" && -n "$pr" ]]; then read_ci "$card" "$path" "$pr" "$waited"; fi
  done < <(bot_state watched)
}

trap 'exit 0' TERM INT
loops=0
while (( ${BOT_LOOPS:-0} == 0 || loops < BOT_LOOPS )); do
  look
  sleep "$BOT_GH_READ_SECONDS" &
  wait $! || true
  loops=$((loops + 1))
done
