load helpers
setup() {
  use_bot_dir
  git_world
  export BOT_CHECKOUT="$CHECKOUT"
  source "$(repo_root)/bot/lib/bot.sh"
  SUPERVISOR="$(repo_root)/bot/tester-supervisor.sh"
  export BOT_TESTER="$BATS_TEST_TMPDIR/tester.sh" BOT_POLL_SECONDS=1

  admit "$CARD_A"; with_worktree "$CARD_A" "$BOT_WORKTREES/a"
  emit worker.launched "$CARD_A"
  echo '{"kind":"run","command":"true"}' > "$BOT_WORKTREES/a/.vha/o.json"
  emit worker.outcome "$CARD_A" --arg kind run --arg file "$BOT_WORKTREES/a/.vha/o.json"
  REQUEST=$(wc -l < "$BOT_DIR/events.jsonl" | tr -d ' ')
}
teardown() {
  local f
  for f in "$BOT_WORKTREES"/*/.vha/tester.pid; do [[ -e "$f" ]] && stop_recorded "$f"; done
  return 0
}
tester_does() {
  printf '#!/usr/bin/env bash\nsource "%s/bot/lib/bot.sh"\necho "$*" > "%s/tester-args"\n%s\n' \
    "$(repo_root)" "$BATS_TEST_TMPDIR" "$1" > "$BOT_TESTER"
}
supervise() { BOT_LOOPS="$1" bash "$SUPERVISOR" >"$BATS_TEST_TMPDIR/supervisor.log" 2>&1; }

@test "starts a waiting test with its card and request, and nothing about phones" {
  tester_does 'sleep 30'
  supervise 1
  [ "$(bot_state card "$CARD_A" | jq -c '[.state, .tester]')" = "[\"Testing\",{\"request\":$REQUEST,\"tester\":1}]" ]
  [ "$(cat "$BATS_TEST_TMPDIR/tester-args")" = "$CARD_A --request $REQUEST" ]
  [ ! -e "$BOT_DIR/state.json" ]
}

@test "runs one test at a time with one slot, the next waiting its turn" {
  admit "$CARD_B"; with_worktree "$CARD_B" "$BOT_WORKTREES/b"
  emit worker.launched "$CARD_B"
  echo '{"kind":"run","command":"true"}' > "$BOT_WORKTREES/b/.vha/o.json"
  emit worker.outcome "$CARD_B" --arg kind run --arg file "$BOT_WORKTREES/b/.vha/o.json"
  tester_does 'sleep 30'
  BOT_TESTERS=1 supervise 2
  [ "$(events_of test.launched)" = 1 ]
  [ "$(bot_state card "$CARD_B" | jq -r .state)" = "Queued for test run" ]
}

@test "a test that ends without its event is recorded as interrupted and run again" {
  tester_does 'exit 0'
  supervise 4
  [ "$(events_of test.interrupted)" -ge 1 ]
  [ "$(events_of test.launched)" -ge 2 ]
}

@test "a test that reports its result is not run again" {
  tester_does 'emit test.finished "$1" --argjson request "$3" --arg kind run --argjson runDir null --argjson exitCode 0 --argjson failure null'
  supervise 3
  [ "$(events_of test.launched)" = 1 ]
  [ "$(events_of test.interrupted)" = 0 ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Queued ]
}

@test "a test left running by an earlier supervisor is stopped and recorded as interrupted" {
  tester_does 'sleep 30'
  emit test.launched "$CARD_A" --argjson request "$REQUEST" --argjson tester 1
  spawn "$BOT_WORKTREES/a/.vha/tester.pid" sleep 60
  orphan=$SPAWNED
  supervise 1
  run ! kill -0 "$orphan"
  [ "$(events_of test.interrupted)" = 1 ]
}

@test "the servers a test left behind in its worktree are stopped with it" {
  tester_does 'exit 0'
  # stack_kill lists the processes working in the worktree through lsof and kills the deno and node ones.
  stub lsof 'exit 0'
  supervise 3
  grep -q "^lsof" "$STUB_LOG"
}
