#! /usr/bin/env bash
set -euo pipefail

rm -f deno.lock 
rm -rf node_modules
deno install --allow-scripts