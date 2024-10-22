import type { SelectQueryBuilder } from 'kysely'
import { RenderedDevice, TrxOrDb } from '../../types.ts'
import { jsonArrayFromColumn } from '../helpers.ts'
import { base } from './_base.ts'
import type { DB } from '../../db.d.ts'

function baseQuery(
  trx: TrxOrDb,
): SelectQueryBuilder<DB, 'devices', RenderedDevice> {
  return trx
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
}

const model = base({
  top_level_table: 'devices',
  baseQuery,
  formatResult: (x: RenderedDevice): RenderedDevice => x,
  handleSearch(qb, opts: { search: string | null }, trx) {
    if (!opts.search) return qb

    const devices_with_capability = trx
      .selectFrom('device_capabilities')
      .where('device_capabilities.diagnostic_test', 'ilike', `%${opts.search}%`)
      .select('device_capabilities.device_id')
      .distinct()

    return qb.where((eb) =>
      eb.or([
        eb('devices.name', 'ilike', `%${opts.search}%`),
        eb('devices.manufacturer', 'ilike', `%${opts.search}%`),
        eb('devices.id', 'in', devices_with_capability),
      ])
    )
  },
})

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds
