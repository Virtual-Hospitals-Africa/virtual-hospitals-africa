import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
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
        await patient_encounters.create(db, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_id: 'next_available',
        })

        assertEquals(await waiting_room.get(db, { facility_id: 1 }), [
          {
            appointment: null,
            patient: {
              avatar_url: null,
              href: `/app/patients/${patient.id}`,
              id: patient.id,
              name: 'Test Patient',
            },
            providers: [],
            reason: 'seeking treatment',
          },
        ])
      })

      it('creates a new patient encounter for a patient seeking treatment, adding the patient to the waiting room', async () => {
        const nurse = await addTestHealthWorker({ scenario: 'approved-nurse' })
        const patient = await patients.upsert(db, { name: 'Test Patient' })
        await patient_encounters.create(db, 1, {
          patient_id: patient.id,
          reason: 'seeking treatment',
          provider_id: nurse.employee_id!,
        })

        assertEquals(await waiting_room.get(db, { facility_id: 1 }), [
          {
            appointment: null,
            patient: {
              avatar_url: null,
              href: `/app/patients/${patient.id}`,
              id: patient.id,
              name: 'Test Patient',
            },
            providers: [
              {
                health_worker_id: nurse.id,
                employee_id: nurse.employee_id!,
                name: nurse.name,
                profession: 'nurse',
                seen_at: null,
              },
            ],
            reason: 'seeking treatment',
          },
        ])
      })
    })
  },
)
