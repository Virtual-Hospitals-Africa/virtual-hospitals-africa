#! /usr/bin/env bash
set -euo pipefail

which rg > /dev/null || {
  echo "Install ripgrep"
  echo "$ brew install ripgrep"
  exit 1
}

# Note that we can ignore specific variable names like onClick at the front
# and we can ignore functions/pattenrs that return functions at the back like const getById = model.getById
camel_case_const_pattern='const (?!loadMore)(?!getEmployees)(?!onClick)(?!defaultValue)(?!tableClassName)(?!tdClassName)([a-z]\w*[A-Z]\w*) (=|of|in)(?! \(\))(?! async)(?! spy)(?! stub)(?! memoize)(?! logArgsOnError)(?! deduplicate)(?! cacheable)(?! \(.+\) =>)(?! model\.)(?! pick\()\s'

if rg --pcre2 "$camel_case_const_pattern"; then
  exit 1
fi

# TODO: rename script and/or parallelize rules?
if rg --pcre2 "node:console" --glob '!scripts/hygiene.sh'; then
  exit 1
fi

in_test_dir_but_not_tests=$(
  find test -type f \
    ! -name '*test.ts' \
    ! -name '*test.tsx' \
    ! -path 'test/_helpers/*' \
    ! -name '_setup.ts' \
    ! -name '.DS_Store' \
    ! -path 'test/_route.ts'
)

if [[ -n "$in_test_dir_but_not_tests" ]]; then
  echo "Files in /test that aren't tests nor helpers:"
  echo "$in_test_dir_but_not_tests"
  exit 1
fi

# components/ and islands/ should never import from db/
db_imports_in_frontend=$(rg --pcre2 "from ['\"].*db/" components islands 2>/dev/null || true)
if [[ -n "$db_imports_in_frontend" ]]; then
  echo "components/ and islands/ should never import from db/:"
  echo "$db_imports_in_frontend"
  exit 1
fi

# No .only( in test files (prevents accidentally committing focused tests)
only_in_tests=$(rg --pcre2 '\.only\(' test 2>/dev/null || true)
if [[ -n "$only_in_tests" ]]; then
  echo "Found .only( in test files (remove before committing):"
  echo "$only_in_tests"
  exit 1
fi
