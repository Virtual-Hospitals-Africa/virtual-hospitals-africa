import { sql } from 'kysely'
import { TrxOrDb, FacilityDevice } from '../../types.ts'
import uniq from '../../util/uniq.ts'

export async function getFacilityDevices(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  }
) {
  const devices = await trx
    .selectFrom('facility_devices')
    .leftJoin('devices', 'facility_devices.device_id', 'devices.id')
    .leftJoin('facility_rooms', 'facility_devices.room_id', 'facility_rooms.id')
    .where('facility_rooms.facility_id', '=', opts.facility_id)
    .select([
      'facility_devices.device_serial as serial',
      'devices.name',
      'devices.manufacturer',
      sql<string>`jsonb_array_elements_text(device.test_availability)`.as(
        'test'
      ),
      'facility_rooms.name as room_name',
    ])
    .execute()

  return devices
}

export async function getAvailableTestsInFacility(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  }
): Promise<string[]> {
  const tests: { test: string }[] = await trx
    .selectFrom('facility_devices')
    .leftJoin('devices', 'facility_devices.device_id', 'devices.id')
    .leftJoin('facility_rooms', 'facility_devices.room_id', 'facility_rooms.id')
    .where('facility_rooms.facility_id', '=', opts.facility_id)
    .select([
      sql<string>`jsonb_array_elements_text(devices.test_availability) as test`.as(
        'test'
      ),
    ])
    .execute()

  return uniq(tests.map((c) => c.test))
}

export async function upsertFacilityDevice(
  trx: TrxOrDb,
  model: FacilityDevice
): Promise<void> {
  await trx.insertInto('facility_devices').values(model).execute()
}
