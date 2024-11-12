import { z } from 'zod'
import { positive_number } from '../../util/validators.ts'

export const FindingSchema = z.object({
  snomed_concept_id: positive_number,
  text: z.string(),
  edit_href: z.string(),
  additional_notes: z.string().optional().nullable().transform((notes) =>
    notes || null
  ),
  body_sites: z.object({
    snomed_concept_id: positive_number,
    snomed_english_term: z.string(),
  }).array(),
})

export type Finding = z.infer<typeof FindingSchema>
