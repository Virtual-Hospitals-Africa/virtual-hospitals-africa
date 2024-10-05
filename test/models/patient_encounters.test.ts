import { describe } from 'std/testing/bdd.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as waiting_room from '../../db/models/waiting_room.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestOrganization,
} from '../web/utilities.ts'

describe(
  'db/models/patient_encounters.ts',
  { sanitizeResources: false },
  () => {
    describe('create', () => {
      itUsesTrxAnd(
        'creates a new patient encounter for a patient seeking treatment, adding the patient to the waiting room',
        (trx) =>
          withTestOrganization(trx, async (organization_id) => {
            const patient = await patients.insert(trx, { name: 'Test Patient' })
            await patient_encounters.upsert(trx, organization_id, {
              patient_id: patient.id,
              reason: 'seeking treatment',
            })

            const nurse = await addTestHealthWorker(trx, {
              scenario: 'approved-nurse',
            })

            const health_worker = await health_workers.getEmployed(trx, {
              health_worker_id: nurse.id,
            })

            assertEquals(
              await waiting_room.get(trx, {
                organization_id,
                health_worker,
              }),
              [
                {
                  appointment: null,
                  patient: {
                    avatar_url: null,
                    id: patient.id,
                    name: 'Test Patient',
                    description: null,
                  },
                  in_waiting_room: true,
                  arrived_ago_display: 'Just now',
                  status: 'Awaiting Intake',
                  actions: {
                    view: null,
                    review: null,
                    intake: `/app/patients/${patient.id}/intake/personal`,
                    awaiting_review: null,
                  },
                  providers: [],
                  reviewers: [],
                  reason: 'seeking treatment',
                  is_emergency: false,
                },
              ],
            )
          }),
      )

      itUsesTrxAnd(
        'creates a new patient encounter for a patient seeking treatment with a specific provider, adding the patient to the waiting room',
        (trx) =>
          withTestOrganization(trx, async (organization_id) => {
            const nurse = await addTestHealthWorker(trx, {
              scenario: 'approved-nurse',
            })
            const patient = await patients.insert(trx, { name: 'Test Patient' })
            await patient_encounters.upsert(trx, organization_id, {
              patient_id: patient.id,
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            })

            const health_worker = await health_workers.getEmployed(trx, {
              health_worker_id: nurse.id,
            })

            assertEquals(
              await waiting_room.get(trx, {
                organization_id,
                health_worker,
              }),
              [
                {
                  appointment: null,
                  patient: {
                    avatar_url: null,
                    id: patient.id,
                    name: 'Test Patient',
                    description: null,
                  },
                  in_waiting_room: true,
                  arrived_ago_display: 'Just now',
                  status: 'Awaiting Intake',
                  actions: {
                    view: null,
                    review: null,
                    intake: `/app/patients/${patient.id}/intake/personal`,
                    awaiting_review: null,
                  },
                  providers: [
                    {
                      health_worker_id: nurse.id,
                      employee_id: nurse.employee_id!,
                      name: nurse.name,
                      profession: 'nurse',
                      seen: false,
                      href:
                        `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${nurse.id}`,
                      avatar_url: nurse.avatar_url,
                    },
                  ],
                  reviewers: [],
                  reason: 'seeking treatment',
                  is_emergency: false,
                },
              ],
            )
          }),
      )
    })
  },
)
