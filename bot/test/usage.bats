load helpers
setup() { source "$(repo_root)/bot/lib/usage.sh"; }

@test "the reset time comes from the message: an epoch, a clock time, else an hour on" {
  [ "$(usage_reset_epoch 'Claude AI usage limit reached|1791234567' 0)" = 1791234567 ]
  now=$(date -j -f '%Y-%m-%d %H:%M' '2026-10-06 13:10' +%s)
  [ "$(usage_reset_epoch '5-hour limit reached ∙ resets 3pm' "$now")" = "$(date -j -f '%Y-%m-%d %H:%M' '2026-10-06 15:00' +%s)" ]
  [ "$(usage_reset_epoch 'limit reached · resets 9:30am' "$now")" = "$(date -j -f '%Y-%m-%d %H:%M' '2026-10-07 09:30' +%s)" ]
  [ "$(usage_reset_epoch 'limit reached' 1000)" = 4600 ]
}

@test "times are written as the event log writes them" {
  [ "$(iso_of 1791234567)" = 2026-10-05T21:09:27.000Z ]
}
