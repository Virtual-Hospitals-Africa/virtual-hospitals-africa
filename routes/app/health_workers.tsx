import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandler, Profession } from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import { json } from '../../util/responses.ts'
import { assertOr400 } from '../../util/assertOr.ts'

function assertIsProfessions(
  professions: string[],
): asserts professions is Profession[] {
  for (const profession of professions) {
    assertOr400(
      profession === 'doctor' ||
        profession === 'nurse' || profession === 'admin',
      `Invalid profession: ${profession}, must be one of doctor, nurse, admin`,
    )
  }
}

const next_available = {
  id: 'next_available',
  name: 'Next Available',
  avatar_url: null, // TODO: add avatar_url for next available
}

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const { searchParams } = ctx.url
    const search = searchParams.get('search')
    const include_next_available = !search &&
      searchParams.has('include_next_available')
    const facility_id = parseInt(searchParams.get('facility_id')!) || undefined
    const professions = searchParams.has('profession')
      ? searchParams.get('profession')!.split(',')
      : undefined
    if (professions) assertIsProfessions(professions)

    const healthWorkers = await health_workers.search(ctx.state.trx, {
      search,
      facility_id,
      professions,
    })

    const toSend = include_next_available
      ? [next_available, ...healthWorkers]
      : healthWorkers

    return json(toSend)
  },
}
