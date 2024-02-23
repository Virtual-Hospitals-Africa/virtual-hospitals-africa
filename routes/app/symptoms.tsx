import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import { searchSymptoms } from '../../db/models/icd10.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    if (!search) return json([])
    const results = await searchSymptoms(ctx.state.trx, search)
    return json(results)
  },
}
