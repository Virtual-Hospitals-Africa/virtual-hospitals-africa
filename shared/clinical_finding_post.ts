import z from 'zod'
import { ORDERED_PRIORITIES } from './priorities.ts'
import { sExpressionZodValidator } from './s_expression.ts'
import { insertable_finding_base } from './s_expression_schemas.ts'
import { medication } from './medication_s_expression.ts'

export type ClinicalFindingPostBody = z.input<typeof ClinicalFindingSchema>

export const ClinicalFindingSchema = z.object({
  finding_id: z.string().uuid(),
  s_expression: sExpressionZodValidator(insertable_finding_base),
  // Medications the patient is taking due to this finding. See shared/medication_s_expression.ts
  medication_s_expressions: medication.array().optional(),
  priority_level: z.enum(ORDERED_PRIORITIES).nullish(),
  altered_record_id: z.string().uuid().optional(),
})
