#!/usr/bin/env bash
# Prepares the machine that runs the dev bot (docs/bot.md#setup). Run it as the bot's user, from the
# main checkout. Safe to re-run.
#   bash host/setup.sh                    a laptop, or any machine you also work on: the packages, Colima,
#                                         Postgres, then `deno task bot:setup`. Nothing machine-wide is
#                                         changed, so no sudo.
#   bash host/setup.sh --managed-settings also installs the workers' sandbox as Claude Code managed
#                                         settings (sudo): they then cannot be overridden by a worker,
#                                         but they apply to EVERY Claude Code session on this machine
#   bash host/setup.sh --dedicated        a machine that only runs the bot: --managed-settings, and it
#                                         stays awake and restarts after a power cut (sudo)
# Each worker is sandboxed either way: bot/claude-worker.sh hands it host/sandbox-settings.sh's
# settings with --settings every turn.
set -euo pipefail
cd "$(dirname "$0")/.."

managed=0 dedicated=0
for arg in "$@"; do
  case "$arg" in
    --managed-settings) managed=1 ;;
    --dedicated) managed=1 dedicated=1 ;;
    *) echo "usage: bash host/setup.sh [--managed-settings | --dedicated]" >&2; exit 2 ;;
  esac
done

brew bundle --file host/Brewfile

# deno: runtime.txt names the version the project is on.
command -v deno >/dev/null || {
  echo "deno is not installed: curl -fsSL https://deno.land/install.sh | sh -s $(tr -d '\n' < runtime.txt)" >&2
  exit 1
}
[[ "$(deno --version | awk 'NR == 1 { print $2 }')" == "$(tr -d 'v\n' < runtime.txt)" ]] ||
  echo "note: deno is not the version in runtime.txt ($(tr -d '\n' < runtime.txt))" >&2

# Postgres, in Docker (Colima unless Docker already answers), as the repo's docker-compose.yml has it:
# where each card's two databases go.
docker info >/dev/null 2>&1 || colima start --memory "${COLIMA_MEMORY:-6}" --cpu "${COLIMA_CPU:-3}"
docker compose up -d postgres

if (( dedicated )); then
  sudo pmset -a sleep 0 autorestart 1
  sudo softwareupdate --schedule off
fi

if (( managed )); then
  dir="/Library/Application Support/ClaudeCode/managed-settings.d"
  tmp=$(mktemp)
  bash host/sandbox-settings.sh --managed > "$tmp"
  sudo mkdir -p "$dir"
  sudo install -o root -g wheel -m 644 "$tmp" "$dir/50-vha-bot.json"
  rm -f "$tmp"
  echo "✔ Installed $dir/50-vha-bot.json. Re-run this after moving the checkout or changing scripts/protected-paths.txt."
fi

deno task bot:setup

cat <<'NEXT'

✔ Packages, Colima and Postgres are up, and the bot's settings are written.
db/dumps/latest has to be a dump of main's database, newer than BOT_DUMP_MAX_AGE_DAYS (bot:setup says whether it is).
Start the bot with: deno task bot:start
NEXT
if (( dedicated )); then
  echo "By hand, in System Settings: FileVault off; automatic login as this user; Tailscale, Remote Login (SSH) and Screen Sharing on."
fi
