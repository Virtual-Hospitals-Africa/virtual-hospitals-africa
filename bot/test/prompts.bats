load helpers
setup() {
  export BOT_DIR="$BATS_TEST_TMPDIR/.bot" BOT_TS=ts
  stub ts 'case "$*" in
    *card-markdown*) printf "# Fix join link\n\n- Status: Not started\n\nThe join link 404s." ;;
    *comments*) echo "[{\"id\":\"c1\",\"created\":\"2026-10-06T10:00:00Z\",\"author\":\"Sam\",\"text\":\"Android only\",\"files\":[{\"name\":\"1-image\",\"url\":\"/tmp/inbox/c1/1-image\"}]}]" ;;
  esac'
  source "$(repo_root)/bot/lib/bot.sh"
  source "$(repo_root)/bot/lib/prompts.sh"
  WT="$BATS_TEST_TMPDIR/wt"; mkdir -p "$WT"
}

@test "the start prompt carries the card, its comments and the contract pointer" {
  run start_prompt page1 "$WT"
  [[ "$output" == *"# Fix join link"* ]]
  [[ "$output" == *"Sam"*"Android only"* ]]
  [[ "$output" == *"/tmp/inbox/c1/1-image"* ]]
  [[ "$output" == *"Follow bot/WORKER.md"* ]]
  grep -q "comments page1 --since  --into $WT/.vha/inbox" "$STUB_LOG"
}

@test "a failed deno test run is summed up by its summary line and its first error" {
  local run_dir="$WT/.vha/runs/r1"; mkdir -p "$run_dir"
  printf '%s\n' "running 2 tests from ./test/web/a.test.ts" "patients ... FAILED (1s)" "" " ERRORS " "" \
    "patients => ./test/web/a.test.ts:5:1" "error: AssertionError: Values are not equal." "" \
    "FAILED | 1 passed | 1 failed (2s)" "error: Test failed" > "$run_dir/command.log"
  run failure_summary "$run_dir" 1
  [ "$output" = 'exit 1 at `FAILED | 1 passed | 1 failed (2s)`: error: AssertionError: Values are not equal. (run r1)' ]
}

@test "a passing summary line is not mistaken for a failure's" {
  local run_dir="$WT/.vha/runs/r1"; mkdir -p "$run_dir"
  printf '%s\n' "ok | 4 passed | 0 failed (1s)" "the servers exited" > "$run_dir/command.log"
  run failure_summary "$run_dir" 1
  [[ "$output" == 'exit 1 at `ok | 4 passed | 0 failed (1s)`'* ]]
}

@test "any other failure is summed up by the log's last line, with no backtick left to break the span" {
  local run_dir="$WT/.vha/runs/r1"; mkdir -p "$run_dir"
  printf '%s\n' "> deno check" 'src/a.ts(3,1): error TS2304: Cannot find name `foo`.' "" > "$run_dir/command.log"
  run failure_summary "$run_dir" 2
  [ "$output" = "exit 2 at \`src/a.ts(3,1): error TS2304: Cannot find name 'foo'.\` (run r1)" ]
}

@test "a run that never made a run dir says so" {
  run failure_summary "" 3
  [ "$output" = "the run stopped before it started (exit 3)" ]
}
