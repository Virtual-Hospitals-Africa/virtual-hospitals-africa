#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/worktree-isolated.sh [--skipdb] <branch-name> [prompt]
# Example: ./scripts/worktree-isolated.sh fix-bug "Fix the authentication bug in the login flow"
# Example: ./scripts/worktree-isolated.sh --skipdb fix-bug "Fix the authentication bug in the login flow"
#
# Options:
#   --skipdb    Skip creating a separate database. The worktree will use the same
#               DATABASE_URL as the main .env.docker file.

SKIP_DB=false
if [ "$1" = "--skipdb" ]; then
  SKIP_DB=true
  shift
fi

if [ -z "$1" ]; then
  echo "Error: Branch name is required" >&2
  echo "Usage: $0 [--skipdb] <branch-name> [prompt]" >&2
  exit 1
fi

BRANCH_NAME="$1"

# Assert branch name is in snake_case format (required for database naming unless --skipdb)
if [ "$SKIP_DB" = false ] && ! [[ "$BRANCH_NAME" =~ ^[a-z][a-z_0-9]*$ ]]; then
  echo "Error: Branch name must be in snake_case format in order to be used as part of a database name" >&2
  echo "Provided: $BRANCH_NAME" >&2
  echo "Hint: Use --skipdb to skip database creation and allow any branch name" >&2
  exit 1
fi

WORKTREE_DIR="../vha-worktrees/$BRANCH_NAME"

# Create worktree directory if it doesn't exist
mkdir -p "../vha-worktrees"
port_counter="../vha-worktrees/port_counter"
if [ ! -f $port_counter ]; then
  cat <<EOF > $port_counter
HTTP_SERVER_PORT=8004
HTTPS_PROXY_SERVER_PORT=8005
EOF
fi

start_dir=$(pwd)
latest_dump="${start_dir}/db/dumps/latest"

if [ "$SKIP_DB" = false ] && [ ! -f "$latest_dump" ]; then
  echo "Need a latest dump to make a worktree. Please run" >&2
  echo "deno task db:rebuild && deno task db:dump > ./db/dumps/latest" >&2
  exit 1
fi

increment_port_counter_file_and_write_its_contents_to_env() {
  # Read current port values
  # shellcheck source=../vha-worktree/port_counter
  source "$port_counter"

  # Increment ports by 2
  HTTP_SERVER_PORT=$((HTTP_SERVER_PORT + 2))
  HTTPS_PROXY_SERVER_PORT=$((HTTPS_PROXY_SERVER_PORT + 2))

  # Write incremented values back to port_counter file
  cat <<EOF > "$port_counter"
HTTP_SERVER_PORT=$HTTP_SERVER_PORT
HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT
EOF

  cat <<EOF >> "$WORKTREE_DIR/.env.local"

HTTP_SERVER_PORT=$HTTP_SERVER_PORT
HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT
EOF
}

# Check if worktree already exists
if [ -d "$WORKTREE_DIR" ]; then
  echo "Worktree already exists at $WORKTREE_DIR"  >&2

  [ -f "$WORKTREE_DIR/.env.local" ] || { 
    echo "no .env.local file found in ${WORKTREE_DIR}" >&2
    exit 1
  }
  cd "$WORKTREE_DIR"
else
  # Check if branch exists remotely or locally
  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "Checking out existing local branch: $BRANCH_NAME" >&2
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME" >&2
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
    echo "Checking out existing remote branch: origin/$BRANCH_NAME" >&2
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME" >&2
  else
    echo "Creating new branch: $BRANCH_NAME from main" >&2
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" main >&2
  fi

  if $SKIP_DB; then
    # Use the same DATABASE_URL as the main project
    cp .env.docker "$WORKTREE_DIR/.env"
  else
    # Create a separate database with a modified DATABASE_URL
    sed "s/vha_dev/vha_dev_${BRANCH_NAME}/g" .env.docker > "$WORKTREE_DIR/.env"
  fi

  increment_port_counter_file_and_write_its_contents_to_env

  cd "$WORKTREE_DIR"
  deno install --allow-scripts >&2

  if ! $SKIP_DB; then
    ln -s "$latest_dump" "$WORKTREE_DIR/db/dumps/latest" 
    deno task local db:create >&2
    deno task local db:restore latest >&2
  fi
fi

echo "$WORKTREE_DIR"
