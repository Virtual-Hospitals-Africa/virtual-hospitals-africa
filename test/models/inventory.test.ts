import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as inventory from '../../db/models/inventory.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestOrganization,
} from '../web/utilities.ts'
import db from '../../db/db.ts'
import generateUUID from '../../util/uuid.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'

describe('db/models/inventory.ts', { sanitizeResources: false }, () => {
  describe('getAvailableTests', () => {
    itUsesTrxAnd(
      'resolves with the available diagnostic tests in a organization',
      (trx) =>
        withTestOrganization(trx, async (organization_id) => {
          const admin = await addTestHealthWorker(trx, {
            scenario: 'admin',
          })

          const contec_bc401 = await trx
            .selectFrom('devices')
            .where('name', '=', 'Contec BC401')
            .select('id')
            .executeTakeFirstOrThrow()

          const ls_4000 = await trx
            .selectFrom('devices')
            .where('name', '=', 'LS-4000 Immunofluorescence Analyser')
            .select('id')
            .executeTakeFirstOrThrow()

          await inventory.addOrganizationDevice(trx, {
            device_id: contec_bc401.id,
            organization_id,
            created_by: admin.employee_id!,
          })

          await inventory.addOrganizationDevice(trx, {
            device_id: ls_4000.id,
            organization_id,
            created_by: admin.employee_id!,
          })

          const available_tests = await inventory.getAvailableTests(
            trx,
            {
              organization_id,
            },
          )

          assertEquals(available_tests, [
            { diagnostic_test: 'Anemia' },
            { diagnostic_test: 'Angiocapy' },
            { diagnostic_test: 'Bone Metabolism' },
            { diagnostic_test: 'Brain Injury' },
            { diagnostic_test: 'Cardiac' },
            { diagnostic_test: 'Diabetes' },
            { diagnostic_test: 'Gastric Function' },
            { diagnostic_test: 'Hormone' },
            { diagnostic_test: 'Immune System' },
            { diagnostic_test: 'Inflammation' },
            { diagnostic_test: 'Nervous System' },
            { diagnostic_test: 'Renal Function' },
            { diagnostic_test: 'Thyroid' },
            { diagnostic_test: 'Tumor' },
            { diagnostic_test: 'Urine Analysis' },
          ])
        }),
    )
  })
  describe('TestConsumption', () => {
    itUsesTrxAnd(
      'Add consumable and check quantity',
      (trx) =>
        withTestOrganization(trx, async (organization_id) => {
          const admin = await addTestHealthWorker(trx, {
            scenario: 'admin',
            organization_id,
          })

          const consumable_name = generateUUID()

          const consumable = await trx
            .insertInto('consumables')
            .returning('id')
            .values({ name: consumable_name })
            .executeTakeFirstOrThrow()

          const procurer = await trx
            .insertInto('procurers')
            .returning('id')
            .values({ name: generateUUID() })
            .executeTakeFirstOrThrow()

          const first_added = await inventory.procureConsumable(
            trx,
            organization_id,
            {
              consumable_id: consumable.id,
              created_by: admin.employee_id!,
              quantity: 10,
              procured_from_id: procurer.id,
              expiry_date: null,
              batch_number: '',
              container_size: 5,
              number_of_containers: 2,
            },
          )

          await inventory.procureConsumable(trx, organization_id, {
            consumable_id: consumable.id,
            created_by: admin.employee_id!,
            quantity: 5,
            procured_from_id: procurer.id,
            expiry_date: null,
            batch_number: '',
            container_size: 5,
            number_of_containers: 1,
          })

          await inventory.consumeConsumable(trx, organization_id, {
            consumable_id: consumable.id,
            created_by: admin.employee_id!,
            quantity: 10,
            procurement_id: first_added.id,
          })

          const organizationConsumables = await inventory.getConsumables(
            trx,
            { organization_id },
          )

          assertEquals(organizationConsumables, [
            {
              consumable_id: consumable.id,
              name: consumable_name,
              quantity_on_hand: 5,
              actions: {
                add:
                  `/app/organizations/${organization_id}/inventory/add_consumable?consumable_id=${consumable.id}`,
                history:
                  `/app/organizations/${organization_id}/inventory/history?consumable_id=${consumable.id}`,
              },
            },
          ])
        }),
    )

    it('rejects when consuming more than the amount previously procured', async () => {
      await withTestOrganization(db, async (organization_id) => {
        const admin = await addTestHealthWorker(db, {
          scenario: 'admin',
          organization_id,
        })

        const consumable_name = generateUUID()

        const consumable = await db
          .insertInto('consumables')
          .returning('id')
          .values({ name: consumable_name })
          .executeTakeFirstOrThrow()

        const procurer = await db
          .insertInto('procurers')
          .returning('id')
          .values({ name: generateUUID() })
          .executeTakeFirstOrThrow()

        console.log('inventory.zzz')
        const first_added = await inventory.procureConsumable(
          db,
          organization_id,
          {
            consumable_id: consumable.id,
            created_by: admin.employee_id!,
            quantity: 10,
            container_size: 5,
            number_of_containers: 2,
            procured_from_id: procurer.id,
            expiry_date: null,
            batch_number: '',
          },
        )

        console.log('inventory.procureConsumable')
        await inventory.procureConsumable(db, organization_id, {
          consumable_id: consumable.id,
          created_by: admin.employee_id!,
          quantity: 5,
          procured_from_id: procurer.id,
          expiry_date: null,
          batch_number: '',
          container_size: 5,
          number_of_containers: 1,
        })

        console.log('inventory.consumeConsumable')
        // deno-lint-ignore no-explicit-any
        const error: any = await assertRejects(() =>
          inventory.consumeConsumable(db, organization_id, {
            consumable_id: consumable.id,
            created_by: admin.employee_id!,
            quantity: 12,
            procurement_id: first_added.id,
          })
        )

        console.log(error)

        assertEquals(
          error.fields.message,
          'new row for relation "procurement" violates check constraint "procurement_consumed_amount_less_than_quantity"',
        )
      })
    })
  })
})
