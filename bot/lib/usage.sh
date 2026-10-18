# shellcheck shell=bash
# bot/lib/usage.sh — when a usage limit lifts. Source it.

# usage_reset_epoch <limit message> [now]: when the plan's usage window reopens — the epoch after a
# "|", else the next "resets <h>[:mm]am|pm", else an hour from now.
usage_reset_epoch() {
  local text="$1" now="${2:-$(date +%s)}" hour minute at
  if [[ "$text" =~ \|([0-9]{9,})$ ]]; then
    echo "${BASH_REMATCH[1]}"
    return
  fi
  if [[ "$text" =~ resets?\ ([0-9]{1,2})(:([0-9]{2}))?\ ?(am|pm) ]]; then
    hour=$((10#${BASH_REMATCH[1]} % 12))
    minute=$((10#${BASH_REMATCH[3]:-0}))
    [[ "${BASH_REMATCH[4]}" == pm ]] && hour=$((hour + 12))
    at=$(date -j -f '%Y-%m-%d %H:%M' "$(date -r "$now" +%Y-%m-%d) $(printf '%02d:%02d' "$hour" "$minute")" +%s)
    (( at > now )) || at=$((at + 86400))
    echo "$at"
    return
  fi
  echo $((now + 3600))
}

# iso_of <epoch>: the instant as the event log writes times.
iso_of() { date -u -r "$1" '+%Y-%m-%dT%H:%M:%S.000Z'; }
