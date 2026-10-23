#!/usr/bin/env bash
# Refuses a worktree whose branch changed a protected path (docs/bot.md#security).
#   scripts/protected-gate.sh [worktree]
# exit 0: clean · 2: the branch changed a protected path (listed on stdout, two spaces in) · 1: it
# could not tell. The protected paths are the lines of scripts/protected-paths.txt (BOT_PROTECTED_PATHS
# names another list). Call it after origin/main is merged into the branch: what main changed in a
# protected path is then not the branch's.
set -euo pipefail

worktree="${1:-.}"
list="${BOT_PROTECTED_PATHS:-$(dirname "${BASH_SOURCE[0]}")/protected-paths.txt}"
[[ -f "$list" ]] || { echo "protected-gate: $list does not exist" >&2; exit 1; }

# A `dir/**` line is the directory itself, which a git pathspec takes to mean everything under it.
mapfile -t paths < <(sed -e 's/#.*//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e '/^$/d' -e 's|/\*\*$||' "$list")
if (( ${#paths[@]} == 0 )); then
  echo "protected-gate: no paths in $list" >&2
  exit 1
fi

cd "$worktree"
base=$(git merge-base origin/main HEAD) || { echo "protected-gate: no merge base with origin/main" >&2; exit 1; }
changed=$( {
  git diff --name-only "$base" HEAD -- "${paths[@]}"
  git diff --name-only HEAD -- "${paths[@]}"
  git ls-files --others --exclude-standard -- "${paths[@]}"
} | sort -u)
if [[ -n "$changed" ]]; then
  echo "protected-gate: this branch changes protected paths; a human must make this change:"
  while IFS= read -r file; do echo "  $file"; done <<<"$changed"
  exit 2
fi
