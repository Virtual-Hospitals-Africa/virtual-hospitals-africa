import { PROCEDURE } from './snomed_concepts.ts'
import { parseExpressionExpectingAtom } from './s_expression.ts'
import { Lang } from './s_expression_schemas.ts'

type Task = {
  if_description: string
  tasks_description: string
  task_s_expression: Lang['task']
}

export const TASKS: Task[] = [
  {
    if_description: 'If oxygen saturation below 92%',
    tasks_description: 'give oxygen and move to resuscitation area',
    task_s_expression: parseExpressionExpectingAtom(
      `(
      task
        (< (measurement 103228002) (units 92 %))
        (procedure ${PROCEDURE.id} 57485005)
    )`,
      'task',
    ),
  },
]
