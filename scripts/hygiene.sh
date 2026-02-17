#!/usr/bin/env bash
# shellcheck disable=SC2329
set -uo pipefail

declare -A rules=(
  [rule_no_camel_case]="Found camelCase variable declarations:"
  [rule_no_node_imports]="Found node imports:"
  [rule_test_files_naming]="Files in /test that aren't tests nor helpers:"
  [rule_no_db_imports_in_frontend]="components/ and islands/ should never import from db/:"
  [rule_no_only_in_tests]="Found .only( in test files (remove before committing):"
  [rule_imports_at_the_start]="Found import statement later in the file"
)

rule_no_camel_case() {
  # Specific camelCase variable names that are allowed
  local allowed_camel_case_variables=(
    createCommand
    loadMore
    getEmployees
    onClick
    defaultValue
    tableClassName
    tdClassName
    clipPath
  )

  # Functions/patterns that create functions, so `const getById = model.getById` is fine
  local function_creators=(
    spy
    stub
    memoize
    ruleRunner
    once
    logArgsOnError
    deduplicate
    simpleBaseQuery
    cacheable
    'model\.'
    'pick\('
  )

  # Build the negative lookaheads for allowed variable names
  local allowed_pattern=""
  for name in "${allowed_camel_case_variables[@]}"; do
    allowed_pattern+="(?!${name})"
  done

  # Build the negative lookaheads for function creators
  local creators_pattern=""
  for creator in "${function_creators[@]}"; do
    creators_pattern+="(?! ${creator})"
  done

  local pattern="const ${allowed_pattern}([a-z]\w*[A-Z]\w*)(:| =| of| in)(?! \(.+\) =>)(?! \(\))(?! async)${creators_pattern}\s"

  ! rg -n --pcre2 --color=always "$pattern" --glob '**/*.ts' --glob '**/*.tsx'
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

rule_imports_at_the_start() {
  # Flag inline import() type expressions (e.g. import('./types.ts').Foo) outside of actual import statements
  ! rg -n --pcre2 --color=always '^\s*(?!import\b).*\bimport\(' --glob '**/*.ts' --glob '**/*.tsx' --glob '!util.ts' --glob '!repl.ts' --glob '!scripts/generate_repl.ts' --glob '!db/migrate.ts' --glob '!db/seed/run.ts'
}

rule_no_only_in_tests() {
  ! rg -n --pcre2 --color=always '^(?!\s*\/\/).*(?:\.only\(|only:\s*true)' test --glob '!test/_helpers/*'
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
