#! /usr/bin/env bash
set -euo pipefail

cd ./db/codegen
npm install
cd ../..
./db/codegen/node_modules/.bin/kysely-codegen --out-file db.d.ts

echo 'type Buffer = Uint8Array' >> db.d.ts

deno fmt db.d.ts
