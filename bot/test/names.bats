load helpers
setup() { source "$(repo_root)/bot/lib/names.sh"; }

@test "snake_case slug and the page id's full 32 hex" {
  [ "$(branch_for 'Fix join link on Android!' '3d591359-c53b-80a4-9df8-ff3fdd42216f')" = bot_fix_join_link_on_android_3d591359c53b80a49df8ff3fdd42216f ]
}

@test "two cards whose ids start alike get different branches" {
  [ "$(branch_for 'Same' '3ec91359-c53b-80cf-83a5-e88a6c4e37f0')" != "$(branch_for 'Same' '3ec91359-c53b-805e-845a-c9aabc496ab6')" ]
}

@test "long titles are cut to 30 characters, never ending in _" {
  b=$(branch_for 'A very long title that keeps going and going and going' 'abcd0000-0000')
  [[ "$b" =~ ^bot_[a-z0-9_]{1,30}_abcd00000000$ ]]
  [[ "$b" != *__abcd00000000 ]]
}

@test "a title with no letters still yields a valid branch" {
  [ "$(branch_for '🐞🐞' 'ffff1111')" = bot_card_ffff1111 ]
}

@test "every branch passes create-worktree.sh's rule" {
  for t in 'Été — café' '123 go' '__x__'; do
    [[ "$(branch_for "$t" 'ab12cd34')" =~ ^[a-z][a-z_0-9]*$ ]]
  done
}

@test "an origin URL, SSH or HTTPS, becomes the repo's HTTPS URL" {
  [ "$(https_remote_of git@github.com:Virtual-Hospitals-Africa/virtual-hospitals-africa.git)" = https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa.git ]
  [ "$(https_remote_of ssh://git@github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa.git)" = https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa.git ]
  [ "$(https_remote_of https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa)" = https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa.git ]
  run https_remote_of /local/path/repo
  [ "$status" -ne 0 ]
}
