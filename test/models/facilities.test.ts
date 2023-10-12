import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as employment from '../../db/models/employment.ts'
import * as facilities from '../../db/models/facilities.ts'
import * as health_workers from '../../db/models/health_workers.ts'

describe('db/models/facilities.ts', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  describe('getEmployees', () => {
    it('gets the employees of a facility, with or without invitees', async () => {
      const hw_at_facility1 = await health_workers.upsert(db, {
        name: 'At Facility 1',
        email: 'at_facility1@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(hw_at_facility1)

      const hw_at_facility2 = await health_workers.upsert(db, {
        name: 'At Facility 2',
        email: 'at_facility2@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(hw_at_facility2)

      const hw_other_facility = await health_workers.upsert(db, {
        name: 'At Facility 3',
        email: 'previous3@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(hw_other_facility)

      await employment.add(db, [
        {
          health_worker_id: hw_at_facility1.id,
          facility_id: 3,
          profession: 'doctor',
        },
        {
          health_worker_id: hw_at_facility1.id,
          facility_id: 3,
          profession: 'admin',
        },
        {
          health_worker_id: hw_at_facility2.id,
          facility_id: 3,
          profession: 'doctor',
        },
        {
          health_worker_id: hw_at_facility2.id,
          facility_id: 3,
          profession: 'nurse',
        },
        {
          health_worker_id: hw_other_facility.id,
          facility_id: 4,
          profession: 'doctor',
        },
      ])

      await employment.addInvitees(db, 3, [
        {
          email: 'invitee@test.com',
          profession: 'doctor',
        },
      ])

      const withInvitees = await facilities.getEmployees(db, {
        facility_id: 3,
        include_invitees: true,
      })

      assertEquals(withInvitees, [
        {
          avatar_url: 'avatar_url',
          email: 'at_facility1@worker.com',
          display_name: 'At Facility 1',
          health_worker_id: hw_at_facility1.id,
          is_invitee: false,
          name: 'At Facility 1',
          href: `/app/facilities/3/health-workers/${hw_at_facility1.id}`,
          approved: 0,
          professions: [
            'admin',
            'doctor',
          ],
        },
        {
          avatar_url: 'avatar_url',
          email: 'at_facility2@worker.com',
          display_name: 'At Facility 2',
          health_worker_id: hw_at_facility2.id,
          is_invitee: false,
          name: 'At Facility 2',
          href: `/app/facilities/3/health-workers/${hw_at_facility2.id}`,
          approved: 0,
          professions: [
            'doctor',
            'nurse',
          ],
        },
        {
          avatar_url: null,
          email: 'invitee@test.com',
          display_name: 'invitee@test.com',
          health_worker_id: null,
          is_invitee: true,
          name: null,
          href: null,
          approved: 0,
          professions: [
            'doctor',
          ],
        },
      ])

      const withoutInvitees = await facilities.getEmployees(db, {
        facility_id: 3,
        include_invitees: false,
      })

      assertEquals(withoutInvitees, [
        {
          avatar_url: 'avatar_url',
          email: 'at_facility1@worker.com',
          display_name: 'At Facility 1',
          health_worker_id: hw_at_facility1.id,
          is_invitee: false,
          name: 'At Facility 1',
          href: `/app/facilities/3/health-workers/${hw_at_facility1.id}`,
          approved: 0,
          professions: [
            'admin',
            'doctor',
          ],
        },
        {
          avatar_url: 'avatar_url',
          email: 'at_facility2@worker.com',
          display_name: 'At Facility 2',
          health_worker_id: hw_at_facility2.id,
          is_invitee: false,
          name: 'At Facility 2',
          href: `/app/facilities/3/health-workers/${hw_at_facility2.id}`,
          approved: 0,
          professions: [
            'doctor',
            'nurse',
          ],
        },
      ])
    })
  })
})
