#! /usr/bin/env bash
set -xeuo pipefail

# if windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    shopt -s expand_aliases
    alias psql="'$WINDOWS_PSQL_SHELL'"
fi

# First argument is the database URL, the rest are table names
DATABASE_URL="$1"
shift

# Directory to store exported TSV files
SEED_DIR="./db/seeds"

for table in "$@"; do
  file="$SEED_DIR/$table.tsv"
  if [[ ! -f "$file" ]]; then
    echo "No seed data found for table $table"
    exit 1
  fi
  echo "Loading data from $file into table $table"
  psql -d "$DATABASE_URL" -c "\copy $table FROM '$file' WITH DELIMITER E'\t' CSV HEADER"
  echo "Resetting sequence for table $table, if present"
  psql -d "$DATABASE_URL" -c "
    DO \$$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_sequences
        WHERE sequencename = '${table}_id_seq'
      ) THEN
        EXECUTE 'SELECT setval(''' || '${table}_id_seq' || ''', 1 + (SELECT MAX(id) FROM ' || '${table}' || '))';
      END IF;
    END \$$
  "
done

echo "Data loaded into tables from $SEED_DIR"
