import { Maybe, Profession, Provider, TrxOrDb } from '../../types.ts'
import { assertOr400, assertOr404 } from '../../util/assertOr.ts'
import { getWithTokensQuery } from './health_workers.ts'
import { assertAll } from '../../util/assertAll.ts'
import { assert } from 'std/assert/assert.ts'
import { hasName } from '../../util/haveNames.ts'
import sortBy from '../../util/sortBy.ts'

// Ensures that the provider_id represents a row in the employment table for a doctor or nurse
export const ensureProviderId = (trx: TrxOrDb, provider_id: string) =>
  trx.selectFrom('employment')
    .select('id')
    .where('id', '=', provider_id)
    .where('profession', 'in', ['doctor', 'nurse'])

// This isn't confirming registration_status
const getQuery = (trx: TrxOrDb) =>
  getWithTokensQuery(trx)
    .innerJoin(
      'employment',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'provider_calendars',
      (join) =>
        join
          .onRef(
            'employment.organization_id',
            '=',
            'provider_calendars.organization_id',
          )
          .onRef(
            'employment.health_worker_id',
            '=',
            'provider_calendars.health_worker_id',
          ),
    )
    .select([
      'health_workers.id as health_worker_id',
      'employment.id as provider_id',
      'employment.profession',
      'provider_calendars.gcal_appointments_calendar_id',
      'provider_calendars.gcal_availability_calendar_id',
      'provider_calendars.availability_set',
    ])
    .where('employment.profession', 'in', ['doctor' as const, 'nurse' as const])

function assertProvider(
  provider: Omit<Provider, 'profession'> & {
    profession: Profession
  },
): asserts provider is Provider {
  assertOr400(
    provider.profession === 'doctor' || provider.profession === 'nurse',
    'Invalid profession',
  )
}

export async function get(
  trx: TrxOrDb,
  provider_id: string,
): Promise<Provider> {
  const provider = await getQuery(trx)
    .where(
      'employment.id',
      '=',
      provider_id,
    )
    .executeTakeFirst()

  assertOr404(provider, 'No provider found')
  assertProvider(provider)
  return provider
}

export function addCalendars(
  trx: TrxOrDb,
  health_worker_id: string,
  cals: {
    organization_id: string
    gcal_appointments_calendar_id: string
    gcal_availability_calendar_id: string
    availability_set?: boolean
  }[],
) {
  return trx
    .insertInto('provider_calendars')
    .values(cals.map((cal) => ({ health_worker_id, ...cal })))
    .onConflict((oc) =>
      oc.constraint('only_one_calendar_set_per_health_worker_organization')
        .doNothing()
    )
    .execute()
}

export async function getMany(
  trx: TrxOrDb,
  opts: {
    employment_ids?: string[]
  },
) {
  let query = getQuery(trx)
  if (opts.employment_ids) {
    if (!opts.employment_ids.length) {
      return []
    }
    query = query.where('employment.id', 'in', opts.employment_ids)
  }
  const providers = await query.execute()
  assertAll(providers, assertProvider)
  return providers
}

export async function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    organization_id?: Maybe<string>
    professions?: Maybe<Profession[]>
    prioritize_organization_id?: Maybe<string>
    organization_kind?: Maybe<'virtual' | 'physical'>
  },
) {
  if (opts.professions) {
    assertOr400(opts.professions.length > 0, 'professions must not be empty')
    for (const profession of opts.professions) {
      assertOr400(
        profession === 'doctor' ||
          profession === 'nurse',
        `Invalid profession: ${profession}, must be one of doctor, nurse`,
      )
    }
  }

  let query = trx
    .selectFrom('health_workers')
    .innerJoin(
      'employment',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'organizations',
      'employment.organization_id',
      'organizations.id',
    )
    .leftJoin('addresses', 'organizations.address_id', 'addresses.id')
    .select([
      'employment.id',
      'health_workers.id as health_worker_id',
      'health_workers.avatar_url',
      'health_workers.email',
      'health_workers.name',
      'employment.organization_id',
      'employment.profession',
      'organizations.name as organization_name',
    ])
    .where('health_workers.name', 'is not', null)
    .where('profession', 'in', opts.professions || ['doctor', 'nurse'])
    .limit(20)

  if (opts.search) {
    query = query.where('health_workers.name', 'ilike', `%${opts.search}%`)
  }

  if (opts.organization_id) {
    query = query.where('employment.organization_id', '=', opts.organization_id)
  }

  if (opts.organization_kind) {
    query = query.where(
      'organizations.address_id',
      opts.organization_kind === 'physical' ? 'is not' : 'is',
      null,
    )
  }

  const providers = await query.execute()

  const results_with_description = providers.map((hw) => {
    assert(hasName(hw))
    return {
      ...hw,
      description: `${hw.profession} @ ${hw.organization_name}`,
    }
  })

  if (!opts.prioritize_organization_id) return results_with_description

  return sortBy(
    results_with_description,
    (hw) => hw.organization_id === opts.prioritize_organization_id ? 0 : 1,
  )
}

export function markAvailabilitySet(
  trx: TrxOrDb,
  opts: {
    organization_id: string
    health_worker_id: string
  },
) {
  return trx.updateTable('provider_calendars')
    .set({ availability_set: true })
    .where('health_worker_id', '=', opts.health_worker_id)
    .where('organization_id', '=', opts.organization_id)
    .execute()
}
