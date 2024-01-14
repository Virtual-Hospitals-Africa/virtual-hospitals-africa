import { beforeEach, describe } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patient_measurements from '../../db/models/patient_measurements.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'

describe(
  'db/models/patient_measurements.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('upsert', () => {
      itUsesTrxAnd('can add height and weight in cm and kg', async (trx) => {
        const nurse = await addTestHealthWorker(trx, {
          scenario: 'approved-nurse',
        })
        const patient = await patients.upsert(db, { name: 'Test Patient' })
        const encounter = await patient_encounters.upsert(db, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_ids: [nurse.employee_id!],
        })
        assertEquals(encounter.provider_ids.length, 1)
        await patient_measurements.upsertVitals(db, {
          patient_id: patient.id,
          encounter_id: encounter.id,
          encounter_provider_id: encounter.provider_ids[0],
          measurements: {
            height: 170.3,
            weight: 70.4,
          },
        })
      })
    })
  },
)
