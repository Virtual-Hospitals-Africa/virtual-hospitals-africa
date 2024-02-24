import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as icd10 from '../../db/models/icd10.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    if (!search) return json([])
    const results = await icd10.searchTree(ctx.state.trx, { term: search })
    return json(results)
  },
}
