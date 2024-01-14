#! /usr/bin/env bash
set -euo pipefail

files=(
  # address.test.ts
  # drugs.test.ts
  # facilities.test.ts
  # family.test.ts
  # health_workers.test.ts
  # patient_allergies.test.ts
  # patient_conditions.test.ts
  # patient_encounters.test.ts
  patient_measurements.test.ts
  patient_occupation.test.ts
  patients.test.ts
  waiting_room.test.ts
)

for file in "${files[@]}"; do
  echo "Running $file"
  deno task test --parallel ./test/models/$file
done