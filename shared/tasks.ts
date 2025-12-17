import {
  ParsedTaskExpression,
  parseExpressionExpectingType,
} from './s_expression.ts'

type Task = {
  if_description: string
  tasks_description: string
  task_s_expression: ParsedTaskExpression
}

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
