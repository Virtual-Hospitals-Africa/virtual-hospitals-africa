# shellcheck shell=bash
# bot/lib/names.sh — Source it.

# branch_for <title> <page id>: bot_<slug>_<the page id's 32 hex>, snake_case as git and the
# worktree directory need; the full id, so no two cards ever share one.
branch_for() {
  local slug
  slug=$(printf '%s' "$1" | LC_ALL=C tr '[:upper:]' '[:lower:]' | LC_ALL=C sed -E 's/[^a-z0-9]+/_/g; s/^_+//' |
    cut -c1-30 | sed -E 's/_+$//')
  [[ "$slug" =~ ^[a-z] ]] || slug="card${slug:+_$slug}"
  printf 'bot_%s_%s\n' "$slug" "$(printf '%s' "$2" | tr -d '-')"
}

# https_remote_of <git remote URL>: the same GitHub repo as an HTTPS URL, so a push authenticates
# with the bot's token rather than this machine's SSH key.
https_remote_of() {
  local path
  case "$1" in
    git@github.com:*) path="${1#git@github.com:}" ;;
    ssh://git@github.com/*) path="${1#ssh://git@github.com/}" ;;
    https://github.com/*) path="${1#https://github.com/}" ;;
    *)
      echo "names: not a GitHub remote: $1" >&2
      return 1
      ;;
  esac
  printf 'https://github.com/%s.git\n' "${path%.git}"
}
