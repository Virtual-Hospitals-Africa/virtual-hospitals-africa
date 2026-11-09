import z from 'zod'
import { sExpressionsZodValidator } from './s_expression.ts'
import { insertable_finding_base } from './s_expression_schemas.ts'
import { task_description_validator } from './tasks.ts'

export type NoneOfTheAboveFindingsPostBody = z.input<typeof NoneOfTheAboveFindingsSchema>

/*
  s_expressions is a lisp array of positive findings, e.g. ((finding ...) (finding ...)).
  The backend records each as a negative finding, so the client sends the findings as
  they were listed to check for rather than negating them itself.

  completed_task_descriptions are the check_for tasks those findings were listed under. They
  are all answered by the one submission, so a finding listed under several of them is
  recorded once.
*/
export const NoneOfTheAboveFindingsSchema = z.object({
  completed_task_descriptions: task_description_validator.array().min(1),
  s_expressions: sExpressionsZodValidator(insertable_finding_base),
})

export type NoneOfTheAboveFindingsResponse = {
  success: true
  records: { id: string; s_expression: string }[]
}
