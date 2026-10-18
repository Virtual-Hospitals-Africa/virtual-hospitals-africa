load helpers
setup() {
  RUN_CHECKS="$(repo_root)/bot/lib/run-checks.sh"
  WT="$BATS_TEST_TMPDIR/wt"
  git init -q -b main "$WT"
  git -C "$WT" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
}

run_checks() { cd "$WT" && run bash "$RUN_CHECKS"; }

@test "runs every check, each as its own section of the log" {
  stub deno 'echo "ran $*"'
  run_checks
  [ "$status" -eq 0 ]
  for section in typecheck fmt lint hygiene test-non-web; do [[ "$output" == *"── $section ✔"* ]]; done
  [[ "$output" == *"ran check"* ]]
  [[ "$output" == *"ran fmt --check"* ]]
  [[ "$output" == *"ran lint"* ]]
  [[ "$output" == *"ran task hygiene"* ]]
  [[ "$output" == *"ran task test --ignore=test/web"* ]]
}

@test "the tests run with a few files at a time, since cards share the machine" {
  stub deno 'echo "jobs=${DENO_JOBS:-unset} $*"'
  run_checks
  [[ "$output" == *"jobs=2 task test --ignore=test/web"* ]]
}

@test "--list names the checks, one a line, and runs none of them" {
  stub deno 'exit 1'
  run bash "$RUN_CHECKS" --list
  [ "$status" -eq 0 ]
  [ "$output" = "$(printf 'typecheck\nfmt\nlint\nhygiene\ntest-non-web')" ]
  [ ! -e "$STUB_LOG" ]
}

@test "runs them side by side" {
  stub deno 'sleep 3'
  start=$SECONDS
  run_checks
  [ "$status" -eq 0 ]
  (( SECONDS - start < 10 ))
}

@test "a failure is the last line, with the check's own last line, and stops the checks still running" {
  stub deno 'case "$*" in lint) echo "3 problems"; exit 1 ;; "task test"*) sleep 62 ;; esac'
  start=$SECONDS
  run_checks
  [ "$status" -eq 1 ]
  (( SECONDS - start < 30 ))
  [[ "$output" == *"── lint ✘"* ]]
  [ "${lines[-1]}" = "checks failed: lint — 3 problems" ]
  run ! pgrep -f "sleep 62"
}

@test "a TERM stops every check, and says what each had written" {
  stub deno 'echo "started $*"; sleep 63'
  cd "$WT"
  bash "$RUN_CHECKS" > "$BATS_TEST_TMPDIR/out" 2>&1 &
  runner=$!
  sleep 2
  kill -TERM "$runner"
  wait "$runner" || true
  run ! pgrep -f "sleep 63"
  grep -q "── test-non-web stopped" "$BATS_TEST_TMPDIR/out"
  grep -q "started task test --ignore=test/web" "$BATS_TEST_TMPDIR/out"
}
