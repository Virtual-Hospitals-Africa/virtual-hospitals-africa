#! /usr/bin/env bash
set -euo pipefail

pattern=$1
shift

# Function to beep
beep() {
  printf '\a'
}

# Function to run the script and monitor for errors
run_script() {
  while IFS= read -r line; do
    echo "$line"
    if [[ $line =~ $pattern ]]; then
      beep
    fi
  done
}

# Run the script and monitor for errors
"$@" 2>&1 | run_script