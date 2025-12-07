#!/bin/bash

# Array of files
files=(
  "db/migrations/20230101110000_utc.ts"
  "db/migrations/20230101120000_updated_at.ts"
  "db/migrations/20230101130000_postgis.ts"
  "db/migrations/20230101130001_trgm.ts"
  "db/migrations/20230101130002_fuzzystrmatch.ts"
  "db/migrations/20230101130003_generate_create_table_statement.ts"
  "db/migrations/20230101134034_snomed_inferred.ts"
  "db/migrations/20230101134035_languages.ts"
  "db/migrations/20230101134036_media.ts"
  "db/migrations/20230101135038_organization.ts"
  "db/migrations/20230101136000_sessions.ts"
  "db/migrations/20230101136001_health_workers.ts"
  "db/migrations/20230101136002_regulators.ts"
  "db/migrations/20230101136003_employment.ts"
  "db/migrations/20230101137039_patients.ts"
  "db/migrations/20230101137074_appointments.ts"
  "db/migrations/20230101137075_patient_encounters.ts"
  "db/migrations/20230127000002_patient_registration.ts"
  "db/migrations/20230128000000_inventory.ts"
  "db/migrations/20230128000002_medication.ts"
  "db/migrations/20230129024001_messages.ts"
  "db/migrations/20230129024002_whatsapp_conversation.ts"
  "db/migrations/20230707204541_health_worker_invitees.ts"
  "db/migrations/20230717010754_nurse_registration_details.ts"
  "db/migrations/20230717010755_doctor_registration_details.ts"
  "db/migrations/20230721032340_add_appointment_request_media.ts"
  "db/migrations/20231020200227_mailing_list.ts"
  "db/migrations/20231129161929_patient_condition_medications.ts"
  "db/migrations/20231218200916_allergies.ts"
  "db/migrations/20231228192406_patient_occupations.ts"
  "db/migrations/20240103071516_patient_age_view.ts"
  "db/migrations/20240108094046_patient_kin.ts"
  "db/migrations/20240201191913_patient_family.ts"
  "db/migrations/20240212213855_patient_lifestyle.ts"
  "db/migrations/20240430115100_pharmacists.ts"
  "db/migrations/20240618013759_patient_whatsapp_associations.ts"
  "db/migrations/20240618013760_pharmacist_whatsapp_associations.ts"
  "db/migrations/20240701221001_pharmacy.ts"
  "db/migrations/20240705162545_prescriptions.ts"
  "db/migrations/20240814213854_manufactured_medication_recalls.ts"
  "db/migrations/20240825021342_diagnoses.ts"
  "db/migrations/20241029001738_diagnoses_collaboration.ts"
  "db/migrations/20241119214300_events.ts"
  "db/migrations/20250110030806_notifications.ts"
  "db/migrations/20250826174144_core_snomed_model_v1.ts"
  "db/migrations/20250907223546_patient_computed_findings.ts"
  "db/migrations/20250916005848_snomed_active_descendant_concepts.ts"
  "db/migrations/20250916011004_snomed_family_history.ts"
  "db/migrations/20250923171038_patient_triage_level.ts"
  "db/migrations/20251013194844_warning_signs.ts"
)

# Import statement to add
import_line="import { DB } from '../../db.d.ts'"

# Process each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Create temporary file with import as first line, then append original content
    echo "$import_line" | cat - "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    echo "✓ Updated $file"
  else
    echo "✗ File not found: $file"
  fi
done

echo "Done!"

