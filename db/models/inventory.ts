/* TODO: As of 2024-11-03 Appears to be breaking on procurement
error: Uncaught (in promise) Error: no result
                ? new errorConstructor(this.toOperationNode())
                  ^
    at InsertQueryBuilder.executeTakeFirstOrThrow (https://cdn.jsdelivr.net/npm/kysely/dist/esm/query-builder/insert-query-builder.js:813:19)
    at eventLoopTick (ext:core/01_core.js:175:7)
    at async Module.addOrganizationMedicine (file:///Users/willweiss/dev/morehumaninternet/virtual-hospitals-africa/db/models/inventory.ts:391:29)
    at async addInventoryTransactions (file:///Users/willweiss/dev/morehumaninternet/virtual-hospitals-africa/scripts/add_dummy_data.ts:216:5)
    at async addDummyData (file:///Users/willweiss/dev/morehumaninternet/virtual-hospitals-africa/scripts/add_dummy_data.ts:236:3)
*/
import { SelectQueryBuilder, sql } from 'kysely'
import {
  MedicationProcurement,
  OrganizationDevice,
  Procurer,
  RenderedInventoryHistory,
  RenderedInventoryHistoryConsumption,
  RenderedInventoryHistoryProcurement,
  RenderedOrganizationConsumable,
  RenderedOrganizationDevice,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFromColumn, jsonObjectFrom, literalNumber, literalOptionalDate, literalString, longFormattedDateTime } from '../helpers.ts'
import { employees } from './employees.ts'
import { longFormattedDate } from '../helpers.ts'
import { jsonBuildObject } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { DB } from '../../db.d.ts'

