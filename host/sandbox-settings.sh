#!/usr/bin/env bash
# shellcheck disable=SC2088 # `~/` is Claude Code's own home prefix, in sandbox paths and permission rules
# The Claude Code settings a dev-bot worker runs under (docs/bot.md#security): the sandbox around its
# shell commands, and permission rules over its file tools. Printed as JSON on stdout. Nothing here is
# written anywhere: the paths are the bot's own (bot/lib/bot.sh) and the protected paths are the lines of
# scripts/protected-paths.txt, so the two cannot drift.
#   bash host/sandbox-settings.sh <worktree>   one card's worktree: what bot/claude-worker.sh passes
#                                              to Claude with --settings, each turn
#   bash host/sandbox-settings.sh --managed    every card worktree under BOT_WORKTREES: what
#                                              `bash host/setup.sh --managed-settings` installs
#                                              machine-wide, so no worker can override it (only for
#                                              a machine nobody else uses Claude Code on)
set -euo pipefail

# shellcheck source=bot/lib/bot.sh disable=SC1091
source "$(dirname "${BASH_SOURCE[0]}")/../bot/lib/bot.sh"

managed=0 wt=""
for arg in "$@"; do
  case "$arg" in
    --managed) managed=1 ;;
    -*) echo "usage: host/sandbox-settings.sh <worktree> | --managed" >&2; exit 2 ;;
    *) wt="$arg" ;;
  esac
done
if (( managed == (${#wt} > 0) )); then
  echo "usage: host/sandbox-settings.sh <worktree> | --managed" >&2
  exit 2
fi

list="${BOT_PROTECTED_PATHS:-$BOT_CODE/scripts/protected-paths.txt}"
[[ -f "$list" ]] || { echo "sandbox-settings: $list does not exist" >&2; exit 1; }
# One path a line: a file, or `dir/**` for everything under a directory.
mapfile -t protected < <(sed -e 's/#.*//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e '/^$/d' "$list")
if (( ${#protected[@]} == 0 )); then
  echo "sandbox-settings: no paths in $list" >&2
  exit 1
fi

# The trees a worker could reach a protected path through: the bot's checkout, and the card's own
# worktree (or, managed, every card's: `*` is one path segment).
roots=("$BOT_CHECKOUT")
if (( managed )); then roots+=("$BOT_WORKTREES/*"); else roots+=("$wt"); fi

# What no worker may write: the protected paths, the bot's own state, and the hooks that tell the bot
# how its Claude is doing (and the card's ports).
write_paths=("$BOT_DIR")
edit_rules=("Edit(/$BOT_DIR/**)")
for root in "${roots[@]}"; do
  for path in "${protected[@]}"; do
    write_paths+=("$root/${path%/\*\*}")
    edit_rules+=("Edit(/$root/$path)")
  done
done
if (( managed )); then card="$BOT_WORKTREES/*"; else card="$wt"; fi
# .claude/ is where a hook or an MCP server would be planted; the sandbox already protects it from a
# command, and this is the same for Claude's file tools.
write_paths+=("$card/.vha/hooks" "$card/.vha/ports.env" "$card/.claude")
edit_rules+=("Edit(/$card/.vha/hooks/**)" "Edit(/$card/.vha/ports.env)" "Edit(/$card/.claude/**)")

# What no worker may read: the tokens. .env* in the bot's checkout holds .env.extra's real ones (the
# card's own .env is a different file, in its worktree) and .bot/bot.env the bot's; then the
# credentials a laptop's user has.
credentials=("~/.ssh" "~/.aws" "~/.gnupg" "~/.config/gh" "~/.docker")
credential_files=("~/.netrc")
read_paths=("$BOT_DIR/bot.env" "$BOT_CHECKOUT/.env" "$BOT_CHECKOUT/.env.*" "${credentials[@]}" "${credential_files[@]}")
read_rules=("Read(/$BOT_DIR/bot.env)" "Read(/$BOT_CHECKOUT/.env*)")
for path in "${credentials[@]}"; do read_rules+=("Read($path/**)"); done
for path in "${credential_files[@]}"; do read_rules+=("Read($path)"); done

json() { printf '%s\n' "$@" | jq -Rnc '[inputs]'; }

# What the card's own commands never run: they would point .env at the human's database or flush
# the shared Redis (deno task docker …, switch:*, db:rebuild/reset/drop), reach the Docker daemon, or
# publish (the bot pushes and opens the PR, outside the sandbox).
jq -n \
  --argjson writes "$(json "${write_paths[@]}")" \
  --argjson reads "$(json "${read_paths[@]}")" \
  --argjson edits "$(json "${edit_rules[@]}")" \
  --argjson read_rules "$(json "${read_rules[@]}")" \
  --arg checkout_git "$BOT_CHECKOUT/.git" '
  {
    permissions: {
      deny: ($edits + $read_rules + [
        "Bash(deno task docker *)", "Bash(deno task db:docker *)", "Bash(deno task switch:*)",
        "Bash(deno task db:rebuild*)", "Bash(deno task local db:rebuild*)",
        "Bash(deno task db:reset*)", "Bash(deno task local db:reset*)",
        "Bash(deno task db:drop*)", "Bash(deno task local db:drop*)",
        "Bash(docker *)", "Bash(git push *)", "Bash(gh *)"
      ]),
      disableBypassPermissionsMode: "disable"
    },
    sandbox: {
      enabled: true,
      failIfUnavailable: true,
      allowUnsandboxedCommands: false,
      enableWeakerNestedSandbox: false,
      # Without it deno'"'"'s fetch fails under the macOS sandbox ("Failed to load platform certificates"):
      # with it, a deno fetch worked in a trial run (the key weakens the macOS network sandbox; the docs name
      # it for TLS verification under Seatbelt).
      enableWeakerNetworkIsolation: true,
      filesystem: {
        # A worktree'"'"'s commits are written into the checkout'"'"'s .git; deno and npm keep their caches
        # in the user'"'"'s home. The worktree itself, and the temp directory, are writable by default.
        allowWrite: [$checkout_git, "~/Library/Caches/deno", "~/.npm"],
        denyWrite: $writes,
        denyRead: $reads
      },
      network: {
        # Postgres and the card'"'"'s servers are on localhost, and on macOS this is the only way a
        # sandboxed command reaches them: every port on localhost, not just 5432 and the card'"'"'s.
        allowLocalBinding: true,
        # No Unix socket is listed: the macOS sandbox blocks them all, the Docker daemon'"'"'s among them.
        allowAllUnixSockets: false,
        # What `deno` and `npm` fetch (deno.json'"'"'s imports; db:codegen'"'"'s npm install).
        allowedDomains: ["jsr.io", "*.jsr.io", "registry.npmjs.org", "deno.land", "*.deno.land", "raw.githubusercontent.com"]
      }
    }
  }'
