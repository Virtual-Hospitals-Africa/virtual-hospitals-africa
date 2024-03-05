import { sql } from 'kysely/index.js'
import { Maybe, RenderedDevice, TrxOrDb } from '../../types.ts'
import { jsonArrayFromColumn } from '../helpers.ts'

export function search(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedDevice[]> {
  const devicesQuery = trx
    .selectFrom('devices')
    .select((eb) => [
      'devices.id',
      'devices.name',
      'devices.manufacturer',
      jsonArrayFromColumn(
        'diagnostic_test',
        eb
          .selectFrom('device_capabilities')
          .whereRef('device_capabilities.device_id', '=', 'devices.id')
          .select('diagnostic_test'),
      ).as('diagnostic_test_capabilities'),
    ])

  const query = search
    ? trx
      .selectFrom(devicesQuery.as('devices'))
      .selectAll()
      .where((eb) =>
        eb.or([
          eb('devices.name', 'ilike', `%${search}%`),
          eb('devices.manufacturer', 'ilike', `%${search}%`),
          sql<
            boolean
          >`EXISTS (select 1 from json_array_elements_text("devices"."diagnostic_test_capabilities") AS test
      WHERE test ILIKE ${'%' + search + '%'})`,
        ])
      )
    : devicesQuery

  return query.limit(20).execute()
}
