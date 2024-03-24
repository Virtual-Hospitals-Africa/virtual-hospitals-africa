import { sql } from 'kysely'
import {
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
import {
  jsonArrayFromColumn,
  literalNumber,
  literalOptionalDate,
  longFormattedDateTime,
} from '../helpers.ts'
import { strengthDisplay } from './drugs.ts'
import { longFormattedDate } from '../helpers.ts'
import { jsonBuildObject } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import { jsonArrayFrom } from '../helpers.ts'

export function getDevices(
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

// Refers to non-medicine consumables
export function getConsumables(
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
      'manufactured_medication_strengths',
      'consumables.id',
      'manufactured_medication_strengths.consumable_id',
    )
    .where('facility_consumables.facility_id', '=', opts.facility_id)
    .where('manufactured_medication_strengths.id', 'is', null)
    .select([
      'consumables.name as name',
      'consumables.id as consumable_id',
      'quantity_on_hand as quantity_on_hand',
      jsonBuildObject({
        add: sql<string>`
          concat('/app/facilities/', ${opts.facility_id}::text, '/inventory/add_consumable?consumable_id=', consumables.id::text)
        `,
        history: sql<string>`
          concat('/app/facilities/', ${opts.facility_id}::text, '/inventory/history?consumable_id=', consumables.id::text)
        `,
      }).as('actions'),
    ])
    .execute()
}

export function getMedicines(
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
      'manufactured_medication_strengths',
      'consumables.id',
      'manufactured_medication_strengths.consumable_id',
    )
    .innerJoin(
      'manufactured_medications',
      'manufactured_medications.id',
      'manufactured_medication_strengths.manufactured_medication_id',
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
      'medications.form',
      'manufactured_medications.trade_name',
      'consumables.id as consumable_id',
      'quantity_on_hand',
      strengthDisplay(
        sql`manufactured_medication_strengths.strength_numerator::text`,
      ).as('strength_display'),
      jsonBuildObject({
        add: sql<string>`
          concat('/app/facilities/', ${opts.facility_id}::text, '/inventory/add_medicine?manufactured_medication_id=', manufactured_medications.id::text, '&strength=', manufactured_medication_strengths.strength_numerator::text)
        `,
        history: sql<string>`
          concat('/app/facilities/', ${opts.facility_id}::text, '/inventory/history?consumable_id=', consumables.id::text)
        `,
      }).as('actions'),
    ])
    .execute()
}

export function getConsumablesHistory(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    consumable_id: number
  },
): Promise<{
  name: string
  history: RenderedInventoryHistory[]
}> {
  const consumption = trx
    .selectFrom('consumption')
    .innerJoin('employment', 'consumption.created_by', 'employment.id')
    .innerJoin('procurement', 'procurement.id', 'consumption.procurement_id')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .select((eb) => [
      'procurement.id as procurement_id',
      jsonBuildObject({
        name: eb.ref('health_workers.name'),
        href: sql<
          string
        >`'/app/facilities/' || ${opts.facility_id} || '/employees/' || ${
          eb.ref('health_workers.id')
        }`,
        avatar_url: eb.ref('health_workers.avatar_url'),
      }).as('created_by'),
      sql<null | string>`NULL`.as('procured_by'),
      sql<number>`0 - consumption.quantity`.as('change'),
      'consumption.created_at',
      longFormattedDateTime('consumption.created_at').as(
        'created_at_formatted',
      ),
      sql<null | string>`NULL`.as('expiry_date'),
    ])
    .where('consumption.facility_id', '=', opts.facility_id)
    .where('procurement.consumable_id', '=', opts.consumable_id)

  const procurement = trx
    .selectFrom('procurement')
    .innerJoin('employment', 'procurement.created_by', 'employment.id')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin('procurers', 'procurement.procured_by', 'procurers.id')
    .select((eb) => [
      'procurement.id as procurement_id',
      jsonBuildObject({
        name: eb.ref('health_workers.name'),
        href: sql<
          string
        >`'/app/facilities/' || ${opts.facility_id} || '/employees/' || ${
          eb.ref('health_workers.id')
        }`,
        avatar_url: eb.ref('health_workers.avatar_url'),
      }).as('created_by'),
      'procurers.name as procured_by',
      eb.ref('procurement.quantity').as('change'),
      'procurement.created_at',
      longFormattedDateTime('procurement.created_at').as(
        'created_at_formatted',
      ),
      longFormattedDate('procurement.expiry_date').as('expiry_date'),
    ])
    .where('procurement.facility_id', '=', opts.facility_id)
    .where('procurement.consumable_id', '=', opts.consumable_id)

  const history = consumption.unionAll(procurement)
    .orderBy('created_at', 'desc')

  return trx.selectFrom('consumables')
    .select([
      'consumables.name',
      jsonArrayFrom(history).as('history'),
    ])
    .where('consumables.id', '=', opts.consumable_id)
    .executeTakeFirstOrThrow()
}

