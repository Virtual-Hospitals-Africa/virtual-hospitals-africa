#! /usr/bin/env bash

for port in "$@"; do
  pid=$(lsof -i tcp:"$port" | awk 'NR==2 { print $2 }')
  [[ -n "$pid" ]] && kill "$pid"
done
