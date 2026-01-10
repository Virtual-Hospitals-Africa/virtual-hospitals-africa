import { assertEquals } from 'std/assert/assert_equals.ts'

import { icd10 } from '../../db/models/icd10.ts'
import { json } from '../../util/responses.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'

export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    const req = ctx.req

    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    if (!search) return json([])
    const results = await icd10.searchTree(ctx.state.trx, { term: search })
    return json(results)
  },
}
