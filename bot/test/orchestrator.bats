load helpers
setup() {
  use_bot_dir
  export BOT_CHILD_DIR="$BATS_TEST_TMPDIR/children" BOT_RESTART_DELAY=0
  mkdir -p "$BOT_CHILD_DIR"
  for child in notion-reader notion-writer gh-reader claude-worker-supervisor tester-supervisor; do
    child_does "$child" 'sleep 60 & wait'
  done
}
teardown() { [[ -n "${ORCH:-}" ]] && kill "$ORCH" 2>/dev/null; wait 2>/dev/null; return 0; }

# child_does <name> <bash>: what that child of the orchestrator does; each start is counted.
child_does() {
  printf '#!/usr/bin/env bash\necho x >> "%s/%s.starts"\ntrap "exit 0" TERM\n%s\n' "$BATS_TEST_TMPDIR" "$1" "$2" > "$BOT_CHILD_DIR/$1.sh"
}
starts() { wc -l < "$BATS_TEST_TMPDIR/$1.starts" | tr -d ' '; }
orchestrate() {
  bash "$(repo_root)/bot/orchestrator.sh" 2>"$BATS_TEST_TMPDIR/orchestrator.log" &
  ORCH=$!
}
gave_up() { [ "$(jq -r --arg n "$1" '.[] | select(.name == $n) | .gaveUp' "$BOT_DIR/processes.json" 2>/dev/null)" = true ]; }
started_at_least() { [[ -e "$BATS_TEST_TMPDIR/$1.starts" ]] && (( $(starts "$1") >= $2 )); }

@test "starts one of each and says so in processes.json" {
  orchestrate
  wait_for 10 started_at_least tester-supervisor 1
  wait_for 10 test -s "$BOT_DIR/processes.json"
  [ "$(jq '[.[] | select(.pid != null)] | length' "$BOT_DIR/processes.json")" = 5 ]
}

@test "restarts a child that exits" {
  child_does notion-writer 'if [[ ! -e "'"$BATS_TEST_TMPDIR"'/crashed" ]]; then touch "'"$BATS_TEST_TMPDIR"'/crashed"; exit 3; fi; sleep 60 & wait'
  orchestrate
  wait_for 10 started_at_least notion-writer 2
  run ! gave_up notion-writer
}

@test "leaves a child down after five exits in five minutes, and keeps the others" {
  child_does tester-supervisor 'exit 3'
  orchestrate
  wait_for 10 gave_up tester-supervisor
  [ "$(starts tester-supervisor)" = 5 ]
  [ "$(starts claude-worker-supervisor)" = 1 ]
  kill -0 "$ORCH"
  grep -q "leaving it down" "$BATS_TEST_TMPDIR/orchestrator.log"
}

@test "stopping it stops every child" {
  orchestrate
  wait_for 10 started_at_least tester-supervisor 1
  wait_for 10 test -s "$BOT_DIR/processes.json"
  pids=$(jq -r '.[].pid' "$BOT_DIR/processes.json")
  kill -TERM "$ORCH"
  wait "$ORCH"
  for pid in $pids; do run ! kill -0 "$pid"; done
}
