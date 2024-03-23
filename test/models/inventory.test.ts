import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as inventory from '../../db/models/inventory.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestFacility,
} from '../web/utilities.ts'
import generateUUID from '../../util/uuid.ts'

describe('db/models/inventory.ts', { sanitizeResources: false }, () => {
  describe('getAvailableTestsInFacility', () => {
    itUsesTrxAnd(
      'resolves with the available diagnostic tests in a facility',
      (trx) =>
        withTestFacility(trx, async (facility_id) => {
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

          await inventory.addFacilityDevice(trx, {
            device_id: contec_bc401.id,
            facility_id,
            created_by: admin.employee_id!,
          })

          await inventory.addFacilityDevice(trx, {
            device_id: ls_4000.id,
            facility_id,
            created_by: admin.employee_id!,
          })

          const available_tests = await inventory.getAvailableTestsInFacility(
            trx,
            {
              facility_id,
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
  }),
    describe('TestConsumption', () => {
      itUsesTrxAnd('Add consumable and check quantity', (trx) =>
        withTestFacility(trx, async (facility_id) => {
          const admin = await addTestHealthWorker(trx, {
            scenario: 'admin',
            facility_id,
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

          await inventory.addFacilityConsumable(trx, {
            consumable_id: consumable.id,
            facility_id,
            created_by: admin.id,
            quantity: 10,
            procured_by: procurer.id,
            consumed_amount: 0,
            expiry_date: null,
            procurement_id: 0,
          })

          await inventory.addFacilityConsumable(trx, {
            consumable_id: consumable.id,
            facility_id,
            created_by: admin.id,
            quantity: 5,
            procured_by: procurer.id,
            consumed_amount: 0,
            expiry_date: null,
            procurement_id: 0,
          })

          await inventory.consumeFacilityConsumable(trx, {
            consumable_id: consumable.id,
            facility_id,
            created_by: admin.id,
            quantity: 10,
            procured_by: procurer.id,
            consumed_amount: 0,
            expiry_date: null,
            procurement_id: 0,
          })

          const facilityConsumables = await inventory.getFacilityConsumables(
            trx,
            { facility_id },
          )

          assertEquals(facilityConsumables, [
            {
              consumable_id: consumable.id,
              name: consumable_name,
              quantity_on_hand: 5,
            },
          ])
        }))
    })
})