export const inventory = {
  getDevices(
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
  },
  getConsumables(
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
        'medication_doses',
        'consumables.id',
        'medication_doses.id',
      )
      .where(
        'organization_consumables.organization_id',
        '=',
        opts.organization_id,
      )
      .where('medication_doses.id', 'is', null)
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
  },
  // TODO: update return type to match RenderedOrganizationMedication or create dedicated type
  getMedicines(
    trx: TrxOrDb,
    opts: {
      organization_id: string
    },
    // deno-lint-ignore no-explicit-any
  ): Promise<any[]> {
    return trx
      .selectFrom('organization_consumables')
      .innerJoin(
        'consumables',
        'organization_consumables.consumable_id',
        'consumables.id',
      )
      .innerJoin(
        'medication_doses',
        'medication_doses.id',
        'consumables.id',
      )
      .innerJoin(
        'medications',
        'medication_doses.medication_id',
        'medications.id',
      )
      .where(
        'organization_consumables.organization_id',
        '=',
        opts.organization_id,
      )
      .select([
        'consumables.name',
        'medications.applicant_name',
        'medications.form',
        'medications.trade_name',
        'consumables.id as consumable_id',
        'quantity_on_hand',
        sql<string>`COALESCE((
          SELECT string_agg(md.value::text || ' ' || md.description, '; ')
          FROM medication_doses md
          WHERE md.medication_id = medications.id
        ), '')`.as('strength_display'),
        jsonBuildObject({
          add: sql<string>`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/add_medicine?medication_id=', medications.id::text)
        `,
          history: sql<string>`
          concat('/app/organizations/', ${opts.organization_id}::text, '/inventory/history?consumable_id=', consumables.id::text)
        `,
        }).as('actions'),
      ])
      .execute()
  },
  consumptionQuery(
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
        jsonObjectFrom(
          employees.baseQuery(trx, {})
            .where('employment.id', '=', eb.ref('consumption.created_by')),
        ).$notNull().as('created_by'),
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
  },
  procurementQuery(
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
        jsonObjectFrom(
          employees.baseQuery(trx, {})
            .where('employment.id', '=', eb.ref('procurement.created_by')),
        ).$notNull().as('created_by'),
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
  },
  getConsumablesHistoryQuery(
    trx: TrxOrDb,
    { organization_id, consumable_id }: {
      organization_id: string
      consumable_id: string
    },
  ): SelectQueryBuilder<
    DB,
    'consumption' | 'employment' | 'health_workers' | 'procurement',
    RenderedInventoryHistory
  > {
    const consumption = inventory.consumptionQuery(trx, { organization_id })
      .where('procurement.consumable_id', '=', consumable_id)

    const procurement = inventory.procurementQuery(trx, { organization_id })
      .where('procurement.consumable_id', '=', consumable_id)

    return (consumption as SelectQueryBuilder<
      DB,
      'consumption' | 'employment' | 'health_workers' | 'procurement',
      RenderedInventoryHistory
    >)
      .unionAll(procurement)
      .orderBy('created_at', 'desc')
  },
  getConsumablesHistory(
    trx: TrxOrDb,
    opts: {
      organization_id: string
      consumable_id: string
    },
  ): Promise<{
    name: string
    history: RenderedInventoryHistory[]
  }> {
    const history = inventory.getConsumablesHistoryQuery(trx, opts)

    return trx.selectFrom('consumables')
      .select([
        'consumables.name',
        jsonArrayFrom(history).as('history'),
      ])
      .where('consumables.id', '=', opts.consumable_id)
      .executeTakeFirstOrThrow()
  },
  getLatestProcurement(
    trx: TrxOrDb,
    { organization_id, medication_id }: {
      organization_id: string
      medication_id: string
    },
  ): Promise<MedicationProcurement | undefined> {
    return inventory.procurementQuery(trx, { organization_id })
      .innerJoin(
        'medication_doses',
        'procurement.consumable_id',
        'medication_doses.id',
      )
      .where(
        'medication_doses.medication_id',
        '=',
        medication_id,
      )
      .select([
        'procurement.quantity',
        'procurement.container_size',
        'procurement.number_of_containers',
      ])
      .orderBy('procurement.created_at', 'desc')
      .executeTakeFirst()
  },
  getAvailableTests(
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
  },
  addOrganizationDevice(
    trx: TrxOrDb,
    model: OrganizationDevice,
  ): Promise<{ id: string }> {
    return trx
      .insertInto('organization_devices')
      .values(model)
      .returning('id')
      .executeTakeFirstOrThrow()
  },
  async addOrganizationMedicine(
    trx: TrxOrDb,
    organization_id: string,
    medicine: {
      created_by: string
      medication_id: string
      procured_from_id?: string
      procured_from_name?: string
      quantity: number
      number_of_containers: number
      container_size: number
      expiry_date?: string
      batch_number?: string
    },
  ) {
    const procured_from = medicine.procured_from_id ? { id: medicine.procured_from_id } : (assert(medicine.procured_from_name),
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
        // Find the consumable for this medication (via medication_doses)
        eb.selectFrom('medication_doses')
          .where(
            'medication_doses.medication_id',
            '=',
            medicine.medication_id,
          )
          .select([
            'medication_doses.id as consumable_id',
            literalString(medicine.created_by).as('created_by'),
            literalString(organization_id).as('organization_id'),
            literalNumber(medicine.quantity).as('quantity'),
            literalNumber(
              medicine.number_of_containers,
            ).as('number_of_containers'),
            literalNumber(medicine.container_size).as('container_size'),
            literalString(procured_from.id).as('procured_from'),
            literalOptionalDate(medicine.expiry_date).as('expiry_date'),
            sql.lit<string | undefined>(medicine.batch_number).as(
              'batch_number',
            ),
          ])
          .limit(1)
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
          quantity_on_hand: sql`organization_consumables.quantity_on_hand + ${medicine.quantity}`,
        })
      )
      .executeTakeFirstOrThrow()
  },
  async procureConsumable(
    trx: TrxOrDb,
    organization_id: string,
    consumable: {
      created_by: string
      consumable_id: string
      procured_from_id?: string
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
          quantity_on_hand: sql`organization_consumables.quantity_on_hand + ${consumable.quantity}`,
        })
      )
      .executeTakeFirstOrThrow()

    const procured_from = consumable.procured_from_id ? { id: consumable.procured_from_id } : (
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
  },
  consumeConsumable(
    trx: TrxOrDb,
    organization_id: string,
    consumable: {
      consumable_id: string
      created_by: string
      quantity: number
      procurement_id: string
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
      .with(
        'incrementing_consumed_amount',
        (qb) =>
          qb.updateTable('procurement')
            .set({
              consumed_amount: sql`consumed_amount + ${consumable.quantity}`,
            })
            .where('procurement.id', '=', consumable.procurement_id),
      )
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
  },
  upsertProcurer(trx: TrxOrDb, procurer: Procurer) {
    return trx
      .insertInto('procurers')
      .values(procurer)
      .onConflict((c) => c.column('id').doUpdateSet(procurer))
      .execute()
  },
}
