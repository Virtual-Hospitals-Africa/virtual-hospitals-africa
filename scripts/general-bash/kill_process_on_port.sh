#! /usr/bin/env bash

for port in "$@"; do
  while true; do
    pid=$(lsof -i :"$port" | awk 'NR==2 { print $2 }')
    if [[ -z "$pid" ]]; then
      break
    fi
    kill "$pid"
    sleep 0.01
  done
done
