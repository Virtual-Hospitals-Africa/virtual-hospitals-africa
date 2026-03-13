#!/usr/bin/env bash
set -euo pipefail

# Check that we're not on the main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
  echo "Error: You are currently on the main branch. This script should be run from a different branch."
  exit 1
fi

echo "Current branch: $current_branch"

# Save the current branch
original_branch="$current_branch"

# Checkout to main branch
echo "Checking out to main branch..."
git checkout main

# Run migration to snomed_inferred
echo "Running migration to snomed_inferred..."
deno task local db:migrate to snomed_inferred

# Switch back to original branch
echo "Switching back to branch: $original_branch"
git checkout "$original_branch"

# Rebuild the database
echo "Rebuilding database..."
deno task local db:rebuild

echo "Done!"
