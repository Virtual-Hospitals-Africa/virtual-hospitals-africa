import { assert } from 'std/assert/assert.ts'
import { PROCEDURE, REFERENCE_DOCUMENTATION } from './snomed_concepts.ts'
import { parseWithSchema } from './s_expression.ts'
import entries from '../util/entries.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED } from './adult_pac_table_of_contents_to_snomed.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS } from './pack-adult.ts'
import { task } from './s_expression_schemas.ts'
import { NTASKS } from '../s_expression/ntasks.ts'

function asTask(task_s_expression: string) {
  return parseWithSchema(task_s_expression, task)
}

const MEDICAL_GUIDANCE_TASKS = entries(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED).flatMap(([table_of_contents_name, snomed_mapping]) => {
  const page_number = ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS[table_of_contents_name as unknown as keyof typeof ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS]
  assert(page_number, `No page for ${table_of_contents_name}`)

  return snomed_mapping.map((concept) =>
    `(task
    "Display medical guidance for ${table_of_contents_name === 'Lump, neck/axilla/groin' ? concept.name : table_of_contents_name}"
    adult
      ${concept.clinical_finding_s_expression}
      (procedure 
        ${PROCEDURE.s_expression}
        ${REFERENCE_DOCUMENTATION.s_expression}
        (link 
          "${table_of_contents_name} page"
          "/medical-resources/primary-care/adult.pdf#page=${page_number}"
          "/medical-resources/za/primary-care/adult/thumbnails/150/${page_number}.png"
        )
        ))`
  )
})

export const TASK_DEFS = [
  ...MEDICAL_GUIDANCE_TASKS,
  ...NTASKS,
]

export const TASKS = TASK_DEFS.map(asTask)
/*
// Triage nurse has permission.
  check_for finding              Yes
  do measurement                 Most of the time
  suspected diagnosis            Sometimes
  make diagnosis                 Generally no
  administer medication          Depends
*/

// TODO Separate function for permission around tasks
// That is, put the task in for analgesia, but there's separate logic to
// say who has permissions to prescribe what

/*
  The tasks must be done even if the triage nurse can't do them.
  In fact, this is the _reason_ for transfer
*/
