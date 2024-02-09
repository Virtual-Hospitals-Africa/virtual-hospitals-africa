import { TrxOrDb } from '../../types.ts'
import { assertOr400, assertOr404 } from '../../util/assertOr.ts'
import { getWithTokensQuery } from './health_workers.ts'

export async function getWithCalendarAndTokensById(
  trx: TrxOrDb,
  provider_id: number,
) {
  const provider = await getWithTokensQuery(trx)
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
    .where(
      'employment.id',
      '=',
      provider_id,
    )
    .select([
      'employment.profession',
      'provider_calendars.gcal_appointments_calendar_id',
      'provider_calendars.gcal_availability_calendar_id',
      'provider_calendars.availability_set',
    ])
    .executeTakeFirst()

  assertOr404(provider, 'No provider found')
  assertOr400(
    provider.profession === 'doctor' || provider.profession === 'nurse',
    'Invalid profession',
  )

  return provider
}

