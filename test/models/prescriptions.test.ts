import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as patient_intake from '../../db/models/patient_intake.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as patients from '../../db/models/patients.ts'
import * as diagnoses from '../../db/models/diagnoses.ts'
import * as doctor_reviews from '../../db/models/doctor_reviews.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import { sql } from 'kysely'

describe('db/models/prescriptions.ts', { sanitizeResources: false }, () => {
  describe('insert', () => {
    itUsesTrxAnd(
      'makes a prescription for a given prescriber and patient with 1 or more medications',
      async (trx) => {
        const nurse = await addTestHealthWorker(trx, {
          scenario: 'nurse',
        })
        const doctor = await addTestHealthWorker(trx, {
          scenario: 'doctor',
          organization_id: '00000000-0000-0000-0000-000000000002',
        })

        const patient = await patients.insert(trx, { name: 'Billy Bob' })
        const encounter = await patient_encounters.upsert(
          trx,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_id: patient.id,
            reason: 'seeking treatment',
            notes: null,
            provider_ids: [nurse.employee_id!],
          },
        )
        await patient_intake.updateCompletion(trx, {
          patient_id: patient.id,
          intake_step_just_completed: 'summary',
          completed_intake: true,
        })

        await doctor_reviews.upsertRequest(trx, {
          patient_id: patient.id,
          requesting_doctor_id: doctor.employee_id!,
          encounter_id: encounter.id,
          requested_by: encounter.providers[0].encounter_provider_id,
        })

        await doctor_reviews.finalizeRequest(trx, {
          patient_encounter_id: encounter.id,
          requested_by: encounter.providers[0].encounter_provider_id,
        })

        const employed_doctor = await health_workers.getEmployed(trx, {
          health_worker_id: doctor.id,
        })

        const { doctor_review } = await doctor_reviews.addSelfAsReviewer(trx, {
          patient_id: patient.id,
          health_worker: employed_doctor,
        })

        await diagnoses.upsertForReview(trx, {
          review_id: doctor_review.review_id,
          employment_id: doctor.employee_id!,
          patient_id: patient.id,
          encounter_id: encounter.id,
          diagnoses: [{
            condition_id: 'c_22401',
            start_date: '2020-01-01',
          }],
          diagnoses_collaborations: [],
        })

        const patient_diagnoses = await diagnoses.getFromReview(trx, {
          review_id: doctor_review.review_id,
          employment_id: doctor.employee_id!,
          encounter_id: encounter.id,
        })

        const tablet = await trx
          .selectFrom('manufactured_medications')
          .innerJoin(
            'medications',
            'manufactured_medications.medication_id',
            'medications.id',
          )
          .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
          .select([
            'manufactured_medications.id',
            'manufactured_medications.medication_id',
            'manufactured_medications.strength_numerators',
            'drugs.generic_name',
            'routes',
          ])
          .where(
            'form',
            '=',
            'TABLET',
          )
          .orderBy('drugs.generic_name desc')
          .executeTakeFirstOrThrow()

        const result = await prescriptions.upsert(trx, {
          prescriber_id: doctor_review.employment_id,
          patient_id: patient.id,
          doctor_review_id: doctor_review.review_id,
          prescribing: [
            {
              patient_condition_id:
                patient_diagnoses.self[0].patient_condition_id,
              medication_id: tablet.medication_id,
              strength: tablet.strength_numerators[0],
              route: tablet.routes[0],
              schedules: [{
                dosage: 1,
                frequency: 'qw',
                duration: 1,
                duration_unit: 'years',
              }],
            },
          ],
        })

        // Check prescriptions
        assertEquals(
          result.prescriber_id,
          doctor_review.employment_id,
        )
        assertEquals(
          result.patient_id,
          patient.id!,
        )

        // Check patient_condition_medications
        const patient_medication = await trx
          .selectFrom('patient_condition_medications')
          .where('medication_id', '=', tablet.medication_id)
          .where(
            'patient_condition_id',
            '=',
            patient_diagnoses.self[0].patient_condition_id,
          )
          .select(sql`TO_JSON(schedules)`.as('schedules'))
          .select('id')
          .executeTakeFirstOrThrow()

        assertEquals(patient_medication.schedules, [{
          dosage: 1,
          duration: 1,
          duration_unit: 'years',
          frequency: 'qw',
        }])

        // Check prescription_medications
        const prescription_medication = await trx
          .selectFrom('prescription_medications')
          .where('prescription_id', '=', result.id)
          .select('patient_condition_medication_id')
          .executeTakeFirstOrThrow()

        assertEquals(
          patient_medication.id,
          prescription_medication.patient_condition_medication_id!,
        )
      },
    )
  })
})
