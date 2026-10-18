#!/usr/bin/env bash
# Sets the bot up on this machine (docs/bot.md#setup). Safe to re-run: Enter keeps a setting.
#   deno task bot:setup
# Checks the tools, writes .bot/bot.env (owner-only, never committed), checks the Notion connection
# and offers to add the bot properties the board lacks, makes the PR labels on GitHub, and checks the
# Postgres and the database dump every card's databases are made from.
set -euo pipefail

# shellcheck source=bot/lib/bot.sh
source "$(dirname "$0")/lib/bot.sh"
# shellcheck source=bot/lib/pr.sh
source "$BOT_CODE/bot/lib/pr.sh"
cd "$BOT_CODE"
env_file="$BOT_DIR/bot.env"

# ── tools ────────────────────────────────────────────────────────────────────────────────────────
# Looked up on the PATH the bot runs with (BOT_PATH), not this shell's: a tool only an fnm or nvm
# shell can see passes here and then fails mid-run as "command not found".
bot_path=$BOT_PATH
missing=() unreachable=()
# node (and its npm) is still needed by `deno task db:codegen`: db/codegen.sh runs kysely-codegen with it.
for tool in jq node git claude gh tmux deno docker psql pg_restore curl lsof; do
  if (PATH="$bot_path"; command -v "$tool" >/dev/null); then continue; fi
  if command -v "$tool" >/dev/null; then
    unreachable+=("$tool ($(command -v "$tool"))")
  else
    missing+=("$tool")
  fi
