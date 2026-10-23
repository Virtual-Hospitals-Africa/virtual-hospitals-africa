load helpers
setup() {
  use_bot_dir
  git_world
  TESTER="$(repo_root)/bot/tester.sh"
  export BOT_CHECKOUT="$CHECKOUT"
  ORIGIN="$BATS_TEST_TMPDIR/origin.git"
  WT="$BOT_WORKTREES/bot_fix_a"
  git clone -q "$ORIGIN" "$WT" 2>/dev/null
  git -C "$WT" config user.email t@t
  git -C "$WT" config user.name t
  # scripts/test/run_servers.sh as the repo's: this one records how it was started, makes the logs the
  # real one makes in ./logs under CI=true, writes a marker the test's command can look for, and runs.
  mkdir -p "$WT/scripts/test"
  cat > "$WT/scripts/test/run_servers.sh" <<'SH'
#!/usr/bin/env bash
echo "CI=${CI:-} http=$HTTP_SERVER_PORT https=$HTTPS_PROXY_SERVER_PORT args=$*" > servers.started
mkdir -p logs
echo "events up" > logs/events.log
echo "server up" > logs/server.log
if [[ -f servers.proxy ]]; then cp servers.proxy logs/proxy.log; else echo "proxy up" > logs/proxy.log; fi
trap 'echo stopped > servers.stopped; exit 0' TERM
while :; do sleep 0.2; done
SH
  echo ok > "$WT/notes.txt"
  printf '.vha/\nnode_modules/\nlogs/\nservers.*\n' > "$WT/.gitignore"
  git -C "$WT" add -A && git -C "$WT" commit -q -m init && git -C "$WT" push -q origin HEAD:main
  git -C "$WT" fetch -q origin && git -C "$WT" checkout -q -b bot_fix_a
  mkdir -p "$WT/.vha" "$WT/node_modules"
  # The card's ports (block 5: 21010 and 21011) and databases, as the worker supervisor made them.
  ports_env 5 "$CARD_A" > "$WT/.vha/ports.env"
  printf '%s\n' "$(card_db_dev "$CARD_A")" "$(card_db_test "$CARD_A")" >> "$PG_DBS"
  # The protected-path gate: protected paths are listed two-space-indented, exit 2, as the real one does.
  cat > "$BATS_TEST_TMPDIR/gate.sh" <<'SH'
#!/usr/bin/env bash
if [[ -e "$1/scripts/protected-gate.sh" ]]; then printf 'protected paths changed:\n  scripts/protected-gate.sh\n'; exit 2; fi
SH
  export BOT_PROTECTED_GATE="$BATS_TEST_TMPDIR/gate.sh"
  # What deps_refresh finds up to date, and a health check that answers.
  mkdir -p "$WT/node_modules"
  stub curl 'echo 200'
  admit "$CARD_A"
  emit worktree.created "$CARD_A" --arg path "$WT" --arg branch bot_fix_a --argjson portIndex 5
}

# requests <outcome json>: the worker asks for a test; REQUEST is its id, and a tester has taken it.
requests() {
  echo "$1" > "$WT/.vha/outcome-1.json"
  emit worker.launched "$CARD_A"
  emit worker.outcome "$CARD_A" --arg kind "$(jq -r .kind <<<"$1")" --arg file "$WT/.vha/outcome-1.json"
  REQUEST=$(wc -l < "$BOT_DIR/events.jsonl" | tr -d ' ')
  emit test.launched "$CARD_A" --argjson request "$REQUEST" --argjson tester 1
}
test_it() { bash "$TESTER" "$CARD_A" --request "$REQUEST"; }
last_event() { tail -1 "$BOT_DIR/events.jsonl"; }
# the first process holding the card's servers, if any is left
servers_left() { pgrep -f "$WT/scripts/test/run_servers.sh" >/dev/null; }

