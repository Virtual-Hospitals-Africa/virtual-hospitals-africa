import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/meta.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as waiting_room from '../../db/models/waiting_room.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { addTestHealthWorker } from '../web/utilities.ts'

describe(
  'db/models/patient_encounters.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('create', () => {
      it('creates a new patient encounter for a patient seeking treatment, adding the patient to the waiting room', async () => {
        const patient = await patients.upsert(db, { name: 'Test Patient' })
        await patient_encounters.upsert(db, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
        })

        assertEquals(await waiting_room.get(db, { facility_id: 1 }), [
          {
            appointment: null,
            patient: {
              avatar_url: null,
              id: patient.id,
              name: 'Test Patient',
            },
            actions: {
              view: null,
              intake: `/app/patients/${patient.id}/intake/personal`,
            },
            providers: [],
            reason: 'seeking treatment',
            is_emergency: false,
          },
        ])
      })

      it('creates a new patient encounter for a patient seeking treatment with a specific provider, adding the patient to the waiting room', async () => {
        const nurse = await addTestHealthWorker({ scenario: 'approved-nurse' })
        const patient = await patients.upsert(db, { name: 'Test Patient' })
        await patient_encounters.upsert(db, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_ids: [nurse.employee_id!],
        })

        assertEquals(await waiting_room.get(db, { facility_id: 1 }), [
          {
            appointment: null,
            patient: {
              avatar_url: null,
              id: patient.id,
              name: 'Test Patient',
            },
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
      })
    })
  },
)
