#!/usr/bin/env bash
# shellcheck disable=SC2329
set -uo pipefail

declare -A rules=(
  [rule_no_camel_case]="Found camelCase variable declarations:"
  [rule_no_node_imports]="Found node imports:"
  [rule_test_files_naming]="Files in /test that aren't tests nor helpers:"
  [rule_no_db_imports_in_frontend]="components/ and islands/ should never import from db/:"
  [rule_no_only_in_tests]="Found .only( in test files (remove before committing):"
)

rule_no_camel_case() {
  # Note that we can ignore specific variable names like onClick at the front
  # and we can ignore functions/patterns that return functions at the back like const getById = model.getById
  ! rg -n --pcre2 --color=always 'const (?!createCommand)(?!loadMore)(?!getEmployees)(?!onClick)(?!defaultValue)(?!tableClassName)(?!tdClassName)([a-z]\w*[A-Z]\w*)(:| =| of| in)(?! \(.+\) =>)(?! \(\))(?! async)(?! spy)(?! stub)(?! memoize)(?! once)(?! logArgsOnError)(?! deduplicate)(?! simpleBaseQuery)(?! cacheable)(?! model\.)(?! pick\()\s' --glob '**/*.ts' --glob '**/*.tsx'
}

rule_no_node_imports() {
  ! rg -n --pcre2 --color=always "from 'node:" --glob '!scripts/hygiene.sh'
}

rule_test_files_naming() {
  ! find test -type f \
    ! -name '*test.ts' \
    ! -name '*test.tsx' \
    ! -path 'test/_helpers/*' \
    ! -name '_setup.ts' \
    ! -name '.DS_Store' \
    ! -path 'test/_route.ts' \
    | grep .
}

rule_no_db_imports_in_frontend() {
  ! rg -n --pcre2 --color=always "from ['\"].*db/" components islands util shared
}

rule_no_only_in_tests() {
  ! rg -n --pcre2 --color=always '\.only\(|only:\s*true' test --glob '!test/_helpers/*'
}

# Main: run all rules in parallel and collect results
main() {

  # Ensure ripgrep installed
  which rg > /dev/null || {
    echo "Install ripgrep"
    echo "$ brew install ripgrep"
    exit 1
  }

  # Verify all non-main functions are registered
  local defined_fns
  defined_fns=$(declare -F | awk '{print $3}' | grep -v 'main')
  for fn in $defined_fns; do
    if ! [[ -v rules[$fn] ]]; then
      echo "ERROR: Rule function '$fn' has no entry in rules array"
      exit 1
    fi
  done

  local tmpdir
  tmpdir=$(mktemp -d)
  trap 'rm -rf "$tmpdir"' EXIT

  # Run each rule in background, capturing output to temp files
  local pids=()
  for rule in "${!rules[@]}"; do
    $rule > "$tmpdir/$rule" 2>&1 &
    pids+=($!)
  done

  # Wait for all and collect exit codes
  local failed=0
  for pid in "${pids[@]}"; do
    if ! wait "$pid"; then
      failed=1
    fi
  done

  # Print output from any failed rules (non-empty files)
  for rule in "${!rules[@]}"; do
    if [[ -s "$tmpdir/$rule" ]]; then
      echo "${rules[$rule]}"
      cat "$tmpdir/$rule"
      echo
    fi
  done

  exit $failed
}

main
