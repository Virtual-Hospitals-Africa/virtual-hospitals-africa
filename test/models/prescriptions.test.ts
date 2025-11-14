import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as diagnoses from '../../db/models/diagnoses.ts'
import * as doctor_reviews from '../../db/models/doctor_reviews.ts'
import { sql } from 'kysely'
import db from '../../db/db.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { addTestEmployee } from '../_helpers/employees.ts'

describe('db/models/prescriptions.ts', () => {
  afterAll(() => db.destroy())
  describe('insert', () => {
    itUsesTrxAnd(
      'makes a prescription for a given prescriber and patient with 1 or more medications',
      async (trx) => {
        const nurse = await addTestEmployee(trx, {
          profession: 'nurse',
          registration_status: 'not started',
        })
        const doctor = await addTestEmployee(trx, {
          profession: 'doctor',
          organization_id: '00000000-0000-0000-0000-000000000002',
        })

        const { patient, ...encounter } =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            trx,
            '00000000-0000-0000-0000-000000000001',
            {
              employment_id: nurse.employee_id,
            },
          )

        await doctor_reviews.upsertRequest(trx, {
          patient_id: patient.id,
          doctor_id: doctor.employee_id!,
          patient_encounter_id: encounter.patient_encounter_id,
          requested_by: encounter.employee.patient_encounter_employee_id,
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
          patient_encounter_id: encounter.patient_encounter_id,
          diagnoses: [{
            condition_id: 'c_22401',
            start_date: '2020-01-01',
          }],
          diagnoses_collaborations: [],
        })

        const patient_diagnoses = await diagnoses.getFromReview(trx, {
          review_id: doctor_review.review_id,
          employment_id: doctor.employee_id!,
          patient_encounter_id: encounter.patient_encounter_id,
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
