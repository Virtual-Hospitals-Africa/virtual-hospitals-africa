load helpers

sandbox_settings() { bash "$(repo_root)/host/sandbox-settings.sh" "$@"; }

setup() {
  export BOT_CHECKOUT="$BATS_TEST_TMPDIR/co" BOT_DIR="$BATS_TEST_TMPDIR/co/.bot" BOT_WORKTREES="$BATS_TEST_TMPDIR/wts"
  mkdir -p "$BOT_DIR"
  WT="$BOT_WORKTREES/bot_x_1"
}

@test "a worktree's settings sandbox it strictly, with no way back out" {
  run sandbox_settings "$WT"
  [ "$status" -eq 0 ]
  jq -e '.sandbox | .enabled == true and .failIfUnavailable == true and .allowUnsandboxedCommands == false and .excludedCommands == null' <<<"$output"
  jq -e '.permissions.disableBypassPermissionsMode == "disable"' <<<"$output"
}

@test "no Unix socket is allowed, and localhost is" {
  run sandbox_settings "$WT"
  jq -e '.sandbox.network | .allowAllUnixSockets == false and .allowUnixSockets == null and .allowLocalBinding == true' <<<"$output"
}

@test "every protected path is write-denied, in the checkout and the worktree, and Edit-denied" {
  run sandbox_settings "$WT"
  while read -r path; do
    path="${path%/\*\*}"
    jq -e --arg p "$BOT_CHECKOUT/$path" '.sandbox.filesystem.denyWrite | index($p)' <<<"$output"
    jq -e --arg p "$WT/$path" '.sandbox.filesystem.denyWrite | index($p)' <<<"$output"
  done < <(sed -e 's/#.*//' -e 's/[[:space:]]*$//' -e '/^$/d' "$(repo_root)/scripts/protected-paths.txt")
  jq -e --arg p "Edit(/$WT/bot/**)" '.permissions.deny | index($p)' <<<"$output"
}

@test "the bot's state and tokens are out of reach, the worktree's own .env is not" {
  run sandbox_settings "$WT"
  jq -e --arg d "$BOT_DIR" '.sandbox.filesystem | (.denyWrite | index($d)) and (.denyRead | index($d + "/bot.env"))' <<<"$output"
  jq -e --arg c "$BOT_CHECKOUT" '.sandbox.filesystem.denyRead | index($c + "/.env") and index($c + "/.env.*")' <<<"$output"
  run ! jq -e --arg w "$WT" '.sandbox.filesystem.denyRead | map(select(startswith($w))) | length > 0' <<<"$output"
}

@test "the checkout's .git is writable for the worktree's commits" {
  run sandbox_settings "$WT"
  jq -e --arg g "$BOT_CHECKOUT/.git" '.sandbox.filesystem.allowWrite | index($g)' <<<"$output"
}

@test "the managed settings cover every worktree under the worktrees folder" {
  run sandbox_settings --managed
  [ "$status" -eq 0 ]
  jq -e --arg p "$BOT_WORKTREES/*/bot" '.sandbox.filesystem.denyWrite | index($p)' <<<"$output"
  jq -e '.sandbox.failIfUnavailable == true' <<<"$output"
}

@test "it needs a worktree or --managed, not both and not neither" {
  run sandbox_settings
  [ "$status" -eq 2 ]
  run sandbox_settings --managed "$WT"
  [ "$status" -eq 2 ]
}

@test "another protected list is honoured" {
  printf 'only/this.txt\n' > "$BATS_TEST_TMPDIR/list"
  BOT_PROTECTED_PATHS="$BATS_TEST_TMPDIR/list" run sandbox_settings "$WT"
  jq -e --arg p "$WT/only/this.txt" '.sandbox.filesystem.denyWrite | index($p)' <<<"$output"
  run ! jq -e --arg p "$WT/bot" '.sandbox.filesystem.denyWrite | index($p)' <<<"$output"
}
