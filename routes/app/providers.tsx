import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  LoggedInHealthWorkerHandlerWithProps,
  Profession,
} from '../../types.ts'
import { search } from '../../db/models/providers.ts'
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

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const { searchParams } = ctx.url
    const facility_id = parseInt(searchParams.get('facility_id')!) || undefined
    const prioritize_facility_id =
      parseInt(searchParams.get('prioritize_facility_id')!) || undefined
    const professions = searchParams.has('profession')
      ? searchParams.get('profession')!.split(',')
      : undefined
    if (professions) assertIsProfessions(professions)

    const providers = await search(ctx.state.trx, {
      facility_id,
      professions,
      prioritize_facility_id,
      search: searchParams.get('search'),
    })

    return json(providers)
  },
}