@test "runs a command in the card's worktree, on its ports and database, at the branch's commit, and reports how it ended" {
  requests '{"kind":"run","command":"echo web on $HTTP_SERVER_PORT/$HTTPS_PROXY_SERVER_PORT in $PWD with $DATABASE_URL; exit 3"}'
  test_it
  [ "$(last_event | jq -c '[.type, .exitCode, .kind]')" = '["test.finished",3,"run"]' ]
  run_dir=$(last_event | jq -r .runDir)
  grep -q "web on 21010/21011 in $WT with .*/vha_dev_bot_3ec91359$" "$run_dir/command.log"
  [ "$(jq -r .sha "$run_dir/run.json")" = "$(git -C "$WT" rev-parse HEAD)" ]
  [ "$(jq -c '[.exitCode, .servers, .ports.http, .ports.https, .database]' "$run_dir/run.json")" = '[3,false,21010,21011,"vha_dev_bot_3ec91359"]' ]
  [ "$(readlink "$WT/.vha/runs/latest")" = "$(basename "$run_dir")" ]
  [[ "$(last_event | jq -r .failure)" == "exit 3"* ]]
  grep -q " test │ web on 21010/21011" "$WT/.vha/card.log"
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Queued ]
  # No servers for a command that did not ask for them.
  [ ! -e "$WT/servers.started" ]
}

@test "a passing command reports exit 0 with no failure" {
  requests '{"kind":"run","command":"true"}'
  test_it
  [ "$(last_event | jq -c '[.exitCode, .failure]')" = '[0,null]' ]
}

@test "a command only sees the isolated environment: no token the bot reads" {
  requests '{"kind":"run","command":"echo token=${GH_TOKEN:-none}/${NOTION_TOKEN:-none}"}'
  GH_TOKEN=secret NOTION_TOKEN=secret test_it
  grep -q "token=none/none" "$(last_event | jq -r .runDir)/command.log"
}

@test "a human's hand run goes the same way and is reported as one" {
  emit test.requested "$CARD_A" --arg command 'echo hand' --argjson servers false
  REQUEST=$(wc -l < "$BOT_DIR/events.jsonl" | tr -d ' ')
  emit test.launched "$CARD_A" --argjson request "$REQUEST" --argjson tester 1
  test_it
  [ "$(last_event | jq -c '[.type, .kind, .exitCode]')" = '["test.finished","hand",0]' ]
}

@test "merges origin/main first, and sends a conflict back to the worker" {
  git -C "$WT" checkout -q main && echo theirs > "$WT/notes.txt" && git -C "$WT" commit -qam theirs && git -C "$WT" push -q origin main && git -C "$WT" checkout -q bot_fix_a
  echo ours > "$WT/notes.txt" && git -C "$WT" commit -qam ours
  requests '{"kind":"run","command":"true"}'
  test_it
  [ "$(last_event | jq -r .type)" = test.conflicted ]
  [ -z "$(git -C "$WT" status --porcelain --untracked-files=no)" ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Queued ]
}

@test "refuses a branch that changed a protected path" {
  mkdir -p "$WT/scripts" && echo 'exit 0' > "$WT/scripts/protected-gate.sh"
  git -C "$WT" add -A && git -C "$WT" commit -qm "loosen the gate"
  requests '{"kind":"run","command":"true"}'
  test_it
  [ "$(last_event | jq -c '[.type, .files]')" = '["test.refused",["scripts/protected-gate.sh"]]' ]
  [ "$(bot_state card "$CARD_A" | jq -r .state)" = Blocked ]
}

@test "a command that asks for the servers gets them started on the card's ports with CI=true, runs against them, and leaves none running" {
  requests '{"kind":"run","servers":true,"command":"test -e servers.started && echo up: $(cat servers.started)"}'
  test_it
  run_dir=$(last_event | jq -r .runDir)
  [ "$(last_event | jq -r .exitCode)" = 0 ]
  grep -q "up: CI=true http=21010 https=21011 args=$" "$run_dir/command.log"
  [ "$(jq .servers "$run_dir/run.json")" = true ]
  # They are stopped when the run ends, and their logs kept with it, for the next run truncates them.
  run servers_left
  [ "$status" -ne 0 ]
  [ -e "$WT/servers.stopped" ]
  [ "$(cat "$run_dir/events.log")" = "events up" ]
  [ "$(cat "$run_dir/server.log")" = "server up" ]
  [ "$(cat "$run_dir/proxy.log")" = "proxy up" ]
  grep -q "the servers answered /health-check" "$run_dir/servers.log"
}

@test "a command that names test/web needs the servers without saying so" {
  requests '{"kind":"run","command":"test -e servers.started # deno task test test/web/patients"}'
  test_it
  [ "$(last_event | jq -r .exitCode)" = 0 ]
}

@test "servers that never get healthy fail the run, say so, and are stopped" {
  stub curl 'echo 000'
  requests '{"kind":"run","servers":true,"command":"true"}'
  SERVERS_READY_SECONDS=2 test_it
  [ "$(last_event | jq -r .exitCode)" = 70 ]
  [[ "$(last_event | jq -r .failure)" == *"web servers were not healthy"* ]]
  grep -q "not healthy after 2s" "$(last_event | jq -r .runDir)/servers.log"
  run servers_left
  [ "$status" -ne 0 ]
}

@test "a command with --use-build builds the app first and has the servers serve the build" {
  stub deno 'exit 0'
  requests '{"kind":"run","servers":true,"command":"deno task test --use-build test/web/x.test.ts"}'
  test_it
  grep -q "^deno task build" "$STUB_LOG"
  grep -q "args=--use-build" "$WT/servers.started"
}

@test "a failed web run whose proxy log has empty-header responses names the known bare-400 flake, and is still a failure" {
  requests '{"kind":"run","servers":true,"command":"echo \"[400]\"; exit 1"}'
  echo 'headers: Headers {}' > "$WT/servers.proxy"
  test_it
  [ "$(last_event | jq -r .exitCode)" = 1 ]
  [[ "$(last_event | jq -r .failure)" == *"1 responses with empty headers, the known bare-400 flake"* ]]
  grep -q "known bare-400 flake" "$WT/.vha/card.log"
}

@test "a failed run without the signature does not mention the flake" {
  requests '{"kind":"run","servers":true,"command":"exit 1"}'
  test_it
  [[ "$(last_event | jq -r .failure)" != *"bare-400"* ]]
}

@test "a command that dies with the servers up is stopped, and the run fails with the servers' logs named" {
  requests '{"kind":"run","servers":true,"command":"pkill -f run_servers.sh; sleep 30"}'
  test_it
  [ "$(last_event | jq -r .exitCode)" = 1 ]
  [[ "$(last_event | jq -r .failure)" == *"web servers exited during the run"* ]]
}

@test "a run past the cap is stopped and reported as timed out" {
  requests '{"kind":"run","command":"sleep 30"}'
  BOT_TEST_CAP_SECONDS=2 test_it
  [ "$(last_event | jq -r .exitCode)" = 124 ]
  [[ "$(last_event | jq -r .failure)" == *"-minute cap"* ]]
}

@test "a worktree with uncommitted changes is not tested" {
  requests '{"kind":"run","command":"true"}'
  echo changed > "$WT/notes.txt"
  test_it
  [ "$(last_event | jq -r .exitCode)" = 70 ]
  [[ "$(last_event | jq -r .failure)" == *"uncommitted changes"* ]]
}

@test "databases that are gone are not tested against" {
  requests '{"kind":"run","command":"true"}'
  : > "$PG_DBS"
  test_it
  [ "$(last_event | jq -r .exitCode)" = 70 ]
  [[ "$(last_event | jq -r .failure)" == *"databases"*"are not there"* ]]
}

@test "a step that fails unexpectedly is the test's failure, not a silent exit" {
  requests '{"kind":"run","command":"true"}'
  # Past the checks, at the first step of the run: a runs directory nothing can be made in.
  mkdir "$WT/.vha/runs" && chmod a-w "$WT/.vha/runs"
  run test_it
  chmod u+w "$WT/.vha/runs"
  [ "$(last_event | jq -c '[.type, .exitCode]')" = '["test.finished",70]' ]
  [[ "$(last_event | jq -r .failure)" == *"stopped unexpectedly"* ]]
}

@test "a worktree with no ports of its own is not tested" {
  rm "$WT/.vha/ports.env"
  requests '{"kind":"run","command":"true"}'
  test_it
  [ "$(last_event | jq -c '[.type, .exitCode]')" = '["test.finished",70]' ]
  [[ "$(last_event | jq -r .failure)" == *"has no .vha/ports.env"* ]]
}

@test "a TERM stops the command and the servers, and records no result" {
  requests '{"kind":"run","servers":true,"command":"sleep 60"}'
  bash "$TESTER" "$CARD_A" --request "$REQUEST" &
  tester=$!
  wait_for 20 test -e "$WT/servers.started"
  sleep 1
  kill -TERM "$tester"
  wait "$tester" || true
  run servers_left
  [ "$status" -ne 0 ]
  [ "$(events_of test.finished)" = 0 ]
  [ "$(jq .exitCode "$WT/.vha/runs/latest/run.json")" = 143 ]
}
