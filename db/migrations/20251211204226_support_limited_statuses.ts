import { assertOnInsert } from '../helpers.ts'

const assertion = assertOnInsert({
  table: 'patient_records',
  function_name: 'support_limited_statuses',
  assertion: `
    NEW.value_snomed_concept_id = 373066001 OR -- Yes
    NEW.value_snomed_concept_id = 373067005 OR -- No
    NEW.value_snomed_concept_id = 261665006 OR -- Unknown
    NEW.snomed_concept_id != '263490005' -- Status
  `,
  error_message:
    `format('Only Yes/No/Unknown are supported as status values. id: %s', NEW.id)`,
  after: true,
})

export const up = assertion.up
export const down = assertion.down
