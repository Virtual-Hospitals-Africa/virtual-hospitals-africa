#!/usr/bin/env bash
set -e

# Usage: ./scripts/worktree-claude.sh <branch-name> [prompt]
# Example: ./scripts/worktree-claude.sh fix-bug "Fix the authentication bug in the login flow"

if [ -z "$1" ]; then
  echo "Error: Branch name is required"
  echo "Usage: $0 <branch-name> [prompt]"
  exit 1
fi

BRANCH_NAME="$1"
PROMPT="$2"
WORKTREE_DIR="../vha-worktrees/$BRANCH_NAME"

# Create worktree directory if it doesn't exist
mkdir -p "../vha-worktrees"

# Check if worktree already exists
if [ -d "$WORKTREE_DIR" ]; then
  echo "Worktree already exists at $WORKTREE_DIR"
  cd "$WORKTREE_DIR"
else
  # Check if branch exists remotely or locally
  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "Checking out existing local branch: $BRANCH_NAME"
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
    echo "Checking out existing remote branch: origin/$BRANCH_NAME"
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
  else
    echo "Creating new branch: $BRANCH_NAME from main"
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" main
  fi

  cd "$WORKTREE_DIR"
fi

# If prompt provided, run Claude Code with full permissions and create PR
if [ -n "$PROMPT" ]; then
  echo "Running Claude Code with prompt: $PROMPT"
  echo "This will run with all permissions and create a PR when done..."

  # Run Claude Code with the prompt, auto-approving all permissions
  # The --yes flag (if available) or we pipe 'yes' to auto-approve
  echo "$PROMPT

When you're done:
1. Commit all changes with an appropriate commit message including 'Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>'
2. Push the branch to remote
3. Create a PR using: gh pr create --fill" | claude --yes 2>/dev/null || echo "$PROMPT

When you're done:
1. Commit all changes with an appropriate commit message including 'Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>'
2. Push the branch to remote
3. Create a PR using: gh pr create --fill" | claude
else
  # Just drop into Claude Code interactively
  echo "Starting Claude Code in worktree: $WORKTREE_DIR"
  claude
fi
