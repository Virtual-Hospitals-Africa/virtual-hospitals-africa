import { assertEquals } from '$std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import * as medications from '../../db/models/medications.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')

    const search = new URL(req.url).searchParams.get('search')
    const medicationsResult = await medications.search(ctx.state.trx, {
      search,
    })

    return json(medicationsResult)
  },
}
