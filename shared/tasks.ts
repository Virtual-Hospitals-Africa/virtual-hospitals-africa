import {
  ParsedTaskExpression,
  parseExpressionExpectingType,
} from './s_expression.ts'

type Task = {
  if_description: string
  tasks_description: string
  task_s_expression: ParsedTaskExpression
}

// const TRANSFER_OF_CARE_PROCEDURE_SNOMED_CONCEPT_ID = '308292007' // |Transfer of care (procedure)|
// const PATIENT_TRANSFER_PROCEDURE_SNOMED_CONCEPT_ID = '107724000' // |Patient transfer (procedure)|
// (referral ${PATIENT_TRANSFER_PROCEDURE_SNOMED_CONCEPT_ID} (department "Emergency"))

export const TASKS: Task[] = [
  {
    if_description: 'If oxygen saturation below 92%',
    tasks_description: 'give oxygen and move to resuscitation area',
    task_s_expression: parseExpressionExpectingType(
      `(
      task
      (<
        (measurement 103228002)
        (units 92 %))
      (procedure 57485005)
    )`,
      'task',
    ),
  },
]
