import { snomed_model } from '../../../../../../../db/models/snomed.ts'
import { jsonSearchHandler } from '../../../../../../../util/jsonSearchHandler.ts'
import { OpenEncounterContext } from './_middleware.tsx'

export const handler = jsonSearchHandler(
  snomed_model,
  (ctx: OpenEncounterContext) => ({
    patient_id: ctx.state.patient_id,
    categories: [
      'finding' as const,
      'disorder' as const,
      'morphologic abnormality' as const,
    ],
  }),
  {
    rows_per_page: 20,
  },
)
