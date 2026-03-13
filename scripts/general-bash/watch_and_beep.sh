#! /usr/bin/env bash
set -euo pipefail

# The first argument is the pattern to watch for, the rest is the script to run
pattern=$1
shift

beep() {
  printf '\a'
}

# Echo each line of output, and beep if it matches the pattern
watch_output() {
  while IFS= read -r line; do
    echo "$line"
    if [[ $line =~ $pattern ]]; then
      beep
    fi
  done
}

# Run the script, piping stdout & stderr to the watch_output function
"$@" 2>&1 | watch_output