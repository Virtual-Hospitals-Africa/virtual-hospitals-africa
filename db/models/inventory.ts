import { FacilityDevice, RenderedFacilityDevice, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { jsonArrayFromColumn } from '../helpers.ts'

export function assertIsUpsert(
  obj: unknown,
): asserts obj is Omit<FacilityDevice, 'facility_id'> {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.device_id === 'number')
}

export function getFacilityDevices(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  },
): Promise<RenderedFacilityDevice[]> {
  return trx
    .selectFrom('facility_devices')
    .innerJoin('devices', 'facility_devices.device_id', 'devices.id')
    .where('facility_devices.facility_id', '=', opts.facility_id)
    .select((eb) => [
      'devices.id as device_id',
      'facility_devices.serial_number',
      'devices.name',
      'devices.manufacturer',
      jsonArrayFromColumn(
        'diagnostic_test',
        eb.selectFrom('device_capabilities')
          .whereRef('device_capabilities.device_id', '=', 'devices.id')
          .select('diagnostic_test'),
      ).as('diagnostic_test_capabilities'),
    ])
    .execute()
}

export function getAvailableTestsInFacility(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  },
): Promise<{ diagnostic_test: string }[]> {
  return trx
    .selectFrom('facility_devices')
    .innerJoin('devices', 'facility_devices.device_id', 'devices.id')
    .innerJoin(
      'device_capabilities',
      'devices.id',
      'device_capabilities.device_id',
    )
    .where('facility_devices.facility_id', '=', opts.facility_id)
    .select('device_capabilities.diagnostic_test')
    .distinct()
    .execute()
}

export function addFacilityDevice(
  trx: TrxOrDb,
  model: FacilityDevice,
  healthworkerid: number,
): Promise<{ id: number }> {
  return trx
    .insertInto('facility_devices')
    .values({...model, created_by: healthworkerid})
    .returning('id')
    .executeTakeFirstOrThrow()
}
