#! /usr/bin/env bash
set -xeuo pipefail

declare -A commands
declare -A logs

run_in_background() { 
  local log_file=$(mktemp)
  script -q "$log_file" "$@" > /dev/null 2>&1 &
  local pid="$!"
  logs[$pid]="$log_file"
  commands[$pid]="$@"
}

run_in_background deno check
run_in_background deno fmt --check
run_in_background deno lint
run_in_background deno task camel

success=true
for pid in "${!logs[@]}"; do
  wait "$pid" || {
    echo "Error during ${commands[$pid]}"
    cat "${logs[$pid]}"
    success=false
  }
done

$success && echo "All checks passed"
