import { CLINICAL_FINDING, PROCEDURE } from './snomed_concepts.ts'
import { parseExpressionExpectingAtom } from './s_expression.ts'

type TaskDef = {
  if_description: string
  tasks_description: string
  task_s_expression: string
}

function asTask({ task_s_expression, ...rest }: TaskDef) {
  return {
    ...rest,
    node: parseExpressionExpectingAtom(
      task_s_expression,
      'task',
    ),
  }
}

export const TASKS = [
  {
    if_description: 'If oxygen saturation below 92%',
    tasks_description: 'give oxygen and move to resuscitation area',
    task_s_expression: `(
      task
        (< (measurement 103228002) (units 92 %))
        (procedure ${PROCEDURE.id} 57485005)
    )`,
  },
  {
    if_description: 'If nose symptoms',
    tasks_description: 'check for head injury',
    task_s_expression: `(
      task
        (finding ${CLINICAL_FINDING.lang}
          (finding_site (snomed_concept "Nasal structure" "body structure")))
        (check_for
          (finding ${CLINICAL_FINDING.lang} (snomed_concept "Injury of head" "disorder")))
    )`,
  },
  {
    if_description: 'If nose symptoms',
    tasks_description: 'check for head injury',
    task_s_expression: `(
      task
        (finding ${CLINICAL_FINDING.lang}
          (snomed_concept "Chest pain" "finding"))
        (check_for
          (finding ${CLINICAL_FINDING.lang} (snomed_concept "Nausea" "finding")))
    )`,
  },
].map(asTask)

// TODO Separate function for permission around tasks
// That is, put the task in for analgesia, but there's separate logic to
// say who has permissions to prescribe what
