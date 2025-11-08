import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, describe } from 'std/testing/bdd.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as doctor_reviews from '../../db/models/doctor_reviews.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { withTestOrganizations } from '../_helpers/organizations.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
} from '../_helpers/workflows.ts'

describe('db/models/doctor_reviews.ts', () => {
  afterAll(() => db.destroy())
  describe('create', () => {
    itUsesTrxAnd(
      'creates a new patient encounter for a patient seeking treatment, adding the patient to the waiting room',
      (trx) =>
        withTestOrganizations(
          trx,
          { count: 2 },
          async ([clinic_id, virtual_hospital_id]) => {
            const nurse = await addTestEmployee(trx, {
              profession: 'nurse',
              specialty: 'primary care',
              registration_status: 'approved',
              organization_id: clinic_id,
            })

            const doctor = await addTestEmployee(trx, {
              profession: 'doctor',
              organization_id: virtual_hospital_id,
            })

            const { patient, ...patient_encounter } =
              await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
                trx,
                clinic_id,
                {
                  employment_id: nurse.employee_id,
                },
              )

            await doctor_reviews.upsertRequest(trx, {
              patient_id: patient.id,
              patient_encounter_id: patient_encounter.patient_encounter_id,
              requested_by:
                patient_encounter.employee.patient_encounter_employee_id,
              doctor_id: doctor.employee_id!,
            })

            const patient_review_requests = await trx.selectFrom(
              'doctor_review_requests',
            )
              .selectAll()
              .where('patient_id', '=', patient.id)
              .execute()

            assertEquals(patient_review_requests.length, 1)
            assertEquals(
              patient_review_requests[0].doctor_id,
              doctor.employee_id!,
            )

            const requests = await doctor_reviews.requestsOfHealthWorker(
              trx,
              doctor.id,
            ).execute()
            assertEquals(requests.length, 1)

            await doctor_reviews.addSelfAsReviewer(trx, {
              patient_id: patient.id,
              health_worker: await health_workers.getEmployed(trx, {
                health_worker_id: doctor.id,
              }),
            })

            const reviews = await doctor_reviews.ofHealthWorker(trx, doctor.id)
              .execute()

            assertEquals(reviews.length, 1)
          },
        ),
    )
  })
})
