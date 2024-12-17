import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestHealthWorkerWithSession, route } from '../../utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../db/models/patient_encounters.ts'
import db from '../../../../db/db.ts'
import generateUUID from '../../../../util/uuid.ts'
import { withTestOrganization } from '../../utilities.ts'

describe(
  '/app/organizations/[organization_id]/patients',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it("can search for patients, sending back an appropriate href depending on whether the patient is in the organization's waiting room", () =>
      withTestOrganization(db, async (organization_id) => {
        const { fetch } = await addTestHealthWorkerWithSession(db, {
          scenario: 'approved-nurse',
          organization_id,
        })

        const unique_name = generateUUID()
        const patient_not_in_waiting_room = await patients.insert(db, {
          name: unique_name + ' not in waiting room',
        })

        const patient_in_waiting_room_name = unique_name + ' in waiting room'
        const encounter = await patient_encounters.upsert(db, organization_id, {
          patient_name: patient_in_waiting_room_name,
          reason: 'seeking treatment',
        })

        const response = await fetch(
          `${route}/app/organizations/${organization_id}/patients?search=${unique_name}`,
          {
            headers: {
              accept: 'application/json',
            },
          },
        )

        assert(response.ok, 'should have returned ok')
        const json = await response.json()

        assertEquals(json, [
          {
            id: encounter.patient_id,
            name: patient_in_waiting_room_name,
            href: `/app/patients/${encounter.patient_id}`,
            in_waiting_room: true,
            avatar_url: null,
            description: 'null - null',
          },
          {
            id: patient_not_in_waiting_room.id,
            name: patient_not_in_waiting_room.name,
            href:
              `/app/organizations/${organization_id}/waiting_room/add?patient_id=${patient_not_in_waiting_room.id}`,
            in_waiting_room: false,
            avatar_url: null,
            description: 'null - null',
          },
        ])
      }))
  },
)
