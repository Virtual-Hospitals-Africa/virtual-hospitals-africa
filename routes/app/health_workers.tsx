import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import { json } from '../../util/responses.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')

    const search = new URL(req.url).searchParams.get('search')
    const profession = new URL(req.url).searchParams.get('profession')
    assertOr400(
      profession === null || profession === 'doctor' ||
        profession === 'nurse' || profession === 'admin',
    )
    const healthWorkers = await health_workers.search(ctx.state.trx, {
      search,
      profession,
    })

    return json(healthWorkers)
  },
}
