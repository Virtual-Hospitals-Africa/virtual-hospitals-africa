import {
  FacilityDevice,
  Procurer,
  RenderedFacilityConsumable,
  RenderedFacilityDevice,
  TrxOrDb,
  RenderedConsumable,
  RenderedProcurer,
  FacilityConsumable,
} from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { jsonArrayFromColumn } from '../helpers.ts'

export function getFacilityDevices(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  }
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
        eb
          .selectFrom('device_capabilities')
          .whereRef('device_capabilities.device_id', '=', 'devices.id')
          .select('diagnostic_test')
      ).as('diagnostic_test_capabilities'),
    ])
    .execute()
}

export function getFacilityConsumables(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  }
): Promise<RenderedFacilityConsumable[]> {
  return trx
    .selectFrom('facility_consumables')
    .innerJoin(
      'consumables',
      'facility_consumables.consumable_id',
      'consumables.id'
    )
    .where('facility_consumables.facility_id', '=', opts.facility_id)
    .select([
      'consumables.name as name',
      'consumables.id as consumable_id',
      'quantity_on_hand',
    ])
    .execute()
}

export function searchConsumables(
  trx: TrxOrDb,
  search?: string
): Promise<RenderedConsumable[]> {
  let query = trx
    .selectFrom('consumables')
    .select(['consumables.id', 'consumables.name'])

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  return query.execute()
}

export function searchProcurers(
  trx: TrxOrDb,
  search?: string
): Promise<RenderedProcurer[]> {
  let query = trx
    .selectFrom('procurers')
    .select(['procurers.id', 'procurers.name'])

  if (search) query = query.where('procurers.name', 'ilike', `%${search}%`)

  return query.execute()
}

export function getAvailableTestsInFacility(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  }
): Promise<{ diagnostic_test: string }[]> {
  return trx
    .selectFrom('facility_devices')
    .innerJoin('devices', 'facility_devices.device_id', 'devices.id')
    .innerJoin(
      'device_capabilities',
      'devices.id',
      'device_capabilities.device_id'
    )
    .where('facility_devices.facility_id', '=', opts.facility_id)
    .select('device_capabilities.diagnostic_test')
    .distinct()
    .execute()
}

export function addFacilityDevice(
  trx: TrxOrDb,
  model: FacilityDevice,
  healthworkerid: number
): Promise<{ id: number }> {
  return trx
    .insertInto('facility_devices')
    .values({ ...model, created_by: healthworkerid })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function addFacilityConsumable(
  trx: TrxOrDb,
  model: FacilityConsumable
) {
  await trx.insertInto('procurement').values(model).execute()

  const facilityConsumable = await trx
    .selectFrom('facility_consumables')
    .select(['id', 'quantity_on_hand'])
    .where((eb) =>
      eb.and([
        eb('facility_consumables.facility_id', '=', model.facility_id),
        eb('facility_consumables.consumable_id', '=', model.consumable_id),
      ])
    )
    .executeTakeFirst()

  if (facilityConsumable)
    await trx
      .updateTable('facility_consumables')
      .set({
        quantity_on_hand: facilityConsumable.quantity_on_hand + model.quantity,
      })
      .where('facility_consumables.facility_id', '=', model.facility_id)
      .execute()
  else
    await trx
      .insertInto('facility_consumables')
      .values({
        quantity_on_hand: model.quantity,
        consumable_id: model.consumable_id,
        facility_id: model.facility_id,
      })
      .execute()
}

export function upsertProcurer(trx: TrxOrDb, model: Procurer) {
  return trx
    .insertInto('procurers')
    .values(model)
    .onConflict((c) => c.column('id').doUpdateSet(model))
    .execute()
}
