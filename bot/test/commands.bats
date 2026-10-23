load helpers
setup() {
  use_bot_dir
  admit "$CARD_A"
  with_worktree "$CARD_A" "$BOT_WORKTREES/bot_fix_a"
}
last_event() { tail -1 "$BOT_DIR/events.jsonl"; }

@test "bot:kill withdraws a card named by its branch, after asking" {
  run bash "$(repo_root)/bot/kill.sh" bot_fix_a <<<"n"
  [[ "$output" == *"Left as it was"* ]]
  [ "$(events_of card.withdrawn)" = 0 ]
  bash "$(repo_root)/bot/kill.sh" bot_fix_a --yes
  [ "$(last_event | jq -c '[.type, .by]')" = '["card.withdrawn","kill"]' ]
}

@test "bot:kill refuses a card it does not know" {
  run bash "$(repo_root)/bot/kill.sh" nope --yes
  [ "$status" -ne 0 ]
  [[ "$output" == *"no card known as nope"* ]]
}

@test "bot:test queues a hand run only while the card is idle" {
  emit worker.launched "$CARD_A"
  run bash "$(repo_root)/bot/test.sh" "${CARD_A//-/}" -- deno task test test/models
  [ "$status" -ne 0 ]
  [[ "$output" == *"the card is Working"* ]]
  emit worker.outcome "$CARD_A" --arg kind ask --arg file /w/o.json
  bash "$(repo_root)/bot/test.sh" "${CARD_A//-/}" --no-servers -- deno task test test/models
  [ "$(last_event | jq -c '[.type, .command, .servers]')" = '["test.requested","deno task test test/models",false]' ]
}

@test "bot:test starts the web servers for a command that needs them, or when told to" {
  emit worker.launched "$CARD_A"
  emit worker.outcome "$CARD_A" --arg kind ask --arg file /w/o.json
  bash "$(repo_root)/bot/test.sh" "${CARD_A//-/}" -- deno task test test/web/patients
  [ "$(last_event | jq -c '[.command, .servers]')" = '["deno task test test/web/patients",true]' ]
  bash "$(repo_root)/bot/test.sh" "${CARD_A//-/}" -- deno task test --ignore=test/web
  [ "$(last_event | jq -c '.servers')" = false ]
  bash "$(repo_root)/bot/test.sh" "${CARD_A//-/}" --servers -- bash scripts/check_pages.sh
  [ "$(last_event | jq -c '.servers')" = true ]
}

attach_world() {
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  tmux -L bats new-session -d -s vhabot -n events sleep 600
}
teardown() { tmux -L bats kill-server 2>/dev/null || true; }

@test "bot:clearall removes every worktree, drops every bot database and no other, and forgets the log" {
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  git_world
  export BOT_CHECKOUT="$CHECKOUT"
  printf '%s\n' vha_dev vha_test vha_dev_bot_3ec91359 vha_test_bot_3ec91359 vha_dev_bot_deadbeef > "$PG_DBS"
  run bash "$(repo_root)/bot/clearall.sh" --yes
  [ "$status" -eq 0 ]
  [ "$(paste -sd' ' "$PG_DBS")" = "vha_dev vha_test" ]
  [ ! -e "$BOT_WORKTREES/bot_fix_a" ]
  [ ! -e "$BOT_DIR/events.jsonl" ]
}

# bot:attach runs with no terminal, so tmux refuses to attach: given one, it would take over the
# terminal of whoever runs bats.
@test "bot:attach makes the session, with the bot and events windows and the sidebar's hooks, when there is none" {
  export TMUX_TMPDIR="$BATS_TEST_TMPDIR" BOT_TMUX_SOCKET=bats
  run bash "$(repo_root)/bot/attach.sh" </dev/null
  [ "$(tmux -L bats list-windows -t vhabot -F '#W #{window_panes}' | tr '\n' ,)" = "bot 2,events 1," ]
  [[ "$(tmux -L bats show-hooks -g client-attached)" == *"bot/sidebar.sh place"* ]]
  [[ "$(tmux -L bats show-hooks -g session-window-changed)" == *"bot/sidebar.sh place"* ]]
}

@test "bot:attach puts back a fixed window somebody closed" {
  attach_world
  run bash "$(repo_root)/bot/attach.sh" </dev/null
  [ "$(tmux -L bats list-windows -t vhabot -F '#W' | sort | tr '\n' ,)" = "bot,events," ]
}

@test "bot:attach to a card with no worker running points to its session instead" {
  attach_world
  run bash "$(repo_root)/bot/attach.sh" bot_fix_a
  [ "$status" -ne 0 ]
  [[ "$output" == *"no worker is running on \"Fix $CARD_A\""*"bot:resume bot_fix_a"* ]]
}

@test "bot:attach refuses a card it does not know" {
  attach_world
  run bash "$(repo_root)/bot/attach.sh" nope
  [ "$status" -ne 0 ]
  [[ "$output" == *"no card known as nope"* ]]
}
