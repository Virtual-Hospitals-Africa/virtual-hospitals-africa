# shellcheck shell=bash
# bot/lib/pr.sh — a card's PR, as the bot's GitHub machine user (docs/bot.md#a-done). Source after
# bot.sh and names.sh. GH_TOKEN reaches only the one gh or git command that needs it. Called in
# conditions, where set -e does not apply, so every step returns on failure.

gh_bot() { GH_TOKEN="${GH_TOKEN:-}" gh "$@"; }

# git_remote <worktree> <git args…>: git as the bot's GitHub machine user, over HTTPS, for the commands
# that reach GitHub. Never authenticates as whoever owns this machine's SSH key.
git_remote() {
  local wt="$1"
  shift
  GH_TOKEN="${GH_TOKEN:-}" git -C "$wt" -c credential.helper= -c 'credential.helper=!gh auth git-credential' "$@"
}

# remote_of <worktree>: the worktree's origin as an HTTPS URL.
remote_of() { https_remote_of "$(git -C "$1" config --get remote.origin.url)"; }

# pr_publish <worktree> <title> <body file>: pushes the branch to the HTTPS remote and prints its
# PR's URL — the open one, else a new one. The push never authenticates as whoever owns this machine's
# SSH key.
pr_publish() {
  local wt="$1" title="$2" body="$3" branch remote open
  branch=$(git -C "$wt" branch --show-current) || return 1
  remote=$(remote_of "$wt") || return 1
  git_remote "$wt" push -q "$remote" "HEAD:refs/heads/$branch" || return 1
  open=$(cd "$wt" && gh_bot pr list --head "$branch" --state open --json url -q '.[0].url') || return 1
  if [[ -n "$open" ]]; then
    echo "$open"
    return 0
  fi
  (cd "$wt" && gh_bot pr create --head "$branch" --title "$title" --body-file "$body")
}

# pr_comment <worktree> <url> <body file>: one comment on the PR.
pr_comment() {
  (cd "$1" && gh_bot pr comment "$2" --body-file "$3" >/dev/null)
}

# pr_merged <dir in the repo> <branch>: the URL of the branch's merged PR; nothing when it has none.
pr_merged() {
  (cd "$1" && gh_bot pr list --head "$2" --state merged --json url -q '.[0].url // empty')
}

# pr_ci <dir in the repo> <PR URL>: where the PR's checks on its head commit stand, as one tab-separated
# line: `passed <sha>`, `failed <sha> <the checks that failed>`, `pending`, or `none` when no check has
# started (a PR no workflow's paths cover, or one CI has not picked up yet).
pr_ci() {
  local view
  view=$(cd "$1" && gh_bot pr view "$2" --json headRefOid,statusCheckRollup) || return 1
  jq -r -f "$BOT_CODE/bot/lib/ci.jq" <<<"$view"
}
