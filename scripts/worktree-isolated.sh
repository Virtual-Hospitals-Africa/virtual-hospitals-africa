#!/usr/bin/env bash
set -e

# Usage: ./scripts/worktree-isolated.sh <branch-name> [prompt]
# Example: ./scripts/worktree-isolated.sh fix-bug "Fix the authentication bug in the login flow"

if [ -z "$1" ]; then
  echo "Error: Branch name is required" >&2
  echo "Usage: $0 <branch-name> [prompt]" >&2
  exit 1
fi

BRANCH_NAME="$1"

# Assert branch name is in camelCase format
if ! [[ "$BRANCH_NAME" =~ ^[a-z][a-z_0-9]*$ ]]; then
  echo "Error: Branch name must be in snake_case format in order to be used as part of a database name" >&2
  echo "Provided: $BRANCH_NAME" >&2
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

if [ ! -f "$latest_dump" ]; then
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
  echo "Worktree already exists at $WORKTREE_DIR"

  [ -f "$WORKTREE_DIR/.env.local" ] || { 
    echo "no .env.local file found in ${WORKTREE_DIR}" >&2
    exit 1
  }
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

  sed "s/vha_dev/vha_dev_${BRANCH_NAME}/g" .env.docker > "$WORKTREE_DIR/.env.local"
  increment_port_counter_file_and_write_its_contents_to_env

  cat "$WORKTREE_DIR/.env.local"
  ln -s  "$latest_dump" "$WORKTREE_DIR/db/dumps/latest"

  cd "$WORKTREE_DIR"
  cat ".env.local"
  deno install --allow-scripts

  cat ".env.local"
  deno task local db:create
  deno task local db:restore latest
fi

echo "$WORKTREE_DIR"
