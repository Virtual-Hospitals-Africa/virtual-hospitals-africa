import type { LoggedInHealthWorkerContext } from '../../../types.ts'
import { snomed_concept_medicinal_product } from '../../../db/models/snomed_concept_medicinal_product.ts'
import { assertOr400 } from '../../../util/assertOr.ts'
import { json } from '../../../util/responses.ts'

/*
  The forms, routes and strengths a medicinal product comes in, given either its
  snomed_concept_id or its name (which is what a medication's s-expression carries).
*/
export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    const snomed_concept_id = ctx.url.searchParams.get('snomed_concept_id')
    const name = ctx.url.searchParams.get('name')
    assertOr400(snomed_concept_id || name, 'Must provide the snomed_concept_id or name of a medicinal product')
    assertOr400(!snomed_concept_id || /^\d+$/.test(snomed_concept_id), 'snomed_concept_id must be a SNOMED concept id')

    const options = await snomed_concept_medicinal_product.options(
      ctx.state.trx,
      snomed_concept_id ? { snomed_concept_id } : { name: name! },
    )
    return json({ options })
  },
}
