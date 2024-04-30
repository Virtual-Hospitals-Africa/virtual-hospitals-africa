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
  organization_kind: unknown,
): asserts organization_kind is Maybe<'virtual' | 'physical'> {
  if (organization_kind == null) return
  assertOr400(isString(organization_kind), 'Invalid organization_kind')
  assertOr400(
    organization_kind === 'physical' || organization_kind === 'virtual',
    'Invalid organization_kind',
  )
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const { searchParams } = ctx.url
    const organization_id = searchParams.get('organization_id')
    const prioritize_organization_id =
      parseInt(searchParams.get('prioritize_organization_id')!) || undefined

    const organization_kind = searchParams.get('organization_kind')
    assertIsMaybeFacilityKind(organization_kind)

    const professions = searchParams.has('profession')
      ? searchParams.get('profession')!.split(',')
      : undefined
    if (professions) assertIsProfessions(professions)

    const providers = await search(ctx.state.trx, {
      organization_id,
      professions,
      prioritize_organization_id,
      organization_kind,
      search: searchParams.get('search'),
    })

    return json(providers)
  },
}
