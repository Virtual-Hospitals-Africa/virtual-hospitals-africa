#!/usr/bin/env bash
# A test run by hand, on the bot's testers (docs/bot.md#debugging):
#   deno task bot:test <card> [--servers|--no-servers] -- <command…>
# Runs in the card's worktree like any of its tests — its ports and databases, a run dir in
# .vha/runs — once the card is idle (waiting on you, blocked, finished, or held). The web servers are
# started first when the command needs them (it names test/web, or is a bare `deno task test`), or
# with --servers, and not with --no-servers. The result goes to the card's card.log and run dir; the
# card's state and its worker are left alone.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"

usage() { sed -n 3p "$0" >&2; exit 1; }
name="${1:-}"
[[ -n "$name" ]] || usage
shift
servers=""
while (( $# > 0 )); do
  case "$1" in
    --servers) servers=true; shift ;;
    --no-servers) servers=false; shift ;;
    --) shift; break ;;
    *) usage ;;
  esac
done
(( $# > 0 )) || usage
if [[ -z "$servers" ]]; then servers=$(bot_state servers "$*"); fi
if ! card=$(bot_state card "$name"); then
  echo "test: no card known as $name" >&2
  exit 1
fi
if [[ "$(jq -r '.worktree == null' <<<"$card")" == true ]]; then
  echo "test: $name has no worktree yet" >&2
  exit 1
fi
if [[ "$(jq -r .idle <<<"$card")" != true ]]; then
  echo "test: the card is $(jq -r .state <<<"$card"); hold it (tick Bot hold) or wait until it is waiting on you, blocked or finished" >&2
  exit 1
fi
emit test.requested "$(jq -r .id <<<"$card")" --arg command "$*" --argjson servers "$servers"
echo "✔ queued; follow it with: deno task bot:watch $name"
