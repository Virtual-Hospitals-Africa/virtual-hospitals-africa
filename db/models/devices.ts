import { sql } from 'kysely/index.js'
import { DeviceTestsAvailablity, Maybe, TrxOrDb } from '../../types.ts'

export async function search(trx: TrxOrDb, search?: Maybe<string>) {
  let query = trx
    .selectFrom('devices')
    .select([
      'devices.id',
      'devices.name',
      'devices.manufacturer',
      sql<DeviceTestsAvailablity[]>`TO_JSON(devices.test_availability)`.as(
        'test_availability'
      ),
    ])

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  const devices = await query.execute()

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
