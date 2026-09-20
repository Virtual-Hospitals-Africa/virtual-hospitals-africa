import z from 'zod'
import { ORDERED_PRIORITIES } from './priorities.ts'
import { sExpressionZodValidator } from './s_expression.ts'
import { insertable_finding_base } from './s_expression_schemas.ts'
import type { RenderedFindingRelativeToHealthWorker } from '../types.ts'

export type ClinicalFindingPostBody = z.input<typeof ClinicalFindingSchema>

// The record as the drawer renders it, so that the page can show it without reloading
export type ClinicalFindingPostResponse = {
  success: true
  record: RenderedFindingRelativeToHealthWorker
}

export const ClinicalFindingSchema = z.object({
  finding_id: z.string().uuid(),
  s_expression: sExpressionZodValidator(insertable_finding_base),
  priority_level: z.enum(ORDERED_PRIORITIES).nullish(),
  altered_record_id: z.string().uuid().optional(),
})
