import { sql } from 'kysely'
import {
  TrxOrDb,
  FacilityDevice,
  DeviceTestsAvailablity,
  FacilityDeviceTable,
} from '../../types.ts'
import uniq from '../../util/uniq.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isObjectLike from '../../util/isObjectLike.ts'

export function assertIsUpsert(obj: unknown): asserts obj is FacilityDevice {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.device_id === 'number')
}

export async function getFacilityDevices(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  }
): Promise<FacilityDeviceTable[]> {
  const devices = await trx
    .selectFrom('facility_devices')
    .innerJoin('devices', 'facility_devices.device_id', 'devices.id')
    .innerJoin(
      'facility_rooms',
      'facility_devices.room_id',
      'facility_rooms.id'
    )
    .where('facility_rooms.facility_id', '=', opts.facility_id)
    .select([
      'facility_devices.device_serial as serial',
      'devices.name',
      'devices.manufacturer',
      sql<DeviceTestsAvailablity[]>`TO_JSON(devices.test_availability)`.as(
        'test_availability'
      ),
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
  const tests= await trx
    .selectFrom('facility_devices')
    .leftJoin('devices', 'facility_devices.device_id', 'devices.id')
    .leftJoin('facility_rooms', 'facility_devices.room_id', 'facility_rooms.id')
    .where('facility_rooms.facility_id', '=', opts.facility_id)
    .select([
      sql<string[]>`jsonb_path_query_array(devices.test_availability, '$.name')`.as(
        'test'
      ),
    ])
    .distinct()
    .execute()

  return uniq(tests.flatMap((c) => c.test))
}

export async function addFacilityDevice(
  trx: TrxOrDb,
  facility_id: number,
  model: FacilityDevice
): Promise<void> {
  //TODO:Handle rooms at next stage
  let room = await trx
    .selectFrom('facility_rooms')
    .where('facility_rooms.facility_id', '=', facility_id)
    .select('id')
    .executeTakeFirst()
  if (!room)
    room = await trx
      .insertInto('facility_rooms')
      .values({
        facility_id: facility_id,
        name: 'equipment',
      })
      .returning('id')
      .executeTakeFirst()

  await trx
    .insertInto('facility_devices')
    .values({ device_id: model.device_id, room_id: room?.id! })
    .execute()
}
