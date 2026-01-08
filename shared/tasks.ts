import { CLINICAL_FINDING, PROCEDURE } from './snomed_concepts.ts'
import { parseExpressionExpectingAtom } from './s_expression.ts'

function asTask(task_s_expression: string) {
  return parseExpressionExpectingAtom(
    task_s_expression,
    'task',
  )
}

export const TASKS = [
  `(task
      (< (measurement 103228002) (units 92 %))
      (procedure ${PROCEDURE.lang} 57485005))`,
  `(task
    (finding ${CLINICAL_FINDING.lang}
      (finding_site (snomed_concept "Nasal structure" "body structure")))
    (check_for
      (finding ${CLINICAL_FINDING.lang} (snomed_concept "Injury of head" "disorder"))))`,
  `(task
    (finding ${CLINICAL_FINDING.lang}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.lang} (snomed_concept "Nausea" "finding"))))`,
  `(task
    (finding ${CLINICAL_FINDING.lang}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.lang} (snomed_concept "Vomiting" "finding"))))`,
  `(task
    (finding ${CLINICAL_FINDING.lang}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.lang} (snomed_concept "Pallor of skin of face" "finding"))))`,
  `(task
    (finding ${CLINICAL_FINDING.lang}
      (snomed_concept "Chest pain" "finding"))
    (check_for
      (finding ${CLINICAL_FINDING.lang} (snomed_concept "Sweating" "finding"))))`,
].map(asTask)

// TODO Separate function for permission around tasks
// That is, put the task in for analgesia, but there's separate logic to
// say who has permissions to prescribe what
