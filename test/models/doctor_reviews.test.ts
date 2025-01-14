import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe } from 'std/testing/bdd.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as doctor_reviews from '../../db/models/doctor_reviews.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestOrganizations,
} from '../web/utilities.ts'

describe('db/models/doctor_reviews.ts', { sanitizeResources: false }, () => {
  describe('create', () => {
    itUsesTrxAnd(
      'creates a new patient encounter for a patient seeking treatment, adding the patient to the waiting room',
      (trx) =>
        withTestOrganizations(
          trx,
          { count: 2 },
          async ([clinic_id, virtual_hospital_id]) => {
            const patient = await patients.insert(trx, { name: 'Test Patient' })
            const nurse = await addTestHealthWorker(trx, {
              scenario: 'approved-nurse',
              organization_id: clinic_id,
            })

            const doctor = await addTestHealthWorker(trx, {
              scenario: 'doctor',
              organization_id: virtual_hospital_id,
            })

            const patient_encounter = await patient_encounters.upsert(
              trx,
              clinic_id,
              {
                patient_id: patient.id,
                reason: 'seeking treatment',
                provider_ids: [nurse.employee_id!],
              },
            )

            await doctor_reviews.upsertRequest(trx, {
              patient_id: patient.id,
              encounter_id: patient_encounter.id,
              requested_by:
                patient_encounter.providers[0].encounter_provider_id,
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

            const employed_doctor = await health_workers.getEmployed(trx, {
              health_worker_id: doctor.id,
            })
            assertEquals(employed_doctor.reviews.requested.length, 1)

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
