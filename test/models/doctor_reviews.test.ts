import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import * as doctor_reviews from '../../db/models/doctor_reviews.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'

import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
} from '../_helpers/workflows.ts'

describe('db/models/doctor_reviews.ts', () => {
  afterAll(() => db.destroy())
  describe('create', () => {
    it(
      'creates a new patient encounter for a patient seeking treatment, adding the patient to the waiting room',
      async () => {
        const clinic = await createTestOrganization(db, { category: 'Clinic' })
        const hospital = await createTestOrganization(db, {
          category: 'Hospital',
        })

        const nurse = await addTestEmployee(db, {
          profession: 'nurse',
          specialty: 'Primary care',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

        const doctor = await addTestEmployee(db, {
          profession: 'doctor',
          organization_id: hospital.id,
        })

        const { patient, ...patient_encounter } =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            clinic.id,
            {
              employment_id: nurse.employee_id,
            },
          )

        await doctor_reviews.upsertRequest(db, {
          patient_id: patient.id,
          patient_encounter_id: patient_encounter.patient_encounter_id,
          requested_by:
            patient_encounter.employee.patient_encounter_employee_id,
          doctor_id: doctor.employee_id,
        })

        const patient_review_requests = await db.selectFrom(
          'doctor_review_requests',
        )
          .selectAll()
          .where('patient_id', '=', patient.id)
          .execute()

        assertEquals(patient_review_requests.length, 1)
        assertEquals(
          patient_review_requests[0].doctor_id,
          doctor.employee_id,
        )

        const requests = await doctor_reviews.requestsOfHealthWorker(
          db,
          doctor.id,
        ).execute()
        assertEquals(requests.length, 1)

        await doctor_reviews.addSelfAsReviewer(db, {
          patient_id: patient.id,
          health_worker: await health_workers.getEmployed(db, {
            health_worker_id: doctor.id,
          }),
        })

        const reviews = await doctor_reviews.ofHealthWorker(db, doctor.id)
          .execute()

        assertEquals(reviews.length, 1)
      },
    )
  })
})
