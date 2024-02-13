import { describe } from 'std/testing/bdd.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as waiting_room from '../../db/models/waiting_room.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestHealthWorker,
  itUsesTrxAnd,
  withTestFacility,
} from '../web/utilities.ts'

describe(
  'db/models/patient_encounters.ts',
  { sanitizeResources: false },
  () => {
    describe('create', () => {
      itUsesTrxAnd(
        'creates a new patient encounter for a patient seeking treatment, adding the patient to the waiting room',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const patient = await patients.upsert(trx, { name: 'Test Patient' })
            await patient_encounters.upsert(trx, facility_id, {
              patient_id: patient.id,
              reason: 'seeking treatment',
            })

            assertEquals(await waiting_room.get(trx, { facility_id }), [
              {
                appointment: null,
                patient: {
                  avatar_url: null,
                  id: patient.id,
                  name: 'Test Patient',
                  description: null,
                },
                in_waiting_room: true,
                arrived_at: new Date(),
                status: 'Awaiting Intake',
                actions: {
                  view: null,
                  intake: `/app/patients/${patient.id}/intake/personal`,
                },
                providers: [],
                reason: 'seeking treatment',
                is_emergency: false,
              },
            ])
          }),
      )

      itUsesTrxAnd(
        'creates a new patient encounter for a patient seeking treatment with a specific provider, adding the patient to the waiting room',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const nurse = await addTestHealthWorker(trx, {
              scenario: 'approved-nurse',
            })
            const patient = await patients.upsert(trx, { name: 'Test Patient' })
            await patient_encounters.upsert(trx, facility_id, {
              patient_id: patient.id,
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            })

            assertEquals(await waiting_room.get(trx, { facility_id }), [
              {
                appointment: null,
                patient: {
                  avatar_url: null,
                  id: patient.id,
                  name: 'Test Patient',
                  description: null,
                },
                in_waiting_room: true,
                arrived_at: new Date(),
                status: 'Awaiting Intake',
                actions: {
                  view: null,
                  intake: `/app/patients/${patient.id}/intake/personal`,
                },
                providers: [
                  {
                    health_worker_id: nurse.id,
                    employee_id: nurse.employee_id!,
                    name: nurse.name,
                    profession: 'nurse',
                    seen_at: null,
                    href: `/app/facilities/1/employees/${nurse.id}`,
                  },
                ],
                reason: 'seeking treatment',
                is_emergency: false,
              },
            ])
          }),
      )
    })
  },
)
