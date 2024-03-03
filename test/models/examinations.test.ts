import { describe } from 'std/testing/bdd.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as examinations from '../../db/models/examinations.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { itUsesTrxAnd, withTestFacility } from '../web/utilities.ts'

describe(
  'db/models/examinations.ts',
  { sanitizeResources: false },
  () => {
    describe('recommended', () => {
      itUsesTrxAnd(
        'returns the recommended examinations for an adult woman',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const patient = await patients.upsert(trx, {
              name: 'Test Woman',
              gender: 'female',
              date_of_birth: '1990-01-01',
            })
            const patient_encounter = await patient_encounters.upsert(
              trx,
              facility_id,
              {
                patient_id: patient.id,
                reason: 'seeking treatment',
              },
            )

            const recommended = await examinations.recommended(trx, {
              patient_id: patient.id,
              encounter_id: patient_encounter.id,
            }).execute()

            assertEquals(recommended, [
              { examination_name: 'Head-to-toe Assessment' },
              { examination_name: "Women's Health Assessment" },
            ])
          }),
      )

      itUsesTrxAnd(
        'returns the recommended examinations for a maternity visit',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const patient = await patients.upsert(trx, {
              name: 'Test Woman',
              gender: 'female',
              date_of_birth: '1990-01-01',
            })
            const patient_encounter = await patient_encounters.upsert(
              trx,
              facility_id,
              {
                patient_id: patient.id,
                reason: 'maternity',
              },
            )

            const recommended = await examinations.recommended(trx, {
              patient_id: patient.id,
              encounter_id: patient_encounter.id,
            }).execute()

            assertEquals(recommended, [
              { examination_name: 'Head-to-toe Assessment' },
              { examination_name: "Women's Health Assessment" },
              { examination_name: 'Maternity Assessment' },
            ])
          }),
      )
    })
  },
)
