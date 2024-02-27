import { sql } from 'kysely/index.js'
import { DeviceTestsAvailablity, Maybe, TrxOrDb } from '../../types.ts'

export function search(
    trx: TrxOrDb,
    search?: Maybe<string>,
  ) {
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
  
    return query.execute()
  }