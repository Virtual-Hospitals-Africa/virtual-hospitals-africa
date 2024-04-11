#! /usr/bin/env bash

PORT="$1"

pid=$(lsof -i tcp:"$PORT" | awk 'NR==2 { print $2 }')
[[ -n "$pid" ]] && kill "$pid"
exit 0
