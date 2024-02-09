import { HealthWorkerProfessions } from '../../db.d.ts'
import { Provider, TrxOrDb } from '../../types.ts'
import { assertOr400, assertOr404 } from '../../util/assertOr.ts'
import { getWithTokensQuery } from './health_workers.ts'
import { assertAll } from '../../util/assertAll.ts'

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
            'employment.facility_id',
            '=',
            'provider_calendars.facility_id',
          )
          .onRef(
            'employment.health_worker_id',
            '=',
            'provider_calendars.health_worker_id',
          ),
    )
    .select([
      'employment.id as provider_id',
      'employment.profession',
      'provider_calendars.gcal_appointments_calendar_id',
      'provider_calendars.gcal_availability_calendar_id',
      'provider_calendars.availability_set',
    ])

function assertProvider(
  provider: Omit<Provider, 'profession'> & {
    profession: HealthWorkerProfessions
  },
): asserts provider is Provider {
  assertOr400(
    provider.profession === 'doctor' || provider.profession === 'nurse',
    'Invalid profession',
  )
}

export async function get(
  trx: TrxOrDb,
  provider_id: number,
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
  health_worker_id: number,
  cals: {
    facility_id: number
    gcal_appointments_calendar_id: string
    gcal_availability_calendar_id: string
  }[],
) {
  return trx
    .insertInto('provider_calendars')
    .values(cals.map((cal) => ({ health_worker_id, ...cal })))
    .execute()
}

export async function getMany(
  trx: TrxOrDb,
  opts: {
    provider_ids?: number[]
  },
) {
  let query = getQuery(trx)
  if (opts.provider_ids) {
    assertOr400(opts.provider_ids.length > 0, 'provider_ids must not be empty')
    query = query.where('employment.id', '=', opts.provider_ids)
  }
  const providers = await query.execute()
  assertAll(providers, assertProvider)
  return providers
}
