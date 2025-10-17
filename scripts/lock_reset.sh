#! /usr/bin/env bash
set -euo pipefail

rm -f deno.lock
deno cache --reload main.ts chatbot/chatbot.ts