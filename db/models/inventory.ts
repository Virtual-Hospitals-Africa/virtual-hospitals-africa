// deno-lint-ignore-file no-explicit-any
import { sql } from 'kysely'
import {
  FacilityConsumable,
  FacilityDevice,
  Procurer,
  RenderedConsumable,
  RenderedFacilityConsumable,
  RenderedFacilityDevice,
  RenderedFacilityMedicine,
  RenderedInventoryHistory,
  RenderedProcurer,
  TrxOrDb,
} from '../../types.ts'
import omit from '../../util/omit.ts'
import { jsonArrayFromColumn } from '../helpers.ts'
import sortBy from '../../util/sortBy.ts'

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
        eb
          .selectFrom('device_capabilities')
          .whereRef('device_capabilities.device_id', '=', 'devices.id')
          .select('diagnostic_test'),
      ).as('diagnostic_test_capabilities'),
    ])
    .execute()
}

export function getFacilityConsumables(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  },
): Promise<RenderedFacilityConsumable[]> {
  return trx
    .selectFrom('facility_consumables')
    .innerJoin(
      'consumables',
      'facility_consumables.consumable_id',
      'consumables.id',
    )
    .leftJoin(
      'manufactured_medications',
      'consumables.id',
      'manufactured_medications.consumable_id',
    )
    .where('facility_consumables.facility_id', '=', opts.facility_id)
    .where('manufactured_medications.id', 'is', null)
    .select([
      'consumables.name as name',
      'consumables.id as consumable_id',
      'quantity_on_hand as quantity_on_hand',
    ])
    .execute()
}

export function getFacilityMedicines(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  },
): Promise<RenderedFacilityMedicine[]> {
  return trx
    .selectFrom('facility_consumables')
    .innerJoin(
      'consumables',
      'facility_consumables.consumable_id',
      'consumables.id',
    )
    .innerJoin(
      'manufactured_medications',
      'consumables.id',
      'manufactured_medications.consumable_id',
    )
    .innerJoin(
      'medications',
      'medications.id',
      'manufactured_medications.medication_id',
    )
    .innerJoin(
      'drugs',
      'medications.drug_id',
      'drugs.id',
    )
    .where('facility_consumables.facility_id', '=', opts.facility_id)
    .select([
      'drugs.generic_name',
      'manufactured_medications.applicant_name',
      'manufactured_medications.trade_name',
      'consumables.id as consumable_id',
      'quantity_on_hand as quantity_on_hand',
    ])
    .execute()
}

export async function getFacilityConsumablesHistory(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    consumable_id: number
  },
): Promise<RenderedInventoryHistory[]> {
  const procurement = trx
    .selectFrom('procurement')
    .innerJoin('employment', 'procurement.created_by', 'employment.id')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin('procurers', 'procurement.procured_by', 'procurers.id')
    .select([
      'procurement.id as procurement_id',
      'health_workers.name as created_by',
      'procurers.name as procured_by',
      'procurement.quantity',
      'procurement.created_at',
      'procurement.expiry_date',
      'procurement.consumed_amount',
      sql<any>`TO_JSON(procurement.specifics)`.as('specifics'),
    ])
    .where((eb) =>
      eb.and([
        eb('procurement.facility_id', '=', opts.facility_id),
        eb('procurement.consumable_id', '=', opts.consumable_id),
      ])
    )
    .execute()

  const consumption = trx
    .selectFrom('consumption')
    .innerJoin('employment', 'consumption.created_by', 'employment.id')
    .innerJoin('procurement', 'procurement.id', 'consumption.procurement_id')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .select([
      'procurement.id as procurement_id',
      'consumption.id as consumption_id',
      'health_workers.name as created_by',
      'consumption.quantity',
      'consumption.created_at',
    ])
    .where((eb) =>
      eb.and([
        eb('consumption.facility_id', '=', opts.facility_id),
        eb('procurement.consumable_id', '=', opts.consumable_id),
      ])
    )
    .execute()

  const [procurementResult, consumptionResult] = await Promise.all([
    procurement,
    consumption,
  ])

  const mergedResults = (procurementResult ?? [])
    .map(
      (item) => ({
        ...item,
      } as RenderedInventoryHistory),
    )
    .concat(
      (consumptionResult ?? []).map(
        (item) => ({
          ...item,
          procured_by: '-',
        } as RenderedInventoryHistory),
      ),
    )

  return sortBy(mergedResults, (c) => c.procurement_id!)
}

export function searchConsumables(
  trx: TrxOrDb,
  search?: string,
): Promise<RenderedConsumable[]> {
  let query = trx
    .selectFrom('consumables')
    .leftJoin(
      'manufactured_medications',
      'consumables.id',
      'manufactured_medications.consumable_id',
    )
    .where('manufactured_medications.id', 'is', null)
    .select(['consumables.id', 'consumables.name'])

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  return query.execute()
}

export function searchProcurers(
  trx: TrxOrDb,
  search?: string,
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
): Promise<{ id: number }> {
  return trx
    .insertInto('facility_devices')
    .values(model)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function addFacilityMedicine(
  trx: TrxOrDb,
  medicine: {
    created_by: number
    facility_id: number
    manufactured_medication_id: number
    procured_by_id?: number
    procured_by_name: string
  },
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

  if (facilityConsumable) {
    await trx
      .updateTable('facility_consumables')
      .set({
        quantity_on_hand: (facilityConsumable?.quantity_on_hand || 0) +
          model.quantity,
      })
      .where('facility_consumables.id', '=', facilityConsumable.id)
      .execute()
  } else {
    await trx
      .insertInto('facility_consumables')
      .values({
        quantity_on_hand: model.quantity,
        consumable_id: model.consumable_id,
        facility_id: model.facility_id,
      })
      .execute()
  }
}

export async function addFacilityConsumable(
  trx: TrxOrDb,
  model: FacilityConsumable,
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

  if (facilityConsumable) {
    await trx
      .updateTable('facility_consumables')
      .set({
        quantity_on_hand: (facilityConsumable?.quantity_on_hand || 0) +
          model.quantity,
      })
      .where('facility_consumables.id', '=', facilityConsumable.id)
      .execute()
  } else {
    await trx
      .insertInto('facility_consumables')
      .values({
        quantity_on_hand: model.quantity,
        consumable_id: model.consumable_id,
        facility_id: model.facility_id,
      })
      .execute()
  }
}

export async function consumeFacilityConsumable(
  trx: TrxOrDb,
  model: FacilityConsumable,
) {
  await trx
    .insertInto('consumption')
    .values(omit(model, ['procured_by', 'consumable_id']))
    .execute()

  await trx
    .updateTable('procurement')
    .set({
      consumed_amount: sql`consumed_amount + ${model.quantity}`,
    })
    .where('procurement.id', '=', model.procurement_id)
    .executeTakeFirstOrThrow()

  await trx
    .updateTable('facility_consumables')
    .set({
      quantity_on_hand: sql`quantity_on_hand - ${model.quantity}`,
    })
    .where('facility_consumables.facility_id', '=', model.facility_id)
    .where('facility_consumables.consumable_id', '=', model.consumable_id)
    .executeTakeFirstOrThrow()
}

export function upsertProcurer(trx: TrxOrDb, model: Procurer) {
  return trx
    .insertInto('procurers')
    .values(model)
    .onConflict((c) => c.column('id').doUpdateSet(model))
    .execute()
}
