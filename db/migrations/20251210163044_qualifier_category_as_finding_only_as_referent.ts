import { assertOnInsert } from '../helpers.ts'

const assertion = assertOnInsert({
  table: 'patient_findings',
  function_name: 'qualifier_category_as_finding_only_as_referent',
  assertion: `
    NEW.referent_finding_id IS NOT NULL OR
    EXISTS (
        SELECT 1
          FROM patient_records
    INNER JOIN snomed_inferred_canonical_name_and_category on patient_records.snomed_concept_id = snomed_inferred_canonical_name_and_category.id
         WHERE patient_records.id = NEW.id
           AND snomed_inferred_canonical_name_and_category.category != 'qualifier value'
    )
  `,
  error_message:
    `'patient_findings whose snomed_concept_id are qualifier values must refer to other findings'`,
  after: true,
})

export const up = assertion.up
export const down = assertion.down