done
if (( BASH_VERSINFO[0] < 5 )); then missing+=("bash ≥ 5 (found $BASH_VERSION)"); fi
if (( ${#missing[@]} > 0 )); then
  echo "Missing: ${missing[*]}" >&2
  echo "Install them with: bash host/setup.sh   (claude: https://claude.com/claude-code)" >&2
fi
if (( ${#unreachable[@]} > 0 )); then
  echo "Not on the bot's PATH ($bot_path): ${unreachable[*]}" >&2
  echo "Install them where it looks — e.g. /opt/homebrew/bin/npm install -g <package>, not an fnm/nvm npm" >&2
fi
if (( ${#missing[@]} + ${#unreachable[@]} > 0 )); then exit 1; fi
# node_modules is manual (deno.json): the bot's own TypeScript (@notionhq/client, zod) and `deno task
# check` read the packages from it, so `deno install` has to have run in this checkout.
if [[ ! -d node_modules/@notionhq/client ]] || ! command -v "$BOT_TS" >/dev/null; then
  echo "Missing packages — run: deno install --allow-scripts" >&2
  exit 1
fi

# ── settings ─────────────────────────────────────────────────────────────────────────────────────
NOTION_TOKEN="" NOTION_DATA_SOURCE_ID="" GH_TOKEN="" BOT_WORKERS="" BOT_TESTERS=""
if [[ -f "$env_file" ]]; then
  # shellcheck source=/dev/null
  source "$env_file"
fi

# ask <var> <prompt> [secret]: reads a new value; Enter keeps the current one.
ask() {
  local var="$1" prompt="$2" current="${!1}" shown answer=""
  if [[ -z "$current" ]]; then shown="none"; elif [[ -n "${3:-}" ]]; then shown="set"; else shown="$current"; fi
  if [[ -n "${3:-}" ]]; then
    read -rsp "$prompt [$shown]: " answer || true
    echo
  else
    read -rp "$prompt [$shown]: " answer || true
  fi
  if [[ -n "$answer" ]]; then printf -v "$var" '%s' "$answer"; fi
}

ask NOTION_TOKEN "Notion connection token (Notion › Settings › Connections)" secret
if [[ -z "$NOTION_TOKEN" ]]; then
  echo "A Notion token is required." >&2
  exit 1
fi
ask GH_TOKEN "GitHub token of the bot's machine user (only for opening PRs; Enter to skip)" secret
[[ -n "$BOT_WORKERS" ]] || BOT_WORKERS=2
ask BOT_WORKERS "Claude workers at once"
[[ -n "$BOT_TESTERS" ]] || BOT_TESTERS=1
ask BOT_TESTERS "Tests at once (each web run is a card's own servers and events processor; 1 is safe)"
# VHA's "✅ Tasks" (database c41db9df-9eae-467d-92d2-5211e065d117); only another board needs a change.
[[ -n "$NOTION_DATA_SOURCE_ID" ]] || NOTION_DATA_SOURCE_ID=393974e4-e036-4daa-85b5-54dabbac00e9
ask NOTION_DATA_SOURCE_ID "Tasks data source id (Enter keeps VHA's board)"

mkdir -p "$BOT_DIR"
(
  umask 077
  {
    printf '# Written by deno task bot:setup — owner-only; never commit.\n'
    printf 'NOTION_TOKEN=%q\n' "$NOTION_TOKEN"
    printf 'NOTION_DATA_SOURCE_ID=%q\n' "$NOTION_DATA_SOURCE_ID"
    if [[ -n "$GH_TOKEN" ]]; then printf 'GH_TOKEN=%q\n' "$GH_TOKEN"; fi
    printf 'BOT_WORKERS=%q\n' "$BOT_WORKERS"
    printf 'BOT_TESTERS=%q\n' "$BOT_TESTERS"
  } > "$env_file.tmp"
)
mv "$env_file.tmp" "$env_file"
chmod 600 "$env_file"
echo "✔ Wrote $env_file"

# ── Notion ───────────────────────────────────────────────────────────────────────────────────────
if ! check=$(notion check); then
  echo "Notion refused the token, or the Tasks database is not connected to it:" >&2
  echo "open ✅ Tasks in Notion › ••• › Connections › add your connection, then re-run deno task bot:setup." >&2
  exit 1
fi
echo "✔ Connected as $(jq -r .connection <<<"$check"), and Tasks is readable"

while read -r line; do
  echo "✗ $line — change it by hand in Notion"
done < <(jq -r '.wrongType[] | "\(.name) is \(.actual), the bot needs \(.expected)"' <<<"$check")

missing_props=$(jq -r '.missing | join(", ")' <<<"$check")
if [[ -n "$missing_props" ]]; then
  echo "Tasks lacks these bot properties: $missing_props"
  read -rp "Add them to Tasks now? [y/N]: " answer || true
  if [[ "$answer" =~ ^[Yy] ]]; then
    notion add-properties >/dev/null
    echo "✔ Added $missing_props"
  else
    echo "Left Tasks unchanged — the bot needs them before it can run."
  fi
else
  echo "✔ Tasks has every bot property"
fi

# ── GitHub ───────────────────────────────────────────────────────────────────────────────────────
if [[ -n "$GH_TOKEN" ]]; then
  echo "✔ GitHub token set"
else
  echo "✗ No GH_TOKEN: the bot cannot open PRs until one is set (re-run deno task bot:setup)"
fi

# ── databases ────────────────────────────────────────────────────────────────────────────────────
# Each card gets a dev and a test database, restored from db/dumps/latest and migrated
# (bot/lib/resources.sh). Without either, a card is blocked with the reason, not retried.
if db_server_ready; then
  echo "✔ Postgres at $(db_base_url) answers"
else
  echo "✗ The Postgres at $(db_base_url) is not reachable: docker compose up -d postgres, in $BOT_CHECKOUT" >&2
fi
if dump_reason=$(dump_check); then
  echo "✔ ${BOT_DB_DUMP:-$BOT_CHECKOUT/db/dumps/latest} is a readable dump, newer than $BOT_DUMP_MAX_AGE_DAYS days"
else
  echo "✗ $dump_reason" >&2
  echo "  Make it: deno task docker db:rebuild && deno task docker db:dump > ./db/dumps/latest (in $BOT_CHECKOUT)" >&2
fi

cat <<'NEXT'

Next: deno task bot:start, then tick `Bot` on one throwaway card (Status Not started) and follow it with
  deno task bot:watch
NEXT
