import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import omit from '../../util/omit.ts'
import { EmployedHealthWorker, EmploymentInfo } from '../../types.ts'
import { assertArrayIncludes } from 'https://deno.land/std@0.160.0/testing/asserts.ts'

describe('db/models/health_workers.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('upsertWithGoogleCredentials', () => {
    it('works even if a previous health worker without tokens was inserted', async () => {
      await health_workers.upsert(db, {
        name: 'Previous Worker',
        email: 'previous@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      })

      const result = await health_workers.upsertWithGoogleCredentials(db, {
        name: 'Test Worker',
        email: 'test@worker.com',
        avatar_url: 'avatar_url',
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_at: new Date(),
      })

      assert(result)
      assertEquals(
        await health_workers.get(db, { health_worker_id: result.id }),
        { ...result, employment: [] as EmployedHealthWorker['employment'] },
      )
      assertEquals(result.access_token, 'test_access_token')
      assertEquals(result.refresh_token, 'test_refresh_token')
    })
  })

  describe('get', () => {
    it('returns the health worker and their employment information', async () => {
      const healthWorker = await health_workers.upsertWithGoogleCredentials(
        db,
        {
          name: 'Worker',
          email: 'test@worker.com',
          avatar_url: 'avatar_url',
          gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
          gcal_availability_calendar_id: 'gcal_availability_calendar_id',
          access_token: 'access_token',
          refresh_token: 'refresh_token',
          expires_at: new Date(),
        },
      )
      console.log(healthWorker.id)

      await employment.add(db, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }])

      const result = await health_workers.get(db, { email: 'test@worker.com' })
      assert(result)

      assertEquals(omit(['expires_at', 'created_at', 'updated_at'])(result), {
        avatar_url: 'avatar_url',
        email: 'test@worker.com',
        employment: [
          {
            facility_id: 1,
            roles: {
              admin: {
                employed_as: false,
                registration_completed: false,
                registration_needed: false,
                registration_pending_approval: false,
              },
              doctor: {
                employed_as: false,
                registration_completed: false,
                registration_needed: false,
                registration_pending_approval: false,
              },
              nurse: {
                employed_as: true,
                registration_completed: false,
                registration_needed: true,
                registration_pending_approval: true,
              },
            },
          },
        ],
        gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
        gcal_availability_calendar_id: 'gcal_availability_calendar_id',
        id: healthWorker.id,
        name: 'Worker',
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      })
    })
  })

  describe('getEmploymentInfo', () => {
    it('returns the health worker and their employment information if that matches a given facility id', async () => {
      const healthWorker = await health_workers.upsertWithGoogleCredentials(
        db,
        {
          name: 'Worker',
          email: 'test@worker.com',
          avatar_url: 'avatar_url',
          gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
          gcal_availability_calendar_id: 'gcal_availability_calendar_id',
          access_token: 'access_token',
          refresh_token: 'refresh_token',
          expires_at: new Date(),
        },
      )

      await employment.add(db, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }])

      await employment.add(db, [{
        health_worker_id: healthWorker.id,
        profession: 'doctor',
        facility_id: 2,
      }])

      const result = await health_workers.getEmploymentInfo(
        db,
        healthWorker.id,
        1,
      )
      assert(result)

      assertArrayIncludes(
        result,
        [
          {
            address: 'Bristol, UK',
            avatar_url: 'avatar_url',
            date_of_first_practice: null,
            email: 'test@worker.com',
            facility_id: 1,
            facility_name: 'VHA Test Hospital',
            gender: null,
            health_worker_id: null,
            mobile_number: null,
            name: 'Worker',
            national_id: null,
            ncz_registration_number: null,
            profession: 'nurse',
          },
          {
            address: 'Beitbridge, Matabeleland South Province, ZW',
            avatar_url: 'avatar_url',
            date_of_first_practice: null,
            email: 'test@worker.com',
            facility_id: 2,
            facility_name: 'Beitbridge',
            gender: null,
            health_worker_id: null,
            mobile_number: null,
            name: 'Worker',
            national_id: null,
            ncz_registration_number: null,
            profession: 'doctor',
          },
        ]
      )
    })
  })
})
