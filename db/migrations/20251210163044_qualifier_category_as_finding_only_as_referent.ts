import { assertOnInsert } from '../helpers.ts'

const assertion = assertOnInsert({
  table: 'patient_findings',
  function_name: 'qualifier_category_not_used_as_finding',
  assertion: `
    NOT EXISTS (
        SELECT 1
          FROM patient_records
    INNER JOIN snomed_inferred_canonical_name_and_category on patient_records.specific_snomed_concept_id = snomed_inferred_canonical_name_and_category.id
         WHERE patient_records.id = NEW.id
           AND snomed_inferred_canonical_name_and_category.category = 'qualifier value'
    )
  `,
  error_message:
    `format('patient_findings whose snomed_concept_id are qualifier values must refer to other findings. id: %s', NEW.id)`,
  after: true,
})

export const up = assertion.up
export const down = assertion.down
