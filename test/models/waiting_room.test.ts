import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as waiting_room from '../../db/models/waiting_room.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe(
  'db/models/waiting_room.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('get', () => {
      it('orders the waiting room by when people first arrived', async () => {
        const patient1 = await patients.upsert(db, { name: 'Test Patient 1' })
        const patient2 = await patients.upsert(db, { name: 'Test Patient 2' })

        await patient_encounters.create(db, 1, {
          patient_id: patient1.id,
          reason: 'seeking treatment',
          provider_id: 'next_available',
        })

        await patient_encounters.create(db, 1, {
          patient_id: patient2.id,
          reason: 'seeking treatment',
          provider_id: 'next_available',
        })

        assertEquals(await waiting_room.get(db, { facility_id: 1 }), [
          {
            appointment: null,
            patient: {
              avatar_url: null,
              href: `/app/patients/${patient1.id}`,
              id: patient1.id,
              name: 'Test Patient 1',
            },
            providers: [],
            reason: 'seeking treatment',
            is_emergency: false,
          },
          {
            appointment: null,
            patient: {
              avatar_url: null,
              href: `/app/patients/${patient2.id}`,
              id: patient2.id,
              name: 'Test Patient 2',
            },
            providers: [],
            reason: 'seeking treatment',
            is_emergency: false,
          },
        ])
      })

      it('orders emergencies at the top, even if they arrived later', async () => {
        const patient1 = await patients.upsert(db, { name: 'Test Patient 1' })
        const patient2 = await patients.upsert(db, { name: 'Test Patient 2' })

        await patient_encounters.create(db, 1, {
          patient_id: patient1.id,
          reason: 'seeking treatment',
          provider_id: 'next_available',
        })

        await patient_encounters.create(db, 1, {
          patient_id: patient2.id,
          reason: 'emergency',
          provider_id: 'next_available',
        })

        assertEquals(await waiting_room.get(db, { facility_id: 1 }), [
          {
            appointment: null,
            patient: {
              avatar_url: null,
              href: `/app/patients/${patient2.id}`,
              id: patient2.id,
              name: 'Test Patient 2',
            },
            providers: [],
            reason: 'emergency',
            is_emergency: true,
          },
          {
            appointment: null,
            patient: {
              avatar_url: null,
              href: `/app/patients/${patient1.id}`,
              id: patient1.id,
              name: 'Test Patient 1',
            },
            providers: [],
            reason: 'seeking treatment',
            is_emergency: false,
          },
        ])
      })
    })
  },
)
