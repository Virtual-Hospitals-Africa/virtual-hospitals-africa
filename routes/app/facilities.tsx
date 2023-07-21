import { assert, assertEquals } from 'std/testing/asserts.ts'
import { isHealthWorkerWithGoogleTokens } from '../../db/models/health_workers.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import { getAllWithNames } from '../../db/models/facilities.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')

    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const search = new URL(req.url).searchParams.get('search')

    const facilities = await getAllWithNames(ctx.state.trx, search)

    return json(facilities)
  },
}
