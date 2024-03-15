import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
  Profession,
} from '../../types.ts'
import { search } from '../../db/models/providers.ts'
import { json } from '../../util/responses.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isString from '../../util/isString.ts'

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

function assertIsMaybeFacilityKind(
  facility_kind: unknown,
): asserts facility_kind is Maybe<'virtual' | 'physical'> {
  if (facility_kind == null) return
  assertOr400(isString(facility_kind), 'Invalid facility_kind')
  assertOr400(
    facility_kind === 'physical' || facility_kind === 'virtual',
    'Invalid facility_kind',
  )
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const { searchParams } = ctx.url
    const facility_id = parseInt(searchParams.get('facility_id')!) || undefined
    const prioritize_facility_id =
      parseInt(searchParams.get('prioritize_facility_id')!) || undefined

    const facility_kind = searchParams.get('facility_kind')
    assertIsMaybeFacilityKind(facility_kind)

    const professions = searchParams.has('profession')
      ? searchParams.get('profession')!.split(',')
      : undefined
    if (professions) assertIsProfessions(professions)

    const providers = await search(ctx.state.trx, {
      facility_id,
      professions,
      prioritize_facility_id,
      facility_kind,
      search: searchParams.get('search'),
    })

    return json(providers)
  },
}
