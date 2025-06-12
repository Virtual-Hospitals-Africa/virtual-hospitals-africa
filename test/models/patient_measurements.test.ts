import { afterAll, describe } from 'std/testing/bdd.ts'
import * as patient_measurements from '../../db/models/patient_measurements.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import db from '../../db/db.ts'

describe(
  'db/models/patient_measurements.ts',
  () => {
    afterAll(() => db.destroy())
    describe('upsert', () => {
      itUsesTrxAnd('can add height and weight in cm and kg', async (trx) => {
        const nurse = await addTestHealthWorker(trx, {
          scenario: 'approved-nurse',
        })
        const patient = await patients.insert(trx, { name: 'Test Patient' })
        const encounter = await patient_encounters.insert(
          trx,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_id: patient.id,
            reason: 'seeking treatment',
            provider_ids: [nurse.employee_id!],
          },
        )
        assertEquals(encounter.providers.length, 1)
        await patient_measurements.upsertVitals(trx, {
          patient_id: patient.id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.providers[0].encounter_provider_id,
          input_measurements: [
            {
              measurement_name: 'height',
              value: 170.3,
              is_flagged: false,
            },
            {
              measurement_name: 'weight',
              value: 70.3,
              is_flagged: false,
            },
          ],
        })
      })
    })
  },
)
