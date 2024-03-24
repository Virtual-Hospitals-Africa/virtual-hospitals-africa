import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as devices from '../../db/models/devices.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    if (!search) return json([])
    return json(await devices.search(ctx.state.trx, { search }))
  },
}
