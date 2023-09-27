import { assertEquals } from 'std/testing/asserts.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import { getAllWithNames } from '../../db/models/health_workers.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')

    const search = new URL(req.url).searchParams.get('search')

    const healthWorkers = await getAllWithNames(ctx.state.trx, search)

    return json(healthWorkers)
  },
}
