import { SelectQueryBuilder, sql } from 'kysely'
import {
  MedicationProcurement,
  OrganizationDevice,
  Procurer,
  RenderedConsumable,
  RenderedInventoryHistory,
  RenderedInventoryHistoryConsumption,
  RenderedInventoryHistoryProcurement,
  RenderedOrganizationConsumable,
  RenderedOrganizationDevice,
  RenderedOrganizationMedicine,
  RenderedProcurer,
  TrxOrDb,
} from '../../types.ts'
import {
  jsonArrayFromColumn,
  literalNumber,
  literalOptionalDate,
  literalString,
  longFormattedDateTime,
} from '../helpers.ts'
import { strengthDisplay } from './drugs.ts'
import { longFormattedDate } from '../helpers.ts'
import { jsonBuildObject } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { DB } from '../../db.d.ts'

export function getDevices(
  trx: TrxOrDb,
  opts: {
    organization_id: string
  },
): Promise<RenderedOrganizationDevice[]> {
  return trx
    .selectFrom('organization_devices')
    .innerJoin('devices', 'organization_devices.device_id', 'devices.id')
    .where('organization_devices.organization_id', '=', opts.organization_id)
    .select((eb) => [
      'devices.id as device_id',
      'organization_devices.serial_number',
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
    organization_id: string
  },
): Promise<RenderedOrganizationConsumable[]> {
  return trx
    .selectFrom('organization_consumables')
    .innerJoin(
      'consumables',
      'organization_consumables.consumable_id',
      'consumables.id',
    )
    .leftJoin(
      'manufactured_medication_strengths',
      'consumables.id',
      'manufactured_medication_strengths.consumable_id',
    )
    .where(
      'organization_consumables.organization_id',
      '=',
      opts.organization_id,
    )
    .where('manufactured_medication_strengths.id', 'is', null)
    .select([
      'consumables.name as name',
      'consumables.id as consumable_id',
      'quantity_on_hand as quantity_on_hand',
      jsonBuildObject({
        add: sql<string>`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/add_consumable?consumable_id=', consumables.id::text)
        `,
        history: sql<string>`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/history?consumable_id=', consumables.id::text)
        `,
      }).as('actions'),
    ])
    .execute()
}

export function getMedicines(
  trx: TrxOrDb,
  opts: {
    organization_id: string
  },
): Promise<RenderedOrganizationMedicine[]> {
  return trx
    .selectFrom('organization_consumables')
    .innerJoin(
      'consumables',
      'organization_consumables.consumable_id',
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
    .where(
      'organization_consumables.organization_id',
      '=',
      opts.organization_id,
    )
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
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/add_medicine?manufactured_medication_id=', manufactured_medications.id::text, 
          '&strength=', manufactured_medication_strengths.strength_numerator::text)
        `,
        history: sql<string>`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/history?consumable_id=', consumables.id::text)
        `,
      }).as('actions'),
    ])
    .execute()
}

function consumptionQuery(
  trx: TrxOrDb,
  opts: {
    organization_id: string
  },
): SelectQueryBuilder<
  DB,
  'consumption' | 'employment' | 'health_workers' | 'procurement',
  RenderedInventoryHistoryConsumption
> {
  return trx
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
      sql<'consumption'>`'consumption'`.as('interaction'),
      jsonBuildObject({
        name: eb.ref('health_workers.name'),
        href: sql<
          string
        >`'/app/organizations/' || ${opts.organization_id} || '/employees/' || ${
          eb.ref('health_workers.id')
        }`,
        avatar_url: eb.ref('health_workers.avatar_url'),
      }).as('created_by'),
      sql<null>`NULL`.as('procured_from'),
      sql<number>`0 - consumption.quantity`.as('change'),
      'consumption.created_at',
      longFormattedDateTime('consumption.created_at').as(
        'created_at_formatted',
      ),
      sql<null | string>`NULL`.as('expiry_date'),
      'procurement.batch_number',
      sql<null>`NULL`.as('patient'),
      sql<null>`NULL`.as('actions'),
    ])
    .where('consumption.organization_id', '=', opts.organization_id)
}

function procurementQuery(
  trx: TrxOrDb,
  opts: {
    organization_id: string
  },
): SelectQueryBuilder<
  DB,
  'employment' | 'health_workers' | 'procurement',
  RenderedInventoryHistoryProcurement
> {
  return trx
    .selectFrom('procurement')
    .innerJoin('employment', 'procurement.created_by', 'employment.id')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin('procurers', 'procurement.procured_from', 'procurers.id')
    .select((eb) => [
      'procurement.id as procurement_id',
      sql<'procurement'>`'procurement'`.as('interaction'),
      jsonBuildObject({
        name: eb.ref('health_workers.name'),
        href: sql<
          string
        >`'/app/organizations/' || ${opts.organization_id} || '/employees/' || ${
          eb.ref('health_workers.id')
        }`,
        avatar_url: eb.ref('health_workers.avatar_url'),
      }).as('created_by'),
      jsonBuildObject({
        id: eb.ref('procurers.id'),
        name: eb.ref('procurers.name'),
      }).as('procured_from'),
      eb.ref('procurement.quantity').as('change'),
      'procurement.created_at',
      longFormattedDateTime('procurement.created_at').as(
        'created_at_formatted',
      ),
      longFormattedDate('procurement.expiry_date').as('expiry_date'),
      'procurement.batch_number',
      sql<null>`NULL`.as('patient'),
      jsonBuildObject({
        reorder: sql.raw<string>(`'TODO'`),
      }).as('actions'),
    ])
    .where('procurement.organization_id', '=', opts.organization_id)
}

export function getConsumablesHistoryQuery(
  trx: TrxOrDb,
  { organization_id, consumable_id }: {
    organization_id: string
    consumable_id: number
  },
): SelectQueryBuilder<
  DB,
  'consumption' | 'employment' | 'health_workers' | 'procurement',
  RenderedInventoryHistory
> {
  const consumption = consumptionQuery(trx, { organization_id })
    .where('procurement.consumable_id', '=', consumable_id)

  const procurement = procurementQuery(trx, { organization_id })
    .where('procurement.consumable_id', '=', consumable_id)

  return (consumption as SelectQueryBuilder<
    DB,
    'consumption' | 'employment' | 'health_workers' | 'procurement',
    RenderedInventoryHistory
  >)
    .unionAll(procurement)
    .orderBy('created_at', 'desc')
}

export function getConsumablesHistory(
  trx: TrxOrDb,
  opts: {
    organization_id: string
    consumable_id: number
  },
): Promise<{
  name: string
  history: RenderedInventoryHistory[]
}> {
  const history = getConsumablesHistoryQuery(trx, opts)

  return trx.selectFrom('consumables')
    .select([
      'consumables.name',
      jsonArrayFrom(history).as('history'),
    ])
    .where('consumables.id', '=', opts.consumable_id)
    .executeTakeFirstOrThrow()
}

export function getLatestProcurement(
  trx: TrxOrDb,
  { organization_id, manufactured_medication_id, strength }: {
    organization_id: string
    manufactured_medication_id: number
    strength?: number
  },
): Promise<MedicationProcurement | undefined> {
  let query = procurementQuery(trx, { organization_id })
    .innerJoin(
      'manufactured_medication_strengths',
      'procurement.consumable_id',
      'manufactured_medication_strengths.consumable_id',
    )
    .where(
      'manufactured_medication_strengths.manufactured_medication_id',
      '=',
      manufactured_medication_id,
    )
    .select([
      'manufactured_medication_strengths.strength_numerator as strength',
      'procurement.quantity',
      'procurement.container_size',
      'procurement.number_of_containers',
    ])
    .orderBy('procurement.created_at', 'desc')

  if (strength) {
    query = query.where(
      'manufactured_medication_strengths.strength_numerator',
      '=',
      strength,
    )
  }
  return query.executeTakeFirst()
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
    organization_id: string
  },
): Promise<{ diagnostic_test: string }[]> {
  return trx
    .selectFrom('organization_devices')
    .innerJoin('devices', 'organization_devices.device_id', 'devices.id')
    .innerJoin(
      'device_capabilities',
      'devices.id',
      'device_capabilities.device_id',
    )
    .where('organization_devices.organization_id', '=', opts.organization_id)
    .select('device_capabilities.diagnostic_test')
    .distinct()
    .execute()
}

export function addOrganizationDevice(
  trx: TrxOrDb,
  model: OrganizationDevice,
): Promise<{ id: number }> {
  return trx
    .insertInto('organization_devices')
    .values(model)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function addOrganizationMedicine(
  trx: TrxOrDb,
  organization_id: string,
  medicine: {
    created_by: number
    manufactured_medication_id: number
    procured_from_id?: number
    procured_from_name?: string
    quantity: number
    number_of_containers: number
    container_size: number
    strength: number
    expiry_date?: string
    batch_number?: string
  },
) {
  const procured_from = medicine.procured_from_id
    ? { id: medicine.procured_from_id }
    : (assert(medicine.procured_from_name),
      await trx
        .insertInto('procurers')
        .values({ name: medicine.procured_from_name })
        .returning('id')
        .executeTakeFirstOrThrow())

  const { consumable_id } = await trx.insertInto('procurement')
    .columns([
      'consumable_id',
      'created_by',
      'organization_id',
      'quantity',
      'number_of_containers',
      'container_size',
      'procured_from',
      'expiry_date',
      'batch_number',
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
          literalString(organization_id).as('organization_id'),
          literalNumber(medicine.quantity).as('quantity'),
          literalNumber(medicine.number_of_containers).as(
            'number_of_containers',
          ),
          literalNumber(medicine.container_size).as('container_size'),
          literalNumber(procured_from.id).as('procured_from'),
          literalOptionalDate(medicine.expiry_date).as('expiry_date'),
          sql.lit<string | undefined>(medicine.batch_number).as('batch_number'),
        ])
    )
    .returning('consumable_id')
    .executeTakeFirstOrThrow()

  await trx
    .insertInto('organization_consumables')
    .values({
      consumable_id,
      organization_id,
      quantity_on_hand: medicine.quantity,
    })
    .onConflict((oc) =>
      oc.constraint('organization_consumable').doUpdateSet({
        quantity_on_hand:
          sql`organization_consumables.quantity_on_hand + ${medicine.quantity}`,
      })
    )
    .executeTakeFirstOrThrow()
}

export async function procureConsumable(
  trx: TrxOrDb,
  organization_id: string,
  consumable: {
    created_by: number
    consumable_id: number
    procured_from_id?: number
    procured_from_name?: string
    quantity: number
    container_size: number
    number_of_containers: number
    expiry_date?: string | null
    batch_number?: string
  },
) {
  const updating_quantity_on_hand = await trx
    .insertInto('organization_consumables')
    .values({
      organization_id,
      consumable_id: consumable.consumable_id,
      quantity_on_hand: consumable.quantity,
    })
    .onConflict((oc) =>
      oc.constraint('organization_consumable').doUpdateSet({
        quantity_on_hand:
          sql`organization_consumables.quantity_on_hand + ${consumable.quantity}`,
      })
    )
    .executeTakeFirstOrThrow()

  const procured_from = consumable.procured_from_id
    ? { id: consumable.procured_from_id }
    : (
      assert(consumable.procured_from_name, 'procured_from_name is required'),
        await trx
          .insertInto('procurers')
          .values(
            { name: consumable.procured_from_name },
          )
          .returning('id')
          .executeTakeFirstOrThrow()
    )

  const procured = await trx
    .insertInto('procurement')
    .values({
      organization_id,
      consumable_id: consumable.consumable_id,
      created_by: consumable.created_by,
      quantity: consumable.quantity,
      procured_from: procured_from.id,
      expiry_date: consumable.expiry_date,
      batch_number: consumable.batch_number,
      container_size: consumable.container_size,
      number_of_containers: consumable.number_of_containers,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  await updating_quantity_on_hand

  return procured
}

export function consumeConsumable(
  trx: TrxOrDb,
  organization_id: string,
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
        organization_id,
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
        qb.updateTable('organization_consumables')
          .set({
            quantity_on_hand: sql`quantity_on_hand - ${consumable.quantity}`,
          })
          .where(
            'organization_consumables.organization_id',
            '=',
            organization_id,
          )
          .where(
            'organization_consumables.consumable_id',
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
