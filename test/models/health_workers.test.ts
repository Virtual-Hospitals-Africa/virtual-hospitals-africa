import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import * as nurse_specialties from '../../db/models/nurse_specialties.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import { resetInTest } from '../../db/reset.ts'
import * as media from '../../db/models/media.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import omit from '../../util/omit.ts'
import { EmployedHealthWorker } from '../../types.ts'

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

  describe('getEmployeeInfo', () => {
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
      }, {
        health_worker_id: healthWorker.id,
        profession: 'doctor',
        facility_id: 2,
      }])

      const result = await health_workers.getEmployeeInfo(
        db,
        healthWorker.id,
        1,
      )

      assert(result)
      assertEquals(result.health_worker_id, healthWorker.id)
      assertEquals(result.gender, null)
      assertEquals(result.name, 'Worker')
      assertEquals(result.mobile_number, null)
      assertEquals(result.avatar_url, 'avatar_url')
      assertEquals(result.date_of_first_practice, null)
      assertEquals(result.email, 'test@worker.com')
      assertEquals(result.national_id, null)
      assertEquals(result.ncz_registration_number, null)
      assertEquals(result.specialty, null)
      assertEquals(result.registration_completed, false)
      assertEquals(result.registration_needed, true)
      assertEquals(result.registration_pending_approval, false)
      assertEquals(
        result.employment,
        [
          {
            facility_id: 1,
            facility_name: 'VHA Test Hospital',
            address: 'Bristol, UK',
            professions: ['nurse'],
          },
          {
            address: 'Beitbridge, Matabeleland South Province, ZW',
            facility_id: 2,
            facility_name: 'Beitbridge',
            professions: ['doctor'],
          },
        ],
      )
    })

    it('returns the nurse registration details & specialty where applicable', async () => {
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

      const [firstEmployment, secondEmployment] = await employment.add(db, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }, {
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 2,
      }])

      await nurse_specialties.add(db, {
        employee_id: firstEmployment.id,
        specialty: 'midwife',
      })

      await nurse_specialties.add(db, {
        employee_id: secondEmployment.id,
        specialty: 'clinical_care_nurse',
      })

      await nurse_registration_details.add(db, {
        registrationDetails: {
          health_worker_id: healthWorker.id,
          gender: 'female',
          national_id: '12345678A12',
          date_of_first_practice: '2020-01-01',
          ncz_registration_number: 'GN123456',
          mobile_number: '5555555555',
          national_id_media_id: null,
          ncz_registration_card_media_id: null,
          face_picture_media_id: null,
          nurse_practicing_cert_media_id: null,
          approved_by: null,
        },
      })

      const result = await health_workers.getEmployeeInfo(
        db,
        healthWorker.id,
        1,
      )

      assert(result)
      assertEquals(result.health_worker_id, healthWorker.id)
      assertEquals(result.gender, 'female')
      assertEquals(result.name, 'Worker')
      assertEquals(result.mobile_number, '5555555555') // <------ this is a problem (phone number formatting happens on display)
      assertEquals(result.avatar_url, 'avatar_url')
      assertEquals(result.date_of_first_practice, '1 January 2020') // <------ this is a problem (date gets moved back 16 hours)
      assertEquals(result.email, 'test@worker.com')
      assertEquals(result.national_id, '12345678A12')
      assertEquals(result.ncz_registration_number, 'GN123456')
      assertEquals(result.specialty, 'midwife')
      assertEquals(result.registration_completed, false)
      assertEquals(result.registration_needed, false)
      assertEquals(result.registration_pending_approval, true)
      assertEquals(result.documents, [])
      assertEquals(
        result.employment,
        [
          {
            facility_id: 1,
            facility_name: 'VHA Test Hospital',
            address: 'Bristol, UK',
            professions: ['nurse'],
          },
          {
            address: 'Beitbridge, Matabeleland South Province, ZW',
            facility_id: 2,
            facility_name: 'Beitbridge',
            professions: ['nurse'],
          },
        ],
      )
    })

    it('returns the documents where applicable', async () => {
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

      const [firstEmployment] = await employment.add(db, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }, {
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 2,
      }])

      await nurse_specialties.add(db, {
        employee_id: firstEmployment.id,
        specialty: 'midwife',
      })

      const nationalIdMedia = await media.insert(db, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      const facePictureMedia = await media.insert(db, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      const registrationCardMedia = await media.insert(db, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      const nursePracticingCertMedia = await media.insert(db, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      await nurse_registration_details.add(db, {
        registrationDetails: {
          health_worker_id: healthWorker.id,
          gender: 'female',
          national_id: '12345678A12',
          date_of_first_practice: '2020-01-01',
          ncz_registration_number: 'GN123456',
          mobile_number: '5555555555',
          national_id_media_id: nationalIdMedia.id,
          ncz_registration_card_media_id: registrationCardMedia.id,
          face_picture_media_id: facePictureMedia.id,
          nurse_practicing_cert_media_id: nursePracticingCertMedia.id,
          approved_by: null,
        },
      })

      const result = await health_workers.getEmployeeInfo(
        db,
        healthWorker.id,
        1,
      )

      assert(result)
      assertEquals(result.health_worker_id, healthWorker.id)
      assertEquals(result.gender, 'female')
      assertEquals(result.name, 'Worker')
      assertEquals(result.mobile_number, '5555555555') // <------ this is a problem (phone number formatting happens on display)
      assertEquals(result.avatar_url, 'avatar_url')
      assertEquals(result.date_of_first_practice, '1 January 2020') // <------ this is a problem (date gets moved back 16 hours)
      assertEquals(result.email, 'test@worker.com')
      assertEquals(result.national_id, '12345678A12')
      assertEquals(result.ncz_registration_number, 'GN123456')
      assertEquals(result.specialty, 'midwife')
      assertEquals(result.registration_completed, false)
      assertEquals(result.registration_needed, false)
      assertEquals(result.registration_pending_approval, true)
      assertEquals(result.documents, [
        {
          name: 'Face Picture',
          href:
            `/app/facilities/${firstEmployment.facility_id}/health-workers/${healthWorker.id}/media/${facePictureMedia.id}`,
        },
        {
          name: 'National ID',
          href:
            `/app/facilities/${firstEmployment.facility_id}/health-workers/${healthWorker.id}/media/${nationalIdMedia.id}`,
        },
        {
          name: 'Registration Card',
          href:
            `/app/facilities/${firstEmployment.facility_id}/health-workers/${healthWorker.id}/media/${registrationCardMedia.id}`,
        },
      ])
      assertEquals(
        result.employment,
        [
          {
            facility_id: 1,
            facility_name: 'VHA Test Hospital',
            address: 'Bristol, UK',
            professions: ['nurse'],
          },
          {
            address: 'Beitbridge, Matabeleland South Province, ZW',
            facility_id: 2,
            facility_name: 'Beitbridge',
            professions: ['nurse'],
          },
        ],
      )
    })
  })
})
