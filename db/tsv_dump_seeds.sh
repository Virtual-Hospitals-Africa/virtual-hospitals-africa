#! /usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1091
source .env.local

# Directory to store exported TSV files
SEED_DIR="./db/seeds"

mkdir -p "$SEED_DIR"

# Export tables as TSVs
for table in "$@"; do
  echo "Exporting table $table to $SEED_DIR/$table.tsv"
  psql "$DATABASE_URL" -c "COPY $table TO STDOUT WITH DELIMITER E'\t' CSV HEADER" | tee "$SEED_DIR/$table.tsv"
done

echo "Tables exported to $SEED_DIR"