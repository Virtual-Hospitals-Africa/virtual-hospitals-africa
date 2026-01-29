import { OXYGEN_THERAPY, PROCEDURE, REFERENCE_DOCUMENTATION } from './snomed_concepts.ts'
import { parseWithSchema } from './s_expression.ts'
import { AgeDetermination, CheckForTask, MeasureTask, RenderedTask } from '../types.ts'
import entries from '../util/entries.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED } from './adult_pac_table_of_contents_to_snomed.ts'
import { assert } from 'std/assert/assert.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS } from './pack-adult.ts'
import { task } from './s_expression_schemas.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from './vitals.ts'
import { NTASKS } from '../s_expression/ntasks.ts'

type TaskDef = ['all' | AgeDetermination[], string]

function asTask([age_determinations, task_s_expression]: TaskDef) {
  return {
    age_determinations: age_determinations === 'all' ? ['adult' as const, 'older child' as const, 'younger child' as const] : age_determinations,
    task: parseWithSchema(
      task_s_expression,
      task,
    ),
  }
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

const MEDICAL_GUIDANCE_TASKS: TaskDef[] = entries(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED).flatMap(([table_of_contents_name, snomed_mapping]) => {
  const page_number = ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS[table_of_contents_name as unknown as keyof typeof ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS]
  assert(page_number, `No page for ${table_of_contents_name}`)

  return snomed_mapping.map((concept): TaskDef => [
    ['adult' as const],
    `(task
    "Display medical guidance for ${table_of_contents_name === 'Lump, neck/axilla/groin' ? concept.name : table_of_contents_name}"
      ${concept.clinical_finding_s_expression}
      (procedure 
        ${PROCEDURE.s_expression}
        ${REFERENCE_DOCUMENTATION.s_expression}
        (link 
          "${table_of_contents_name} page"
          "/medical-resources/primary-care/adult.pdf#page=${page_number}"
          "/medical-resources/za/primary-care/adult/thumbnails/150/${page_number}.png"
        )
        ))`,
  ])
})

export const TASK_DEFS: TaskDef[] = [
  ...MEDICAL_GUIDANCE_TASKS,
  [
    ['adult' as const],
    `(task
    "Check Sp0₂ if respiratory rate < 9 bpm"
      (< (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.respiratory_rate.s_expression} bpm) 9)
      (measure (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.s_expression} %)))`,
  ],
  [
    ['adult' as const],
    `(task
    "Check Sp0₂ if respiratory rate >= 15 bpm"
      (>= (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.respiratory_rate.s_expression} bpm) 15)
      (measure (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.s_expression} %)))`,
  ],
  [
    ['adult' as const],
    `(task
    "Give oxygen if saturation below 92%"
      (< (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.s_expression} %) 92)
      (procedure ${PROCEDURE.s_expression} ${OXYGEN_THERAPY.s_expression}))`,
  ],
  [
    ['adult' as const],
    `(task
    "Check for head injury for any nose symptoms"
    (clinical_finding
      (finding_site (snomed_concept "Nasal structure" "body structure")))
    (check_for
      (clinical_finding (snomed_concept "Injury of head" "disorder"))))`,
  ],
  [
    ['adult' as const],
    `(task
    "Check for nausea in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Nausea" "finding"))))`,
  ],
  [
    ['adult' as const],
    `(task
    "Check for vomiting in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Vomiting" "disorder"))))`,
  ],
  [
    ['adult' as const],
    `(task
    "Check for pallor in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))))`,
  ],
  [
    ['adult' as const],
    `(task
    "Check for sweating in case of chest pain"
    (clinical_finding
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (clinical_finding (snomed_concept "Sweating" "finding"))))`,
  ],
  // TODO load the anaphylaxis page too
]

export const TASKS = TASK_DEFS.map(asTask)

console.log({ NTASKS })

export function isCheckForTask(task: RenderedTask): task is CheckForTask {
  const { value } = task.procedure
  if (!value) return false
  if (value.type !== 's_expression') return false
  return value.node.atom === 'finding'
}

export function isMeasureTask(task: RenderedTask): task is MeasureTask {
  const { value } = task.procedure
  if (!value) return false
  if (value.type !== 's_expression') return false
  return value.node.atom === 'measurement'
}

// TODO Separate function for permission around tasks
// That is, put the task in for analgesia, but there's separate logic to
// say who has permissions to prescribe what
