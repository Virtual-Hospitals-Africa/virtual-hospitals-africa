import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import * as nurse_specialties from '../../db/models/nurse_specialties.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import { resetInTest } from '../../db/meta.ts'
import * as media from '../../db/models/media.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import omit from '../../util/omit.ts'
import { EmployedHealthWorker } from '../../types.ts'
import { insertTestAddress, randomNationalId } from '../mocks.ts'
import { addTestHealthWorker } from '../web/utilities.ts'

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

      const employee = await employment.add(db, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }])

      const result = await health_workers.get(db, { email: 'test@worker.com' })
      assert(result)

      assertEquals(omit(result, ['expires_at', 'created_at', 'updated_at']), {
        avatar_url: 'avatar_url',
        email: 'test@worker.com',
        employment: [
          {
            facility_id: 1,
            facility_name: 'VHA Test Hospital',
            roles: {
              admin: null,
              doctor: null,
              nurse: {
                registration_completed: false,
                registration_needed: true,
                registration_pending_approval: true,
                employment_id: employee[0].id,
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

  describe('search', () => {
    it('returns health workers matching a search with their employment information', async () => {
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

      const result = await health_workers.search(db, { search: 'Worker' })
      assertEquals(result.length, 1)
      assertEquals(
        result[0],
        {
          avatar_url: 'avatar_url',
          email: 'test@worker.com',
          facilities: [
            {
              facility_id: 1,
              facility_name: 'VHA Test Hospital',
              professions: [
                'nurse',
              ],
            },
          ],
          gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
          gcal_availability_calendar_id: 'gcal_availability_calendar_id',
          name: 'Worker',
          id: healthWorker.id,
          created_at: result[0].created_at,
          updated_at: result[0].updated_at,
          description: [
            'nurse @ VHA Test Hospital',
          ],
        },
      )
    })

    it('searches by profession', async () => {
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

      const doctor_result = await health_workers.search(db, {
        search: 'Worker',
        professions: ['doctor'],
      })
      assert(doctor_result)
      assertEquals(doctor_result.length, 0)

      const nurse_result = await health_workers.search(db, {
        search: 'Worker',
        professions: ['nurse'],
      })
      assert(nurse_result)
      assertEquals(nurse_result.length, 1)

      assertEquals(
        omit(nurse_result[0], ['created_at', 'updated_at']),
        {
          avatar_url: 'avatar_url',
          email: 'test@worker.com',
          facilities: [
            {
              facility_id: 1,
              facility_name: 'VHA Test Hospital',
              professions: [
                'nurse',
              ],
            },
          ],
          gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
          gcal_availability_calendar_id: 'gcal_availability_calendar_id',
          id: healthWorker.id,
          name: 'Worker',
          description: [
            'nurse @ VHA Test Hospital',
          ],
        },
      )
    })

    it('can prioritize a given facility, while still returning results from another facility', async () => {
      const [doctor1, doctor2] = await Promise.all([
        addTestHealthWorker({
          scenario: 'doctor',
          facility_id: 1,
        }),
        addTestHealthWorker({
          scenario: 'doctor',
          facility_id: 2,
        }),
      ])
      await employment.add(db, [{
        health_worker_id: doctor2.id,
        profession: 'doctor',
        facility_id: 3,
      }])

      const results1 = await health_workers.search(db, {
        search: 'Test Health Worker',
        prioritize_facility_id: 1,
      })
      assertEquals(results1.length, 2)
      assertEquals(results1[0].id, doctor1.id)

      const results2 = await health_workers.search(db, {
        search: 'Test Health Worker',
        prioritize_facility_id: 2,
      })
      assertEquals(results2.length, 2)
      assertEquals(results2[0].id, doctor2.id)
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
      assertEquals(result.date_of_birth, null)
      assertEquals(result.mobile_number, null)
      assertEquals(result.avatar_url, 'avatar_url')
      assertEquals(result.date_of_first_practice, null)
      assertEquals(result.email, 'test@worker.com')
      assertEquals(result.national_id_number, null)
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
            facility_name: 'Beitbridge District Hospital',
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
        specialty: 'clinical care',
      })

      const nurse_address = await insertTestAddress()
      assert(nurse_address)

      await nurse_registration_details.add(db, {
        health_worker_id: healthWorker.id,
        gender: 'female',
        date_of_birth: '1999-12-12',
        national_id_number: randomNationalId(),
        date_of_first_practice: '2020-01-01',
        ncz_registration_number: 'GN123456',
        mobile_number: '5555555555',
        national_id_media_id: null,
        ncz_registration_card_media_id: null,
        face_picture_media_id: null,
        nurse_practicing_cert_media_id: null,
        approved_by: null,
        address_id: nurse_address.id,
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
      assertEquals(result.date_of_birth, '12 December 1999')
      assertEquals(result.mobile_number, '5555555555')
      assertEquals(result.avatar_url, 'avatar_url')
      assertEquals(result.date_of_first_practice, '1 January 2020')
      assertEquals(result.email, 'test@worker.com')
      assert(
        /^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/.test(result.national_id_number!),
      )
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
            facility_name: 'Beitbridge District Hospital',
            professions: ['nurse'],
          },
        ],
      )
    })

    it('returns documents where applicable', async () => {
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

      const nurse_address = await insertTestAddress()
      assert(nurse_address)

      await nurse_registration_details.add(db, {
        health_worker_id: healthWorker.id,
        gender: 'female',
        date_of_birth: '1999-12-12',
        national_id_number: randomNationalId(),
        date_of_first_practice: '2020-01-01',
        ncz_registration_number: 'GN123456',
        mobile_number: '5555555555',
        national_id_media_id: nationalIdMedia.id,
        ncz_registration_card_media_id: registrationCardMedia.id,
        face_picture_media_id: facePictureMedia.id,
        nurse_practicing_cert_media_id: nursePracticingCertMedia.id,
        approved_by: null,
        address_id: nurse_address.id,
      })

      const result = await health_workers.getEmployeeInfo(
        db,
        healthWorker.id,
        1,
      )

      assert(result)
      assertEquals(result.health_worker_id, healthWorker.id)
      assertEquals(result.gender, 'female')
      assertEquals(result.date_of_birth, '12 December 1999')
      assertEquals(result.name, 'Worker')
      assertEquals(result.mobile_number, '5555555555')
      assertEquals(result.avatar_url, 'avatar_url')
      assertEquals(result.date_of_first_practice, '1 January 2020')
      assertEquals(result.email, 'test@worker.com')
      assert(
        /^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/.test(result.national_id_number!),
      )
      assertEquals(result.ncz_registration_number, 'GN123456')
      assertEquals(result.specialty, 'midwife')
      assertEquals(result.registration_completed, false)
      assertEquals(result.registration_needed, false)
      assertEquals(result.registration_pending_approval, true)
      assertEquals(result.documents, [
        {
          name: 'Face Picture',
          href:
            `/app/facilities/${firstEmployment.facility_id}/employees/${healthWorker.id}/media/${facePictureMedia.id}`,
        },
        {
          name: 'National ID',
          href:
            `/app/facilities/${firstEmployment.facility_id}/employees/${healthWorker.id}/media/${nationalIdMedia.id}`,
        },
        {
          name: 'Nurse Practicing Certificate',
          href:
            `/app/facilities/${firstEmployment.facility_id}/employees/${healthWorker.id}/media/${nursePracticingCertMedia.id}`,
        },
        {
          name: 'Registration Card',
          href:
            `/app/facilities/${firstEmployment.facility_id}/employees/${healthWorker.id}/media/${registrationCardMedia.id}`,
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
            facility_name: 'Beitbridge District Hospital',
            professions: ['nurse'],
          },
        ],
      )
    })

    it('can filter by facility_id', async () => {
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
        profession: 'nurse',
        facility_id: 2,
      }])

      const same_facility_result = await health_workers.search(db, {
        search: 'Worker',
        facility_id: 1,
      })
      assertEquals(same_facility_result.length, 1)
      assertEquals(
        same_facility_result[0],
        {
          avatar_url: 'avatar_url',
          email: 'test@worker.com',
          facilities: [
            {
              facility_id: 1,
              facility_name: 'VHA Test Hospital',
              professions: [
                'nurse',
              ],
            },
          ],
          gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
          gcal_availability_calendar_id: 'gcal_availability_calendar_id',
          name: 'Worker',
          id: healthWorker.id,
          created_at: same_facility_result[0].created_at,
          updated_at: same_facility_result[0].updated_at,
          description: [
            'nurse @ VHA Test Hospital',
          ],
        },
      )

      const other_facility_result = await health_workers.search(db, {
        search: 'Worker',
        facility_id: 10,
      })
      assertEquals(other_facility_result.length, 0)
    })
  })
})
