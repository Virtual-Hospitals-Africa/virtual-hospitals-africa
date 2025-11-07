#! /usr/bin/env bash
set -euo pipefail

pattern='const (?!onClick)(?!defaultValue)([a-z]\w*[A-Z]\w*) (=|of|in)(?! \(\))(?! async)(?! memoize)(?! cacheable)(?! \(.+\) =>)(?! model\.)(?! pick\()\s'
count_log_file=camelCase.log

count_camelCase_variables() {
  rg -c --pcre2 "$pattern"
}

echo_files_that_now_have_more_camelCase_variables_than_before() {
  # Use process substitution to compare old and new counts
  # Print files where current count > old count (treating missing files as having count 0)
  awk -F: 'NR==FNR {old[$1]=$2; next} !($1 in old) && $2 > 0 {print $1} $1 in old && $2 > old[$1] {print $1}' \
    "$1" \
    "$2"
}

test_that_number_of_camelCase_variables_has_not_increased_logging_a_count_file_if_so() {
  # shellcheck disable=SC2155
  local current_counts=$(mktemp)
  count_camelCase_variables > "$current_counts"

  files_with_more=$(echo_files_that_now_have_more_camelCase_variables_than_before $count_log_file "$current_counts")

  if [ ! -n "$files_with_more" ]; then
    mv "$current_counts" $count_log_file
    exit 0
  fi

  echo "Files with more camelCase variables than before:"
  echo "$files_with_more" | xargs rg --pcre2 --with-filename "$pattern"
  exit 1
}

if [ $# -eq 1 ] && [ "$1" == "--test-and-log" ]; then
  test_that_number_of_camelCase_variables_has_not_increased_logging_a_count_file_if_so
else
  rg --pcre2 "$pattern" "$@"
fi
