import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as manufactured_medications from '../../db/models/manufactured_medications.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    return manufactured_medications
      .search(ctx.state.trx, { search })
      .then(json)
  },
}
