#! /usr/bin/env bash
set -eo pipefail

source .env.local
if [[ -z "$REDIS_PORT" ]]; then
  REDIS_PORT=6379
fi

# Only start a new tmux session if one doesn't already exist
if ! tmux has-session -t vha; then
  tmux new-session -d -s vha
  tmux send-keys -t vha "deno task start" C-m

  tmux split-window -v -t vha
  tmux select-pane -U

  if ! redis-cli --port "$REDIS_PORT" PING >/dev/null 2>&1; then
    tmux split-window -h -t vha
    tmux send-keys -t vha "redis-server --port $REDIS_PORT" C-m
  fi

  tmux select-pane -D
  tmux send-keys -t vha "deno task test:watch" C-m

  tmux split-window -h -t vha
  tmux send-keys -t vha "code $(pwd)" C-m
fi

# Attach to the created tmux session
tmux attach-session -t vha