export function searchConsumables(
  trx: TrxOrDb,
  opts: {
    search?: string
    ids?: number[]
  },
): Promise<RenderedConsumable[]> {
  if (opts.ids) {
    assert(opts.ids.length, 'must provide at least one id')
    assert(!opts.search)
  } else {
    assert(opts.search)
  }

  let query = trx
    .selectFrom('consumables')
    .leftJoin(
      'manufactured_medication_strengths',
      'consumables.id',
      'manufactured_medication_strengths.consumable_id',
    )
    .where('manufactured_medication_strengths.id', 'is', null)
    .select(['consumables.id', 'consumables.name'])

  if (opts.search) query = query.where('name', 'ilike', `%${opts.search}%`)
  if (opts.ids) query = query.where('consumables.id', 'in', opts.ids)

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

export function getAvailableTests(
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
  facility_id: number,
  medicine: {
    created_by: number
    manufactured_medication_id: number
    procured_by_id?: number
    procured_by_name: string
    quantity: number
    strength: number
    expiry_date?: string
  },
) {
  const procured_by = medicine.procured_by_id
    ? { id: medicine.procured_by_id }
    : await trx
      .insertInto('procurers')
      .values({ name: medicine.procured_by_name })
      .returning('id')
      .executeTakeFirstOrThrow()

  const { consumable_id } = await trx.insertInto('procurement')
    .columns([
      'consumable_id',
      'created_by',
      'facility_id',
      'quantity',
      'procured_by',
      'expiry_date',
    ])
    .expression((eb) =>
      // Find the matching consumable for this medicine
      eb.selectFrom('manufactured_medication_strengths')
        .where(
          'manufactured_medication_strengths.manufactured_medication_id',
          '=',
          medicine.manufactured_medication_id,
        )
        .where(
          'manufactured_medication_strengths.strength_numerator',
          '=',
          medicine.strength,
        )
        .select([
          'consumable_id',
          literalNumber(medicine.created_by).as('created_by'),
          literalNumber(facility_id).as('facility_id'),
          literalNumber(medicine.quantity).as('quantity'),
          literalNumber(procured_by.id).as('procured_by'),
          literalOptionalDate(medicine.expiry_date).as('expiry_date'),
        ])
    )
    .returning('consumable_id')
    .executeTakeFirstOrThrow()

  await trx
    .insertInto('facility_consumables')
    .values({
      consumable_id,
      facility_id,
      quantity_on_hand: medicine.quantity,
    })
    .onConflict((oc) =>
      oc.constraint('facility_consumable').doUpdateSet({
        quantity_on_hand:
          sql`facility_consumables.quantity_on_hand + ${medicine.quantity}`,
      })
    )
    .executeTakeFirstOrThrow()
}

export async function procureConsumable(
  trx: TrxOrDb,
  facility_id: number,
  consumable: {
    created_by: number
    consumable_id: number
    procured_by_id?: number
    procured_by_name?: string
    quantity: number
    expiry_date?: string | null
  },
) {
  const updating_quantity_on_hand = await trx
    .insertInto('facility_consumables')
    .values({
      facility_id,
      consumable_id: consumable.consumable_id,
      quantity_on_hand: consumable.quantity,
    })
    .onConflict((oc) =>
      oc.constraint('facility_consumable').doUpdateSet({
        quantity_on_hand:
          sql`facility_consumables.quantity_on_hand + ${consumable.quantity}`,
      })
    )
    .executeTakeFirstOrThrow()

  const procured_by = consumable.procured_by_id
    ? { id: consumable.procured_by_id }
    : (
      assert(consumable.procured_by_name, 'procured_by_name is required'),
        await trx
          .insertInto('procurers')
          .values(
            { name: consumable.procured_by_name },
          )
          .returning('id')
          .executeTakeFirstOrThrow()
    )

  const procured = await trx
    .insertInto('procurement')
    .values({
      facility_id,
      consumable_id: consumable.consumable_id,
      created_by: consumable.created_by,
      quantity: consumable.quantity,
      procured_by: procured_by.id,
      expiry_date: consumable.expiry_date,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  await updating_quantity_on_hand

  return procured
}

export function consumeConsumable(
  trx: TrxOrDb,
  facility_id: number,
  consumable: {
    consumable_id: number
    created_by: number
    quantity: number
    procurement_id: number
  },
) {
  // Send the whole update in one query. This avoids constraint errors firing in the background when we won't catch them.
  return trx.with('adding_consumption', (qb) =>
    qb.insertInto('consumption')
      .values({
        facility_id,
        created_by: consumable.created_by,
        quantity: consumable.quantity,
        procurement_id: consumable.procurement_id,
      })
      .returning('id'))
    .with('incrementing_consumed_amount', (qb) =>
      qb.updateTable('procurement')
        .set({
          consumed_amount: sql`consumed_amount + ${consumable.quantity}`,
        })
        .where('procurement.id', '=', consumable.procurement_id))
    .with(
      'decrementing_quantity_on_hand',
      (qb) =>
        qb.updateTable('facility_consumables')
          .set({
            quantity_on_hand: sql`quantity_on_hand - ${consumable.quantity}`,
          })
          .where('facility_consumables.facility_id', '=', facility_id)
          .where(
            'facility_consumables.consumable_id',
            '=',
            consumable.consumable_id,
          ),
    )
    .selectFrom('adding_consumption')
    .selectAll()
    .executeTakeFirstOrThrow()
}

export function upsertProcurer(trx: TrxOrDb, model: Procurer) {
  return trx
    .insertInto('procurers')
    .values(model)
    .onConflict((c) => c.column('id').doUpdateSet(model))
    .execute()
}
