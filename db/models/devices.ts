import { Maybe, RenderedDevice, TrxOrDb } from '../../types.ts'
import { jsonArrayFromColumn } from '../helpers.ts'

export function search(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedDevice[]> {
  let query = trx
    .selectFrom('devices')
    .select((eb) => [
      'devices.id',
      'devices.name',
      'devices.manufacturer',
      jsonArrayFromColumn(
        'diagnostic_test',
        eb.selectFrom('device_capabilities')
          .whereRef('device_capabilities.device_id', '=', 'devices.id')
          .select('diagnostic_test'),
      ).as('diagnostic_test_capabilities'),
    ])

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  return query.execute()
}
