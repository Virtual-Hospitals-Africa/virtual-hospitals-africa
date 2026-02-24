import { Kysely } from 'kysely'
import { assertOnInsert } from '../helpers.ts'
import type { DB } from '../../db.d.ts'

// Patient UUID format: first 3 hex chars = country code, next 13 random (with valid version at position 13),
// position 17 = '8' (variant), positions 18-32 = zeros
// Country code encoding: (char1 - 64) * 26 + (char2 - 64), e.g. ZA = 26*26 + 1 = 677 = 0x2A5
const patients_assertion = assertOnInsert({
  table: 'patients',
  function_name: 'patient_id_matches_country_partition',
  assertion: `
    -- Last 16 hex chars must be '8' followed by 15 zeros (variant=8 for patient IDs)
    substring(replace(NEW.id::text, '-', ''), 17, 16) = '8000000000000000'
    AND
    -- First 3 hex chars must encode the country
    (
      -- Extract first 3 hex chars and convert to integer
      ('x' || lpad(substring(replace(NEW.id::text, '-', ''), 1, 3), 8, '0'))::bit(32)::int
      =
      -- Calculate expected value: (ascii(char1) - 64) * 26 + (ascii(char2) - 64)
      (ascii(substring(NEW.country, 1, 1)) - 64) * 26 + (ascii(substring(NEW.country, 2, 1)) - 64)
    )
  `,
  error_message: `format('patients.id must match country partition scheme. id: %s, country: %s', NEW.id, NEW.country)`,
})

// Patient encounter UUID format: first 16 hex chars from patient_id, position 17 must be '9', remaining 15 random
const patient_encounters_assertion = assertOnInsert({
  table: 'patient_encounters',
  function_name: 'patient_encounter_id_matches_patient_partition',
  assertion: `
    -- First 16 hex chars of id must match first 16 hex chars of patient_id
    substring(replace(NEW.id::text, '-', ''), 1, 16) = substring(replace(NEW.patient_id::text, '-', ''), 1, 16)
    AND
    -- 17th character (position 17) must be '9' for patient encounters
    substring(replace(NEW.id::text, '-', ''), 17, 1) = '9'
  `,
  error_message: `format('patient_encounters.id must match patient partition scheme. id: %s, patient_id: %s', NEW.id, NEW.patient_id)`,
})

// Patient record UUID format: first 16 hex chars from patient_id, position 17 must be a/b, remaining 15 random
const patient_records_assertion = assertOnInsert({
  table: 'patient_records',
  function_name: 'patient_record_id_matches_patient_partition',
  assertion: `
    -- First 16 hex chars of id must match first 16 hex chars of patient_id
    substring(replace(NEW.id::text, '-', ''), 1, 16) = substring(replace(NEW.patient_id::text, '-', ''), 1, 16)
    AND
    -- 17th character (position 17) must be 'a' or 'b' for patient records
    substring(replace(NEW.id::text, '-', ''), 17, 1) IN ('a', 'b')
  `,
  error_message: `format('patient_records.id must match patient partition scheme. id: %s, patient_id: %s', NEW.id, NEW.patient_id)`,
})

export async function up(db: Kysely<DB>) {
  await patients_assertion.up(db)
  await patient_encounters_assertion.up(db)
  await patient_records_assertion.up(db)
}

export async function down(db: Kysely<DB>) {
  await patients_assertion.down(db)
  await patient_encounters_assertion.down(db)
  await patient_records_assertion.down(db)
}
