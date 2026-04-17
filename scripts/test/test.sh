#! /usr/bin/env bash
set -eo pipefail

# shellcheck source=.env disable=SC1091
source .env
HTTP_SERVER_PORT=${HTTP_SERVER_PORT:-8004}
HTTPS_PROXY_SERVER_PORT=${HTTPS_PROXY_SERVER_PORT:-8005}
MARKETING_HTTP_SERVER_PORT=${MARKETING_HTTP_SERVER_PORT:-8006}

fail() {
  >&2 echo "$@"
  exit 1
}

MAX_PARALLEL_TESTS=8
parallel_opts="--parallel"


# On CI builds set MAX_PARALLEL_TESTS=2
# On non-CI builds ensure the .env matches either .env.local or .env.docker
if [[ "${CI:-}" == "true" ]]; then
  MAX_PARALLEL_TESTS=2
  parallel_opts=""
elif [ -f .env.local ] && [ -f .env.docker ]; then
  cmp --silent .env .env.local || cmp --silent .env .env.docker || fail $'.env differs from .env.local and .env.docker\nrun deno task switch:local before running tests'
elif [ -f .env.local ]; then
  cmp --silent .env .env.local || fail $'.env differs from .env.local\nrun deno task switch:local before running tests'
elif [ -f .env.docker ]; then
  cmp --silent .env .env.docker || fail $'.env differs from .env.docker\nrun deno task switch:docker before running tests'
fi

need_web_servers=false
need_marketing_server=false
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
    need_web_servers=true
  fi
  if ! is_ignored "test/marketing"; then
    need_marketing_server=true
  fi
else
  for arg in "$@"; do
    if [[ "$arg" == "test/web" || "$arg" == test/web/* ]]; then
      if ! is_ignored "$arg"; then
        need_web_servers=true
      fi
    fi
    if [[ "$arg" == "test/marketing" || "$arg" == test/marketing/* ]]; then
      if ! is_ignored "$arg"; then
        need_marketing_server=true
      fi
    fi
  done
fi

if lsof -i "tcp:$HTTP_SERVER_PORT" > /dev/null && lsof -i "tcp:$HTTPS_PROXY_SERVER_PORT" > /dev/null; then
  test_servers_were_already_running=true
fi

cleanup() {
  if ! [ -z $test_servers_pid ]; then
    if $need_web_servers; then
      ./scripts/general-bash/kill_process_on_port.sh "$HTTP_SERVER_PORT" || true
      ./scripts/general-bash/kill_process_on_port.sh "$HTTPS_PROXY_SERVER_PORT" || true
    fi
    if $need_marketing_server; then
      ./scripts/general-bash/kill_process_on_port.sh "$MARKETING_HTTP_SERVER_PORT" || true
    fi
    kill $test_servers_pid > /dev/null || true
  fi
}

run_tests() {
  DENO_TLS_CA_STORE=system \
  IS_TEST=true \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  MARKETING_HTTP_SERVER_PORT=$MARKETING_HTTP_SERVER_PORT \
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

server_args=()
if [[ -n "$run_test_server_args" ]]; then
  server_args+=("$run_test_server_args")
fi
if $need_web_servers && ! $need_marketing_server; then
  server_args+=("--main-only")
elif $need_marketing_server && ! $need_web_servers; then
  server_args+=("--marketing-only")
fi

if $need_web_servers || $need_marketing_server; then
  if ! $test_servers_were_already_running; then
    ./scripts/test/run_servers.sh "${server_args[@]}" &
    test_servers_pid="$!"
  fi
fi

mkdir -p "./logs/slow_queries"

run_tests "$@"
