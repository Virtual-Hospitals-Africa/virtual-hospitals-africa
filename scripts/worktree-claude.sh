#!/usr/bin/env bash
set -xeuo pipefail

usage() {
  cat <<EOF
Usage: $0 [--skipdb] <branch-name> <prompt>

Create a git worktree, run Claude Code with the given prompt, retry failing
tests up to twice, then commit and open a pull request.

Arguments:
  branch-name   Name of the new branch (created from the current branch).
  prompt        Instructions to pass to Claude Code. The first line is also
                used as the git commit message.

Options:
  --skipdb      Skip creating a separate database. The worktree will use the
                same DATABASE_URL as the main .env.docker file.

Examples:
  $0 fix-auth-bug "Fix the authentication bug in the login flow"
  $0 add-search  "Add full-text search to the products table"
  $0 --skipdb fix-typo "Fix typo in the README"
EOF
}

SKIPDB_FLAG=""
if [ "${1:-}" = "--skipdb" ]; then
  SKIPDB_FLAG="--skipdb"
  shift
fi

if [ $# -lt 2 ]; then
  usage
  exit 1
fi

BRANCH_NAME="$1"
PROMPT="$2"

COMMIT_MESSAGE=$(echo "${PROMPT}" | head -n 1)

WORKTREE_DIR=$(./scripts/worktree-isolated.sh $SKIPDB_FLAG "$BRANCH_NAME")

cd "$WORKTREE_DIR"

echo "Running Claude Code with prompt: $PROMPT"
echo "This will run with all permissions and create a PR when done..."

echo "$PROMPT" | claude --dangerously-skip-permissions

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
  retry_prompt="A recent Claude instance attempted to implement a prompt, but now tests are breaking.
Your job is to read the original prompt, read the test output, assess what has changed, and get the tests to pass.

ORIGINAL PROMPT:

${PROMPT}

TEST OUTPUT:

${test_output}

SERVER LOG FILE (relevant for failures in test/web):
$log_file"

  rm "$test_output"
  echo "Asking Claude to fix the issues..."
  echo -e "$retry_prompt" | claude --dangerously-skip-permissions
done

if ! $tests_passed; then
  echo "Max attempts reached"
  exit 1
fi

git add .
git commit -m "${COMMIT_MESSAGE}"
git push
gh pr create --fill
