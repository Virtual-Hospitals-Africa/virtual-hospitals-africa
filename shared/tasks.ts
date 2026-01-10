import { CLINICAL_FINDING, PROCEDURE } from './snomed_concepts.ts'
import { parseExpressionExpectingAtom } from './s_expression.ts'
import { CheckForTask, RenderedTask } from '../types.ts'
import { keyBy } from '../util/keyBy.ts'

function asTask(task_s_expression: string) {
  return parseExpressionExpectingAtom(
    task_s_expression,
    'task',
  )
}

export const TASKS = [
  // `(task
  //   "Give oxygen if saturation below 92%"
  //     (< (measurement 103228002) (units 92 %))
  //     (procedure ${PROCEDURE.s_expression} 57485005))`,
  `(task
    "Check for head injury for any nose symptoms"
    (finding ${CLINICAL_FINDING.s_expression}
      (finding_site (snomed_concept "Nasal structure" "body structure")))
    (check_for
      (finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Injury of head" "disorder"))))`,
  `(task
    "Check for nausea in case of chest pain"
    (finding ${CLINICAL_FINDING.s_expression}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Nausea" "finding"))))`,
  `(task
    "Check for vomiting in case of chest pain"
    (finding ${CLINICAL_FINDING.s_expression}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Vomiting" "disorder"))))`,
  `(task
    "Check for pallor in case of chest pain"
    (finding ${CLINICAL_FINDING.s_expression}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Pallor of skin of face" "finding"))))`,
  `(task
    "Check for sweating in case of chest pain"
    (finding ${CLINICAL_FINDING.s_expression}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Sweating" "finding"))))`,
].map(asTask)

export const KEYED_TASKS = keyBy(TASKS, 'description')

export function isCheckFor(task: RenderedTask): task is CheckForTask {
  return task.procedure.value?.type === 's_expression'
}

// TODO Separate function for permission around tasks
// That is, put the task in for analgesia, but there's separate logic to
// say who has permissions to prescribe what
