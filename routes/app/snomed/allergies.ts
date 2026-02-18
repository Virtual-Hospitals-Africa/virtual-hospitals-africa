import { snomed_allergies } from '../../../db/models/snomed_allergies.ts'
import { ALLERGIC_DISPOSITION } from '../../../shared/snomed_concepts.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(snomed_allergies, (ctx) => ({
  search: `Allergy to ${ctx.url.searchParams.get('search')}`,
  descendant_of_concept: ALLERGIC_DISPOSITION,
}), {
  rows_per_page: 5,
})
