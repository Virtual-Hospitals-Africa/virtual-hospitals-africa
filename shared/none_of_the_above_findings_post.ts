import z from 'zod'
import { sExpressionsZodValidator } from './s_expression.ts'
import { insertable_finding_base } from './s_expression_schemas.ts'

export type NoneOfTheAboveFindingsPostBody = z.input<typeof NoneOfTheAboveFindingsSchema>

/*
  s_expressions is a lisp array of positive findings, e.g. ((finding ...) (finding ...)).
  The backend records each as a negative finding, so the client sends the findings as
  they were listed to check for rather than negating them itself.
*/
export const NoneOfTheAboveFindingsSchema = z.object({
  task_id: z.string(),
  s_expressions: sExpressionsZodValidator(insertable_finding_base),
})

export type NoneOfTheAboveFindingsResponse = {
  success: true
  records: { id: string; s_expression: string }[]
}
