import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as inventory from '../../db/models/inventory.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestFacility,
} from '../web/utilities.ts'

describe('db/models/inventory.ts', { sanitizeResources: false }, () => {
  describe('getAvailableTestsInFacility', () => {
    itUsesTrxAnd(
      'resolves with the available diagnostic tests in a facility',
      (trx) =>
        withTestFacility(trx, async (facility_id) => {
          const admin = await addTestHealthWorker(trx, {
            scenario: 'admin',
          })

          const contec_bc401 = await trx.selectFrom('devices')
            .where('name', '=', 'Contec BC401')
            .select('id')
            .executeTakeFirstOrThrow()

          const ls_4000 = await trx.selectFrom('devices')
            .where('name', '=', 'LS-4000 Immunofluorescence Analyser')
            .select('id')
            .executeTakeFirstOrThrow()

          await inventory.addFacilityDevice(trx, {
            device_id: contec_bc401.id,
            facility_id,
          }, admin.id)

          await inventory.addFacilityDevice(trx, {
            device_id: ls_4000.id,
            facility_id,
          }, admin.id)

          const available_tests = await inventory
            .getAvailableTestsInFacility(trx, {
              facility_id,
            })

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
})
