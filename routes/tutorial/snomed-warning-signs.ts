import { snomed_model } from '../../db/models/snomed.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(
  snomed_model,
  () => ({
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
