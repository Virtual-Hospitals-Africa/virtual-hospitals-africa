#! /usr/bin/env bash
set -euo pipefail

# if windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  shopt -s expand_aliases
  alias psql="'$WINDOWS_PSQL_SHELL'"
fi

# First argument is the database URL, the rest are table names
DATABASE_URL="$1"
shift

# Directory to store exported TSV files
SEED_DUMPS_DIR="./db/seed/dumps"

mkdir -p "$SEED_DUMPS_DIR"

# # Strip the id column from the TSVs
# # This way Postgres will generate new ids when we load the data
# strip_ids() {
#   awk -F'\t' '
#     NR == 1 && $1 ~ /^id/ {
#       skip=1;
#       for (i = 2; i <= NF; i++) printf "%s%s", $i, (i == NF ? "\n" : "\t")
#     }

#     NR == 1 && $1 !~ /^id/ {
#       skip=0;
#       print
#     }

#     skip && NR > 1 {
#       for (i = 2; i <= NF; i++) printf "%s%s", $i, (i == NF ? "\n" : "\t")
#     }

#     !skip && NR > 1 {
#       print
#     }
#   '
# }

# Export tables as TSVs
for table in "$@"; do
  echo "Exporting table $table to $SEED_DUMPS_DIR/$table.tsv"
  psql -d "$DATABASE_URL" -c "COPY \"$table\" TO STDOUT WITH DELIMITER E'\t' CSV HEADER" > "$SEED_DUMPS_DIR/$table.tsv"
done

echo "Tables exported to $SEED_DUMPS_DIR"