#! /usr/bin/env bash
set -xeuo pipefail

# shellcheck disable=SC1091
source .env

# Directory to store exported TSV files
SEED_DIR="./db/seeds"

for table in "$@"; do
  file="$SEED_DIR/$table.tsv"
  if [[ ! -f "$file" ]]; then
    echo "No seed data found for table $table"
    exit 1
  fi
  echo "Loading data from $file into table $table"
  psql "$DATABASE_URL" -c "\copy $table FROM '$file' WITH DELIMITER E'\t' CSV HEADER"
done

echo "Data loaded into tables from $SEED_DIR"