import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import * as allergies from '../../db/models/allergies.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const without_ids = searchParams.has('without_ids')
      ? searchParams.get('without_ids')!.split(',').map((
        d,
      ) => parseInt(d))
      : undefined

    assertEquals(req.headers.get('accept'), 'application/json')
    const allergyList = await allergies.search(ctx.state.trx, {
      search,
      without_ids,
    })
    return json(allergyList)
  },
}
