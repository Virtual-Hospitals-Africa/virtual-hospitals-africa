load helpers
setup() {
  ROOT="$(repo_root)"
  export BOT_DIR="$BATS_TEST_TMPDIR/.bot" BOT_TS=ts
  export CHECK_JSON='{"connection":"VHA Bot","missing":[],"wrongType":[]}'
  stub ts 'case "$*" in
    *" check"*) echo "$CHECK_JSON" ;;
    *add-properties*) echo "{\"added\":[\"Bot\"]}" ;;
  esac'
  for tool in claude gh tmux deno docker pg_restore curl lsof; do stub "$tool" 'true'; done
  stub_postgres
  # setup.sh looks tools up on the bot's PATH: the stubs, and only what this machine has of the rest.
  export BOT_PATH="$BATS_TEST_TMPDIR/stubs:$(dirname "$(command -v node)"):$(dirname "$(command -v jq)"):/usr/bin:/bin"
  export BOT_CHECKOUT="$ROOT"
  ENV_FILE="$BOT_DIR/bot.env"
}
setup_with() { run bash "$ROOT/bot/setup.sh" <<<"$1"; }

@test "writes bot.env from the answers, readable only by its owner" {
  setup_with $'secret_n\nghp_x\n\n\n'
  [ "$status" -eq 0 ]
  [ "$(stat -f %Lp "$ENV_FILE")" = 600 ]
  ( source "$ENV_FILE"; [ "$NOTION_TOKEN" = secret_n ]; [ "$GH_TOKEN" = ghp_x ]; [ "$BOT_WORKERS" = 2 ]; [ "$BOT_TESTERS" = 1 ] )
  [[ "$output" == *"VHA Bot"* ]]
  run ! grep -q secret_n <<<"$output"
}

@test "says the GitHub token is set, and makes no label" {
  setup_with $'secret_n\nghp_x\n\n\n'
  [ "$status" -eq 0 ]
  [[ "$output" == *"GitHub token set"* ]]
  run ! grep -q "^gh label" "$STUB_LOG"
}

@test "without a GitHub token it says why PRs cannot be opened" {
  setup_with $'secret_n\n\n\n\n'
  [ "$status" -eq 0 ]
  [[ "$output" == *"No GH_TOKEN"* ]]
}

@test "Enter keeps the values already in bot.env" {
  mkdir -p "$BOT_DIR"
  printf 'NOTION_TOKEN=old_n\nNOTION_DATA_SOURCE_ID=old_s\nGH_TOKEN=old_g\nBOT_WORKERS=3\nBOT_TESTERS=2\n' > "$ENV_FILE"
  setup_with $'\n\n\n\n'
  [ "$status" -eq 0 ]
  ( source "$ENV_FILE"; [ "$NOTION_TOKEN" = old_n ]; [ "$GH_TOKEN" = old_g ]; [ "$BOT_WORKERS" = 3 ]; [ "$BOT_TESTERS" = 2 ]; [ "$NOTION_DATA_SOURCE_ID" = old_s ] )
}

@test "the Tasks data source defaults to VHA's board, and another can be given" {
  setup_with $'secret_n\n\n\n\n\n'
  [ "$status" -eq 0 ]
  ( source "$ENV_FILE"; [ "$NOTION_DATA_SOURCE_ID" = 393974e4-e036-4daa-85b5-54dabbac00e9 ] )
  setup_with $'\n\n\n\nother-source\n'
  [ "$status" -eq 0 ]
  ( source "$ENV_FILE"; [ "$NOTION_DATA_SOURCE_ID" = other-source ] )
  setup_with $'\n\n\n\n\n\n'
  ( source "$ENV_FILE"; [ "$NOTION_DATA_SOURCE_ID" = other-source ] )
}

@test "a Notion token is required" {
  setup_with $'\n\n\n\n'
  [ "$status" -ne 0 ]
  [[ "$output" == *"Notion token is required"* ]]
  [ ! -e "$ENV_FILE" ]
}

@test "offers to add missing board properties, and adds them on yes" {
  export CHECK_JSON='{"connection":"VHA Bot","missing":["Bot","PR"],"wrongType":[]}'
  setup_with $'secret_n\n\n\n\n\ny\n'
  [ "$status" -eq 0 ]
  [[ "$output" == *"Bot, PR"* ]]
  grep -q "add-properties" "$STUB_LOG"
}

@test "declining leaves the board alone" {
  export CHECK_JSON='{"connection":"VHA Bot","missing":["Bot"],"wrongType":[]}'
  setup_with $'secret_n\n\n\n\n\nn\n'
  run ! grep -q "add-properties" "$STUB_LOG"
}

@test "properties of the wrong type are reported for a human to fix" {
  export CHECK_JSON='{"connection":"VHA Bot","missing":[],"wrongType":[{"name":"PR","expected":"url","actual":"rich_text"}]}'
  setup_with $'secret_n\n\n\n\n'
  [[ "$output" == *"PR is rich_text, the bot needs url"* ]]
}

@test "a rejected token or unconnected board is explained" {
  stub ts 'exit 1'
  setup_with $'secret_n\n\n\n\n'
  [ "$status" -ne 0 ]
  [[ "$output" == *"Connections"* ]]
}

@test "checks the Postgres and the database dump every card's databases are made from" {
  setup_with $'secret_n\n\n\n\n'
  [ "$status" -eq 0 ]
  [[ "$output" == *"Postgres at"*"answers"* ]]
  [[ "$output" == *"is a readable dump"* ]]
}

@test "says what to do when the Postgres is down or the dump is missing, and still finishes" {
  stub psql 'exit 2'
  rm "$BOT_DB_DUMP"
  setup_with $'secret_n\n\n\n\n'
  [ "$status" -eq 0 ]
  [[ "$output" == *"is not reachable"* ]]
  [[ "$output" == *"does not exist"* ]]
  [[ "$output" == *"db:dump > ./db/dumps/latest"* ]]
}

@test "missing tools are named before anything is asked" {
  local bin="$BATS_TEST_TMPDIR/bin"; mkdir -p "$bin"
  for tool in jq node git; do ln -s "$(command -v "$tool")" "$bin/$tool"; done
  PATH="$bin:/usr/bin:/bin" BOT_PATH="$bin:/usr/bin:/bin" run "$(command -v bash)" "$ROOT/bot/setup.sh" <<<$'secret_n\n'
  [ "$status" -ne 0 ]
  [[ "$output" == *claude* ]]
  [[ "$output" == *pg_restore* ]]
  [ ! -e "$ENV_FILE" ]
}
