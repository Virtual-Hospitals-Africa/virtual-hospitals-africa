#!/usr/bin/env bash
# bot/lib/run-ts.sh <file.ts> [args…]: runs one of the bot's TypeScript files (state.ts, notion.ts,
# sidebar.ts) with Deno. bot.sh points BOT_TS here; every bash call site goes through BOT_TS.
#
# Permissions are scoped, not -A: these processes legitimately read and write files (.bot/, the
# worktrees, downloaded attachments), read their environment (BOT_DIR, NOTION_TOKEN), reach the
# network (Notion and the signed URLs of its attachments, whose hosts are not a fixed list), and run
# git, bash (sidebar.sh), open (a click on a card) and kill (is a pid alive) — and nothing else.
#   --no-prompt  a permission a file lacks is an error, never a prompt a supervisor waits on forever
#   --no-lock    a run never rewrites deno.lock (the repo's `deno install` owns it)
#   --no-check   type errors are `deno task check`'s to find (also the checks gate), not a delay on
#                the dozens of runs a minute
# BOT_DENO (bot.sh finds it on the bot's PATH) is the deno to run; a bare `deno` otherwise.
# --config pins the repo's deno.json and its node_modules whatever the working directory is (a worktree).
set -euo pipefail
code="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec "${BOT_DENO:-$(command -v deno)}" run \
  --config "$code/deno.json" \
  --no-prompt --no-lock --no-check \
  --allow-read --allow-write --allow-env --allow-net --allow-sys \
  --allow-run=git,bash,open,kill \
  "$@"
