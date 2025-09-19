import { TrxOrDb } from '../../types.ts'

export function add(
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
    .insertInto('health_worker_organization_calendars')
    .values(
      cals.map((cal) => ({
        ...cal,
        health_worker_id,
      })),
    )
    .onConflict((oc) =>
      oc.constraint('only_one_calendar_set_per_health_worker_organization')
        .doNothing()
    )
    .execute()
}

export function markAvailabilitySet(
  trx: TrxOrDb,
  opts: {
    organization_id: string
    health_worker_id: string
  },
) {
  return trx.updateTable('health_worker_organization_calendars')
    .set({ availability_set: true })
    .where('health_worker_id', '=', opts.health_worker_id)
    .where('organization_id', '=', opts.organization_id)
    .execute()
}
