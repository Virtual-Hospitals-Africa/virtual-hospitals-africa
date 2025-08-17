#! /usr/bin/env bash
set -euo pipefail

out_file="${1:-db.d.ts}"

cd ./db/codegen
npm install
cd ../..
./db/codegen/node_modules/.bin/kysely-codegen --out-file "$out_file"

echo 'type Buffer = Uint8Array' >> "$out_file"

deno fmt "$out_file"
