import z from 'zod'
import { sExpressionsZodValidator } from './s_expression.ts'
import { insertable_finding_base } from './s_expression_schemas.ts'

export type TriageWarningSignsPostBody = z.input<typeof TriageWarningSignsSchema>

/*
  Positive findings are saved one at a time through the clinical_finding route as the
  health worker checks them, so by the time the page is submitted the only things left
  to say are which of those records the page still shows (saved_record_ids), and which
  signs went unchecked (none_of_these), recorded as negative findings.

  none_of_these.s_expressions is a lisp array of positive findings, e.g. ((finding ...) (finding ...)),
  or () when every sign was checked.
*/
export const TriageWarningSignsSchema = z.object({
  saved_record_ids: z.array(z.string().uuid()).default([]),
  none_of_these: z.object({
    s_expressions: sExpressionsZodValidator(insertable_finding_base),
  }),
})
