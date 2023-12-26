import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as employment from '../../db/models/employment.ts'
import * as facilities from '../../db/models/facilities.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import { insertTestAddress, randomNationalId } from '../mocks.ts'

describe('db/models/facilities.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

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
          href: `/app/facilities/3/employees/${hw_at_facility1.id}`,
          registration_status: 'incomplete',
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
          href: `/app/facilities/3/employees/${hw_at_facility2.id}`,
          registration_status: 'incomplete',
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
          registration_status: 'incomplete',
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
          href: `/app/facilities/3/employees/${hw_at_facility1.id}`,
          registration_status: 'incomplete',
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
          href: `/app/facilities/3/employees/${hw_at_facility2.id}`,
          registration_status: 'incomplete',
          professions: [
            'doctor',
            'nurse',
          ],
        },
      ])
    })

    it('can get employees matching emails', async () => {
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
        emails: ['at_facility2@worker.com'],
      })

      assertEquals(withInvitees, [
        {
          avatar_url: 'avatar_url',
          email: 'at_facility2@worker.com',
          display_name: 'At Facility 2',
          health_worker_id: hw_at_facility2.id,
          is_invitee: false,
          name: 'At Facility 2',
          href: `/app/facilities/3/employees/${hw_at_facility2.id}`,
          registration_status: 'incomplete',
          professions: [
            'doctor',
            'nurse',
          ],
        },
      ])
    })

    it("assures that registration_status is pending_approval for when registration is complete, but hasn't been approved", async () => {
      const hw_at_facility1 = await health_workers.upsert(db, {
        name: 'At Facility 1',
        email: 'at_facility1@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(hw_at_facility1)

      await employment.add(db, [
        {
          health_worker_id: hw_at_facility1.id,
          facility_id: 1,
          profession: 'nurse',
        },
      ])

      const nurse_address = await insertTestAddress()
      assert(nurse_address)

      await nurse_registration_details.add(db, {
        health_worker_id: hw_at_facility1.id,
        gender: 'female',
        national_id_number: randomNationalId(),
        date_of_first_practice: '2020-01-01',
        ncz_registration_number: 'GN123456',
        mobile_number: '5555555555',
        national_id_media_id: null,
        ncz_registration_card_media_id: null,
        face_picture_media_id: null,
        nurse_practicing_cert_media_id: null,
        approved_by: null,
        date_of_birth: '2020-01-01',
        address_id: nurse_address.id,
      })

      const withInvitees = await facilities.getEmployees(db, {
        facility_id: 1,
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
          href: `/app/facilities/1/employees/${hw_at_facility1.id}`,
          registration_status: 'pending_approval',
          professions: [
            'nurse',
          ],
        },
      ])
    })

    it('assures that registration_status is approved for when registration is complete, and has been approved', async () => {
      const nurse = await health_workers.upsert(db, {
        name: 'Nurse',
        email: 'nurse@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(nurse)

      const admin = await health_workers.upsert(db, {
        name: 'Admin',
        email: 'admin@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(admin)

      await employment.add(db, [
        {
          health_worker_id: nurse.id,
          facility_id: 1,
          profession: 'nurse',
        },
        {
          health_worker_id: admin.id,
          facility_id: 1,
          profession: 'admin',
        },
      ])

      const nurse_address = await insertTestAddress()
      assert(nurse_address)

      await nurse_registration_details.add(db, {
        health_worker_id: nurse.id,
        gender: 'female',
        national_id_number: randomNationalId(),
        date_of_first_practice: '2020-01-01',
        ncz_registration_number: 'GN123456',
        mobile_number: '5555555555',
        national_id_media_id: null,
        ncz_registration_card_media_id: null,
        face_picture_media_id: null,
        nurse_practicing_cert_media_id: null,
        approved_by: admin.id,
        date_of_birth: '2020-01-01',
        address_id: nurse_address.id,
      })

      const withInvitees = await facilities.getEmployees(db, {
        facility_id: 1,
        include_invitees: true,
      })

      assertEquals(withInvitees, [
        {
          avatar_url: 'avatar_url',
          email: 'nurse@worker.com',
          display_name: 'Nurse',
          health_worker_id: nurse.id,
          is_invitee: false,
          name: 'Nurse',
          href: `/app/facilities/1/employees/${nurse.id}`,
          registration_status: 'approved',
          professions: [
            'nurse',
          ],
        },
        {
          avatar_url: 'avatar_url',
          email: 'admin@worker.com',
          display_name: 'Admin',
          health_worker_id: admin.id,
          is_invitee: false,
          name: 'Admin',
          href: `/app/facilities/1/employees/${admin.id}`,
          registration_status: 'incomplete',
          professions: [
            'admin',
          ],
        },
      ])
    })
  })

  describe('invite', () => {
    it('adds rows to health_worker_invitees if the user is not already a health worker at the facility', async () => {
      const result = await facilities.invite(db, 1, [
        { email: 'test@example.com', profession: 'nurse' },
      ])
      assertEquals(result, { success: true })
      const invitees = await db.selectFrom('health_worker_invitees').selectAll()
        .execute()

      assertEquals(invitees.length, 1)
      const invitee = invitees[0]
      assertEquals(invitee.email, 'test@example.com')
      assertEquals(invitee.profession, 'nurse')
    })

    it('adds the profession if the health worker is already employed at this facility', async () => {
      const hw_at_facility1 = await health_workers.upsert(db, {
        name: 'At Facility 1',
        email: 'at_facility1@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(hw_at_facility1)

      await employment.add(db, [
        {
          health_worker_id: hw_at_facility1.id,
          facility_id: 1,
          profession: 'admin',
        },
      ])

      const result = await facilities.invite(db, 1, [
        { email: 'at_facility1@worker.com', profession: 'doctor' },
      ])
      assertEquals(result, { success: true })
      const invitees = await db.selectFrom('health_worker_invitees').selectAll()
        .execute()

      assertEquals(invitees.length, 0)

      const employmentResult = await db.selectFrom('employment').selectAll()
        .execute()
      assertEquals(employmentResult.length, 2)
      assertEquals(
        employmentResult[0].health_worker_id,
        employmentResult[1].health_worker_id,
      )
      assertEquals(employmentResult[0].profession, 'admin')
      assertEquals(employmentResult[1].profession, 'doctor')
    })

    it('fails if the user is already a health worker at the facility with that exact profession', async () => {
      const hw_at_facility1 = await health_workers.upsert(db, {
        name: 'At Facility 1',
        email: 'at_facility1@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })
      assert(hw_at_facility1)

      await employment.add(db, [
        {
          health_worker_id: hw_at_facility1.id,
          facility_id: 1,
          profession: 'admin',
        },
      ])

      const result = await facilities.invite(db, 1, [
        { email: 'at_facility1@worker.com', profession: 'admin' },
      ])
      assertEquals(result, {
        success: false,
        error:
          'at_facility1@worker.com is already employed as a admin, please remove them from the list',
      })
    })
  })
})
