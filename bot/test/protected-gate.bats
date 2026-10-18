load helpers
setup() {
  GATE="$(repo_root)/scripts/protected-gate.sh"
  ORIGIN="$BATS_TEST_TMPDIR/origin.git"
  WT="$BATS_TEST_TMPDIR/wt"
  git init -q --bare -b main "$ORIGIN"
  git clone -q "$ORIGIN" "$WT" 2>/dev/null
  git -C "$WT" config user.email t@t
  git -C "$WT" config user.name t
  echo hi > "$WT/readme"
  git -C "$WT" add -A && git -C "$WT" commit -q -m init && git -C "$WT" push -q origin HEAD:main
  git -C "$WT" fetch -q origin
  git -C "$WT" checkout -q -b card
}

# change <file>...: each file written and committed on the card's branch.
change() {
  local file
  for file in "$@"; do
    mkdir -p "$(dirname "$WT/$file")" && echo "changed $file" > "$WT/$file"
  done
  git -C "$WT" add -A && git -C "$WT" commit -q -m "change $*"
}

@test "a branch that changes nothing protected passes, deno.json and the app's own scripts included" {
  change deno.json db/migrations/20261017000000_x.ts scripts/code-quality/remove-unused-imports.ts routes/a.tsx
  run bash "$GATE" "$WT"
  [ "$status" -eq 0 ]
}

@test "a protected file is refused, named two spaces in" {
  change scripts/code-quality/hygiene.sh scripts/code-quality/check.sh
  run bash "$GATE" "$WT"
  [ "$status" -eq 2 ]
  [ "$(sed -n 's/^  //p' <<<"$output")" = "$(printf 'scripts/code-quality/check.sh\nscripts/code-quality/hygiene.sh')" ]
}

@test "anything under a protected directory is refused: the bot, its host files, the workflows" {
  change bot/lib/x.sh host/y.json .github/workflows/main.yml
  run bash "$GATE" "$WT"
  [ "$status" -eq 2 ]
  [ "$(sed -n 's/^  //p' <<<"$output")" = "$(printf '.github/workflows/main.yml\nbot/lib/x.sh\nhost/y.json')" ]
}

@test "the bot's bats tests and unit tests are protected, other tests are not" {
  change bot/test/x.bats test/unit/bot/fold.test.ts test/models/patients.test.ts
  run bash "$GATE" "$WT"
  [ "$status" -eq 2 ]
  [ "$(sed -n 's/^  //p' <<<"$output")" = "$(printf 'bot/test/x.bats\ntest/unit/bot/fold.test.ts')" ]
}

@test "the gate and its own list are protected" {
  change scripts/protected-gate.sh scripts/protected-paths.txt
  run bash "$GATE" "$WT"
  [ "$status" -eq 2 ]
  [[ "$output" == *"  scripts/protected-gate.sh"* && "$output" == *"  scripts/protected-paths.txt"* ]]
}

@test "uncommitted and untracked changes count, as the checks would run on them" {
  echo x >> "$WT/readme"
  mkdir -p "$WT/bot" && echo x > "$WT/bot/new.sh"
  run bash "$GATE" "$WT"
  [ "$status" -eq 2 ]
  [ "$(sed -n 's/^  //p' <<<"$output")" = "bot/new.sh" ]
}

@test "what main changed in a protected path is not the branch's, once main is merged" {
  other="$BATS_TEST_TMPDIR/other"
  git clone -q "$ORIGIN" "$other" 2>/dev/null
  mkdir -p "$other/bot" && echo main > "$other/bot/from-main.sh"
  git -C "$other" add -A && git -C "$other" -c user.email=t@t -c user.name=t commit -qm "main moves the bot" && git -C "$other" push -q origin HEAD:main
  change feature.ts
  git -C "$WT" fetch -q origin && git -C "$WT" merge -q --no-edit origin/main
  run bash "$GATE" "$WT"
  [ "$status" -eq 0 ]
}

@test "a branch that changes a protected path is refused even when main also moved" {
  other="$BATS_TEST_TMPDIR/other"
  git clone -q "$ORIGIN" "$other" 2>/dev/null
  echo main > "$other/main.txt"
  git -C "$other" add -A && git -C "$other" -c user.email=t@t -c user.name=t commit -qm "main moves" && git -C "$other" push -q origin HEAD:main
  change bot/mine.sh
  git -C "$WT" fetch -q origin && git -C "$WT" merge -q --no-edit origin/main
  run bash "$GATE" "$WT"
  [ "$status" -eq 2 ]
}

@test "BOT_PROTECTED_PATHS names another list, comments and blank lines ignored" {
  printf '# mine\n\nsecret.txt   # trailing\nvault/**\n' > "$BATS_TEST_TMPDIR/list"
  change bot/x.sh
  BOT_PROTECTED_PATHS="$BATS_TEST_TMPDIR/list" run bash "$GATE" "$WT"
  [ "$status" -eq 0 ]
  change vault/a.txt
  BOT_PROTECTED_PATHS="$BATS_TEST_TMPDIR/list" run bash "$GATE" "$WT"
  [ "$status" -eq 2 ]
  [[ "$output" == *"  vault/a.txt"* ]]
}

@test "a list that is missing or empty is a failure, not a pass" {
  BOT_PROTECTED_PATHS="$BATS_TEST_TMPDIR/none" run bash "$GATE" "$WT"
  [ "$status" -eq 1 ]
  : > "$BATS_TEST_TMPDIR/empty"
  BOT_PROTECTED_PATHS="$BATS_TEST_TMPDIR/empty" run bash "$GATE" "$WT"
  [ "$status" -eq 1 ]
}
