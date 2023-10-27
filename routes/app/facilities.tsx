import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import * as facilities from '../../db/models/facilities.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = new URL(req.url).searchParams.get('search')
    const result = await facilities.search(ctx.state.trx, search)
    return json(result)
  },
}
