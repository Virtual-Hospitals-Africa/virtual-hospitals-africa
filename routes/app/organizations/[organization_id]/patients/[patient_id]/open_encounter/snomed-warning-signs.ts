import { snomed_model } from '../../../../../../../db/models/snomed.ts'
import { jsonSearchHandler } from '../../../../../../../util/jsonSearchHandler.ts'
import { OpenEncounterContext } from './_middleware.tsx'

export const handler = jsonSearchHandler(
  snomed_model,
  (ctx: OpenEncounterContext) => ({
    patient_id: ctx.state.patient_id,
    categories: [
      'disorder' as const,
      'finding' as const,
      'morphologic abnormality' as const,
    ],
  }),
  {
    verbose: true,
    rows_per_page: 20,
  },
)
