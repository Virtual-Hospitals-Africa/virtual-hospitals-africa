#! /usr/bin/env bash
set -euo pipefail

which rg > /dev/null || {
  echo "Install ripgrep"
  echo "$ brew install ripgrep"
  exit 1
}

# Note that we can ignore specific variable names like onClick at the front
# and we can ignore functions/pattenrs that return functions at the back like const getById = model.getById
camel_case_const_pattern='const (?!loadMore)(?!getEmployees)(?!onClick)(?!defaultValue)(?!tableClassName)(?!tdClassName)([a-z]\w*[A-Z]\w*) (=|of|in)(?! \(\))(?! async)(?! spy)(?! stub)(?! memoize)(?! deduplicate)(?! cacheable)(?! \(.+\) =>)(?! model\.)(?! pick\()\s'

! rg --pcre2 "$camel_case_const_pattern"

# TODO: rename script and/or parallelize rules?
! rg --pcre2 "node:console" --glob '!scripts/grep_camelCase_variables.sh'
