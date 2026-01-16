import { PROCEDURE, REFERENCE_DOCUMENTATION } from './snomed_concepts.ts'
import { parseExpressionExpectingAtom } from './s_expression.ts'
import { CheckForTask, RenderedTask } from '../types.ts'
import { keyBy } from '../util/keyBy.ts'
import entries from '../util/entries.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED } from './adult_pac_table_of_contents_to_snomed.ts'
import { assert } from 'std/assert/assert.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS } from './pack-adult.ts'

function asTask(task_s_expression: string) {
  return parseExpressionExpectingAtom(
    task_s_expression,
    'task',
  )
}
/*
                          // Triage nurse has permission.
  check_for finding              Yes
  do measurement                 Most of the time
  suspected diagnosis            Sometimes
  make diagnosis                 Generally no
  administer medication          Depends
*/

/*
  The tasks must be done even if the triage nurse can't do them.
  In fact, this is the _reason_ for transfer
*/

const MEDICAL_GUIDANCE_TASKS = entries(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED).flatMap(([table_of_contents_name, snomed_mapping]) => {
  const page_number = ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS[table_of_contents_name as unknown as keyof typeof ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS]
  assert(page_number, `No page for ${table_of_contents_name}`)

  return snomed_mapping.map((concept) =>
    `(task
    "Display medical guidance for ${table_of_contents_name === 'Lump, neck/axilla/groin' ? concept.name : table_of_contents_name}"
      ${concept.clinical_finding_s_expression}
      (procedure 
        ${PROCEDURE.s_expression}
        ${REFERENCE_DOCUMENTATION.s_expression}
        (link 
          "${table_of_contents_name} page" 
          "/medical-resources/primary-care/adult.pdf#page=${page_number}"
          "/medical-resources/za/primary-care/adult/thumbnails/${page_number}.png"
        )
        ))`
  )
})

/*
  1. Calculate the tasks
  2. If there's a task that needs doing that the triage nurse can't do that itself creates a new task to transfer or get confirmation from SHCP
*/
export const TASKS = [
  `(task
    "Give oxygen if saturation below 92%"
      (< (measurement 103228002) (units 92 %))
      (procedure ${PROCEDURE.s_expression} 57485005))`,
  `(task
    "Check for head injury for any nose symptoms"
    (clinical_finding
      (finding_site (snomed_concept "Nasal structure" "body structure")))
    (check_for
      (clinical_finding (snomed_concept "Injury of head" "disorder"))))`,
  `(task
    "Check for nausea in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Nausea" "finding"))))`,
  `(task
    "Check for vomiting in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Vomiting" "disorder"))))`,
  `(task
    "Check for pallor in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))))`,
  `(task
    "Check for sweating in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Sweating" "finding"))))`,
  ...MEDICAL_GUIDANCE_TASKS,
].map(asTask)

export const KEYED_TASKS = keyBy(TASKS, 'description')

export function isCheckFor(task: RenderedTask): task is CheckForTask {
  return task.procedure.value?.type === 's_expression'
}

// TODO Separate function for permission around tasks
// That is, put the task in for analgesia, but there's separate logic to
// say who has permissions to prescribe what
