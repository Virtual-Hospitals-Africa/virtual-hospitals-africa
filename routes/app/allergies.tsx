import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import * as allergies from '../../db/models/allergies.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    const search = new URL(req.url).searchParams.get('search') || undefined
    assertEquals(req.headers.get('accept'), 'application/json')
    const allergyList = await allergies.search(ctx.state.trx, {
      search,
    })
    return json(allergyList)
  },
}
