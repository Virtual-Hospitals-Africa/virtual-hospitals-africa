#! /usr/bin/env bash
set -eo pipefail

# shellcheck source=.env disable=SC1091
source .env
HTTP_SERVER_PORT=${HTTP_SERVER_PORT:-8004}

fail() {
  >&2 echo "$@"
  exit 1
}

MAX_PARALLEL_TESTS=8
parallel_opts="--parallel"


# On non-CI builds ensure the .env starts with .env.local or .env.docker
# (.env is built by concatenating one of those with .env.extra, so compare only
# up through the source file's line count)
env_prefix_matches() {
  local source="$1"
  local bytes
  bytes=$(( $(wc -c < "$source") ))
  head -c "$bytes" .env | cmp --silent - "$source"
}

# On CI builds set MAX_PARALLEL_TESTS=2
# On non-CI builds ensure the .env matches either .env.local or .env.docker
if [[ "${CI:-}" == "true" ]]; then
  MAX_PARALLEL_TESTS=2
  parallel_opts=""
elif [ -f .env.local ] && [ -f .env.docker ]; then
  env_prefix_matches .env.local || env_prefix_matches .env.docker || fail $'.env differs from .env.local and .env.docker\nrun deno task switch:local before running tests'
elif [ -f .env.local ]; then
  env_prefix_matches .env.local || fail $'.env differs from .env.local\nrun deno task switch:local before running tests'
elif [ -f .env.docker ]; then
  env_prefix_matches .env.docker || fail $'.env differs from .env.docker\nrun deno task switch:docker before running tests'
fi

use_test_servers=false
run_test_server_args=""
test_servers_were_already_running=false
test_servers_pid=

script_flags=(--use-build --no-parallel --verbose)

handle_script_flag() {
  case "$1" in
    --use-build)  run_test_server_args="--use-build" ;;
    --no-parallel) parallel_opts="" ;;
    --verbose)    set -x ;;
  esac
}

remaining_args=()
for arg in "$@"; do
  if [[ " ${script_flags[*]} " == *" $arg "* ]]; then
    handle_script_flag "$arg"
  else
    remaining_args+=("$arg")
  fi
done
set -- "${remaining_args[@]}"

# Resolve arguments: if an arg doesn't look like a file path, try to find a matching test file
# by searching for describe/describeParallel blocks with that name
resolved_args=()
for arg in "$@"; do
  # If arg is a test file, or starts with -- (flag), use it as-is
  if [[ "$arg" == *.test.ts || "$arg" == *.test.tsx || "$arg" == --* ]]; then
    resolved_args+=("$arg")
  elif [[ -d "$arg" && "$arg" == test/* ]]; then
    resolved_args+=("$arg")
  else
    # Try to find a test file with a matching describe/describeParallel block
    # Escape regex special characters in arg for grep
    escaped_arg=$(printf '%s' "$arg" | sed -e 's/\[/\\[/g' -e 's/\]/\\]/g' -e 's/\./\\./g' -e 's/\*/\\*/g' -e 's/\^/\\^/g' -e 's/\$/\\$/g')
    match=$(grep -rl "['\"]${escaped_arg}['\"]" test/ 2>/dev/null | head -1 || true)
    if [[ -n "$match" ]]; then
      resolved_args+=("$match")
    else
      # Fall back to original arg (let deno test handle the error)
      resolved_args+=("$arg")
    fi
  fi
done

# Replace positional parameters with resolved args
set -- "${resolved_args[@]}"

# Collect paths passed via --ignore / --ignore=<path>
ignored_paths=()
next_is_ignore=false
for arg in "${resolved_args[@]}"; do
  if $next_is_ignore; then
    ignored_paths+=("$arg")
    next_is_ignore=false
  elif [[ "$arg" == --ignore=* ]]; then
    ignored_paths+=("${arg#--ignore=}")
  elif [[ "$arg" == --ignore ]]; then
    next_is_ignore=true
  fi
done

is_ignored() {
  local path="$1"
  for ignored in "${ignored_paths[@]}"; do
    if [[ "$path" == "$ignored" || "$path" == "$ignored"/* ]]; then
      return 0
    fi
  done
  return 1
}

if [[ $# -eq 0 ]]; then
  if ! is_ignored "test/web"; then
    use_test_servers=true
  fi
else
  for arg in "$@"; do
    if [[ "$arg" == "test/web" || "$arg" == test/web/* ]]; then
      if ! is_ignored "$arg"; then
        use_test_servers=true
        break
      fi
    fi
  done
fi

if lsof -i "tcp:$HTTP_SERVER_PORT" > /dev/null; then
  test_servers_were_already_running=true
fi

cleanup() {
  if ! [ -z $test_servers_pid ]; then
    ./scripts/general-bash/kill_process_on_port.sh "$HTTP_SERVER_PORT" || true
    kill $test_servers_pid > /dev/null || true
  fi
}

run_tests() {
  DENO_TLS_CA_STORE=system \
  IS_TEST=true \
  MAX_PARALLEL_TESTS=$MAX_PARALLEL_TESTS \
  deno test \
    -A \
    --unstable-temporal \
    --env \
    --unsafely-ignore-certificate-errors \
    --ignore=test/chatbot \
    $parallel_opts \
    "$@"
}

trap cleanup EXIT

if $use_test_servers; then
  if ! $test_servers_were_already_running; then
    ./scripts/test/run_servers.sh "$run_test_server_args" &
    test_servers_pid="$!"
  else
    : >"/tmp/vha_server.log"
    : >"/tmp/vha_events.log"
  fi
fi

mkdir -p "./logs/slow_queries"

run_tests "$@"
