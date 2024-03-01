import { sql } from 'kysely'
import {
  DeviceTestsAvailablity,
  FacilityDevice,
  FacilityDeviceTable,
  TrxOrDb,
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
    .where('facility_devices.facility_id', '=', opts.facility_id)
    .select([
      'facility_devices.device_serial as serial',
      'devices.name',
      'devices.manufacturer',
      sql<DeviceTestsAvailablity[]>`TO_JSON(devices.test_availability)`.as(
        'test_availability'
      ),
    ])
    .execute()

  if (devices?.length) {
    const testIds = devices.flatMap((c) =>
      c.test_availability.flatMap((t) => t.test_id)
    )
    const testNames = await trx
      .selectFrom('medical_tests')
      .where('medical_tests.id', 'in', testIds)
      .selectAll()
      .execute()
    devices.map((device) => {
      device.test_availability = device.test_availability.map((t) => ({
        test_id: t.test_id,
        name: testNames.filter((n) => n.id === t.test_id)[0]?.name,
      }))
    })
  }

  return devices
}

export async function getAvailableTestsInFacility(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  }
): Promise<DeviceTestsAvailablity[]> {
  const devices_tests = await trx
    .selectFrom('facility_devices')
    .innerJoin('devices', 'facility_devices.device_id', 'devices.id')
    .where('facility_devices.facility_id', '=', opts.facility_id)
    .select([
      sql<DeviceTestsAvailablity[]>`TO_JSON(devices.test_availability)`.as(
        'test_availability'
      ),
    ])
    .execute()

  if (devices_tests?.length) {
    const testIds = devices_tests.flatMap((c) =>
      c.test_availability.flatMap((t) => t.test_id)
    )
    const testNames = await trx
      .selectFrom('medical_tests')
      .where('medical_tests.id', 'in', testIds)
      .selectAll()
      .execute()
    devices_tests.map((device) => {
      device.test_availability = device.test_availability.map((t) => ({
        test_id: t.test_id,
        name: testNames.filter((n) => n.id === t.test_id)[0]?.name,
      }))
    })
  }

  return uniq(devices_tests.flatMap((c) => c.test_availability))
}

export async function addFacilityDevice(
  trx: TrxOrDb,
  facility_id: number,
  model: FacilityDevice
): Promise<void> {
  await trx
    .insertInto('facility_devices')
    .values({
      device_serial: model.device_serial!,
      device_id: model.device_id,
      facility_id: facility_id,
    })
    .execute()
}
