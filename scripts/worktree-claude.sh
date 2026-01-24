#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/worktree-claude.sh <branch-name> [prompt]
# Example: ./scripts/worktree-claude.sh fix-bug "Fix the authentication bug in the login flow"

if [ -z "$1" ]; then
  echo "Error: Branch name is required"
  echo "Usage: $0 <branch-name> <prompt>"
  exit 1
fi

if [ -z "$2" ]; then
  echo "Error: Prompt is required"
  echo "Usage: $0 <branch-name> <prompt>"
  exit 1
fi

BRANCH_NAME="$1"
PROMPT="$2"

COMMIT_MESSAGE=$(echo "${PROMPT}" | head -n 1)

WORKTREE_DIR=$(./scripts/worktree-isolated.sh "$BRANCH_NAME")

cd "$WORKTREE_DIR"

echo "Running Claude Code with prompt: $PROMPT"
echo "This will run with all permissions and create a PR when done..."

  # Run Claude Code with the prompt, auto-approving all permissions
  # The --yes flag (if available) or we pipe 'yes' to auto-approve
echo "$PROMPT" | claude --yes 2>/dev/null

attempts=0
max_attempts=2
tests_passed=false

while true; do
  attempts=$((attempts + 1))
  echo "Running tests (attempt $attempts/$max_attempts)..."

  # Capture test output to a temporary file
  test_output=$(mktemp)
  if deno task test > "$test_output" 2>&1; then
    echo "Tests passed!"
    rm "$test_output"
    tests_passed=true
    break
  fi
  
  echo "Tests failed on attempt $attempts"

  if [ $attempts -gt $max_attempts ]; then
    break
  fi

  # Extract log file path from output
  log_file=$(grep -o "Server output available at [^ ]*" "$test_output" | sed 's/Server output available at //')

  if [ ! -n "$log_file" ]; then
    echo "No server log file found in output"
    exit 1
  fi

  echo "Found server log at: $log_file"
  retry_prompt="The tests failed. Check the log file at $log_file for what went wrong and then continue to work on the original prompt.\n${PROMPT}"

  rm "$test_output"
  echo "Asking Claude to fix the issues..."
  echo -e "$retry_prompt" | claude --yes 2>/dev/null
done

if ! $tests_passed; then
  echo "Max attempts reached"
  exit 1
fi

git add .
git commit -m "${COMMIT_MESSAGE}"
git push
gh pr create --fill
