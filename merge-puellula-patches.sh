#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-main}"
MERGED_BRANCH="puellula-merged"

echo "Fetching remote branches..."
git fetch --prune

# Get all remote branches matching Puellula-patch-<digits>, sorted numerically
PATCH_BRANCHES=$(git branch -r | grep -oE 'origin/Puellula-patch-[0-9]+' | sort -t- -k3 -n)

if [ -z "$PATCH_BRANCHES" ]; then
  echo "No branches matching 'Puellula-patch-<digits>' found on remote."
  exit 1
fi

echo "Found patch branches:"
echo "$PATCH_BRANCHES" | sed 's/^/  /'

# Create or reset the merged branch from base
if git show-ref --quiet "refs/heads/$MERGED_BRANCH"; then
  echo "Branch '$MERGED_BRANCH' already exists — deleting and recreating from '$BASE_BRANCH'..."
  git branch -D "$MERGED_BRANCH"
fi

git checkout -b "$MERGED_BRANCH" "$BASE_BRANCH"

# Cherry-pick the tip commit from each patch branch
for REMOTE_BRANCH in $PATCH_BRANCHES; do
  COMMIT=$(git rev-parse "$REMOTE_BRANCH")
  PATCH_NAME="${REMOTE_BRANCH#origin/}"
  echo "Cherry-picking $PATCH_NAME ($COMMIT)..."

  if ! git cherry-pick "$COMMIT"; then
    echo ""
    echo "Conflict during $PATCH_NAME — opening conflicted files in vi..."
    CONFLICTED=$(git diff --name-only --diff-filter=U)
    vi $CONFLICTED
    echo "Staging resolved files and continuing..."
    git add $CONFLICTED
    git cherry-pick --continue --no-edit
  fi
done

echo ""
echo "Done. Branch '$MERGED_BRANCH' contains all Puellula patches on top of '$BASE_BRANCH'."
