import { describe } from 'std/testing/bdd.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as examinations from '../../db/models/examinations.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestFacility,
} from '../web/utilities.ts'

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

            const recommended = await examinations.recommended(trx)
              .selectFrom('recommended_examinations')
              .select('examination_name')
              .where('patient_id', '=', patient.id)
              .where('encounter_id', '=', patient_encounter.id)
              .execute()

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

            const recommended = await examinations.recommended(trx)
              .selectFrom('recommended_examinations')
              .select('examination_name')
              .where('patient_id', '=', patient.id)
              .where('encounter_id', '=', patient_encounter.id)
              .execute()

            assertEquals(recommended, [
              { examination_name: 'Head-to-toe Assessment' },
              { examination_name: "Women's Health Assessment" },
              { examination_name: 'Maternity Assessment' },
            ])
          }),
      )
    })

    describe('upsertFindings', () => {
      itUsesTrxAnd(
        'adds a completed examination',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const health_worker = await addTestHealthWorker(trx, {
              scenario: 'approved-nurse',
            })
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
                provider_ids: [
                  health_worker.employee_id!,
                ],
              },
            )

            const { id } = await examinations.upsertFindings(trx, {
              patient_id: patient.id,
              encounter_id: patient_encounter.id,
              encounter_provider_id:
                patient_encounter.providers[0].encounter_provider_id,
              examination_name: 'Head-to-toe Assessment',
              findings: [],
            })

            const patient_examination = await trx.selectFrom(
              'patient_examinations',
            )
              .select('completed')
              .where('id', '=', id)
              .executeTakeFirstOrThrow()

            assertEquals(patient_examination.completed, true)
          }),
      )

      itUsesTrxAnd.skip('actually adds the findings')
      itUsesTrxAnd.skip(
        'replaces previously submitted findings for this examination',
      )
    })

    describe('forPatientEncounter', () => {
      itUsesTrxAnd(
        'returns the completed, skipped, and recommended examinations for a patient encounter',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const health_worker = await addTestHealthWorker(trx, {
              scenario: 'approved-nurse',
            })
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
                provider_ids: [
                  health_worker.employee_id!,
                ],
              },
            )

            await examinations.upsertFindings(trx, {
              patient_id: patient.id,
              encounter_id: patient_encounter.id,
              encounter_provider_id:
                patient_encounter.providers[0].encounter_provider_id,
              examination_name: 'Dental',
              findings: [],
            })

            const for_patient_encounter = await examinations
              .forPatientEncounter(trx)
              .selectFrom('patient_examinations_with_recommendations')
              .select([
                'examination_name',
                'completed',
                'skipped',
                'recommended',
              ])
              .where('patient_id', '=', patient.id)
              .where('encounter_id', '=', patient_encounter.id)
              .execute()

            assertEquals(for_patient_encounter, [
              {
                examination_name: 'Head-to-toe Assessment',
                completed: false,
                skipped: false,
                recommended: true,
              },
              {
                examination_name: "Women's Health Assessment",
                completed: false,
                skipped: false,
                recommended: true,
              },
              {
                examination_name: 'Dental',
                completed: true,
                skipped: false,
                recommended: false,
              },
            ])
          }),
      )
    })
  },
)
