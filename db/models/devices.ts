import { Maybe, RenderedDevice, TrxOrDb } from '../../types.ts'
import { jsonArrayFromColumn } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'

export function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    ids?: number[]
  },
): Promise<RenderedDevice[]> {
  if (opts.ids) {
    assert(opts.ids.length, 'must provide at least one id')
    assert(!opts.search)
  } else {
    assert(opts.search)
  }

  let query = trx
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

  if (opts.search) {
    const devices_with_capability = trx
      .selectFrom('device_capabilities')
      .where('device_capabilities.diagnostic_test', 'ilike', `%${opts.search}%`)
      .select('device_capabilities.device_id')
      .distinct()

    query = query.where((eb) =>
      eb.or([
        eb('devices.name', 'ilike', `%${opts.search}%`),
        eb('devices.manufacturer', 'ilike', `%${opts.search}%`),
        eb('devices.id', 'in', devices_with_capability),
      ])
    )
  }

  if (opts.ids) {
    query = query.where('devices.id', 'in', opts.ids)
  }

  return query.limit(20).execute()
}
