import { describe } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as nurse_specialties from '../../db/models/nurse_specialties.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as media from '../../db/models/media.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import omit from '../../util/omit.ts'
import {
  insertTestAddress,
  testHealthWorker,
  testRegistrationDetails,
} from '../mocks.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import last from '../../util/last.ts'

describe('db/models/health_workers.ts', { sanitizeResources: false }, () => {
  describe('upsertWithGoogleCredentials', () => {
    itUsesTrxAnd(
      'works even if a previous health worker without tokens was inserted',
      async (trx) => {
        await health_workers.upsert(
          trx,
          omit(testHealthWorker(), [
            'access_token',
            'refresh_token',
            'expires_at',
            'expires_in',
          ]),
        )

        const result = await addTestHealthWorker(trx)

        assert(result)
        assertEquals(
          await health_workers.get(trx, { health_worker_id: result.id }),
          { ...result, employment: [], open_encounters: [] },
        )
        assert(!!result.access_token)
        assert(!!result.refresh_token)
      },
    )
  })

  describe('get', () => {
    itUsesTrxAnd(
      'returns the health worker and their employment information',
      async (trx) => {
        const healthWorker = await addTestHealthWorker(trx)

        const employee = await employment.add(trx, [{
          health_worker_id: healthWorker.id,
          profession: 'nurse',
          facility_id: 1,
        }])

        const result = await health_workers.get(trx, {
          health_worker_id: healthWorker.id,
        })
        assert(result)

        assertEquals(omit(result, ['expires_at', 'created_at', 'updated_at']), {
          avatar_url: healthWorker.avatar_url,
          email: healthWorker.email,
          employment: [
            {
              facility: {
                id: 1,
                name: 'VHA Test Hospital',
                address: 'Bristol, UK',
              },
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
          gcal_appointments_calendar_id:
            healthWorker.gcal_appointments_calendar_id,
          gcal_availability_calendar_id:
            healthWorker.gcal_availability_calendar_id,
          id: healthWorker.id,
          name: healthWorker.name,
          access_token: healthWorker.access_token,
          refresh_token: healthWorker.refresh_token,
          open_encounters: [],
        })
      },
    )

    itUsesTrxAnd('returns open encounters', async (trx) => {
      const nurse1 = await addTestHealthWorker(trx, {
        scenario: 'approved-nurse',
      })
      const nurse2 = await addTestHealthWorker(trx, {
        scenario: 'approved-nurse',
      })

      const just_nurse1 = await patient_encounters.upsert(trx, 1, {
        patient_name: 'Test Patient 1',
        reason: 'seeking treatment',
        provider_ids: [nurse1.employee_id!],
      })

      const both = await patient_encounters.upsert(trx, 1, {
        patient_name: 'Test Patient 2',
        reason: 'referral',
        provider_ids: [nurse1.employee_id!, nurse2.employee_id!],
      })

      const result1 = await health_workers.get(trx, {
        health_worker_id: nurse1.id,
      })
      assert(result1)
      assertEquals(result1.open_encounters.length, 2)

      const encounter_both = result1.open_encounters.find((encounter) =>
        encounter.encounter_id === both.id
      )
      assert(encounter_both)
      assertEquals(encounter_both.providers.length, 2)

      const encounter_just_nurse1 = result1.open_encounters.find((encounter) =>
        encounter.encounter_id === just_nurse1.id
      )
      assert(encounter_just_nurse1)
      assertEquals(encounter_just_nurse1.providers.length, 1)

      const result2 = await health_workers.get(trx, {
        health_worker_id: nurse2.id,
      })
      assert(result2)
      assertEquals(result2.open_encounters.length, 1)
      assertEquals(result2.open_encounters[0].encounter_id, both.id)
      assertEquals(result2.open_encounters[0].providers.length, 2)
    })
  })

  describe('search', () => {
    itUsesTrxAnd(
      'returns health workers matching a search with their employment information',
      async (trx) => {
        const healthWorker = await addTestHealthWorker(trx)

        await employment.add(trx, [{
          health_worker_id: healthWorker.id,
          profession: 'nurse',
          facility_id: 1,
        }])

        const result = await health_workers.search(trx, {
          search: healthWorker.name,
        })
        assertEquals(result.length, 1)
        assertEquals(
          result[0],
          {
            avatar_url: healthWorker.avatar_url,
            email: healthWorker.email,
            facilities: [
              {
                facility_id: 1,
                facility_name: 'VHA Test Hospital',
                professions: [
                  'nurse',
                ],
              },
            ],
            gcal_appointments_calendar_id:
              healthWorker.gcal_appointments_calendar_id,
            gcal_availability_calendar_id:
              healthWorker.gcal_availability_calendar_id,
            name: healthWorker.name,
            id: healthWorker.id,
            created_at: result[0].created_at,
            updated_at: result[0].updated_at,
            description: [
              'nurse @ VHA Test Hospital',
            ],
          },
        )
      },
    )

    itUsesTrxAnd('searches by profession', async (trx) => {
      const healthWorker = await addTestHealthWorker(trx)

      await employment.add(trx, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }])

      const doctor_result = await health_workers.search(trx, {
        search: healthWorker.name,
        professions: ['doctor'],
      })
      assert(doctor_result)
      assertEquals(doctor_result.length, 0)

      const nurse_result = await health_workers.search(trx, {
        search: healthWorker.name,
        professions: ['nurse'],
      })
      assert(nurse_result)
      assertEquals(nurse_result.length, 1)

      assertEquals(
        omit(nurse_result[0], ['created_at', 'updated_at']),
        {
          avatar_url: healthWorker.avatar_url,
          email: healthWorker.email,
          facilities: [
            {
              facility_id: 1,
              facility_name: 'VHA Test Hospital',
              professions: [
                'nurse',
              ],
            },
          ],
          gcal_appointments_calendar_id:
            healthWorker.gcal_appointments_calendar_id,
          gcal_availability_calendar_id:
            healthWorker.gcal_availability_calendar_id,
          id: healthWorker.id,
          name: healthWorker.name,
          description: [
            'nurse @ VHA Test Hospital',
          ],
        },
      )
    })

    itUsesTrxAnd(
      'can prioritize a given facility, while still returning results from another facility',
      async (trx) => {
        const [doctor1, doctor2] = await Promise.all([
          addTestHealthWorker(trx, {
            scenario: 'doctor',
            facility_id: 1,
          }),
          addTestHealthWorker(trx, {
            scenario: 'doctor',
            facility_id: 2,
          }),
        ])
        await employment.add(trx, [{
          health_worker_id: doctor2.id,
          profession: 'doctor',
          facility_id: 3,
        }])

        const results = await health_workers.search(trx, {
          search: 'Test Health Worker',
          prioritize_facility_id: 2,
        })
        const firstResult = results[0]
        const lastResult = last(results)!

        assert(
          firstResult.facilities.some((facility) => facility.facility_id === 2),
        )
        assert(
          lastResult.facilities.every((facility) => facility.facility_id !== 2),
        )
      },
    )
  })

  describe('getEmployeeInfo', () => {
    itUsesTrxAnd(
      'returns the health worker and their employment information if that matches a given facility id',
      async (trx) => {
        const healthWorker = await addTestHealthWorker(trx)

        await employment.add(trx, [{
          health_worker_id: healthWorker.id,
          profession: 'nurse',
          facility_id: 1,
        }, {
          health_worker_id: healthWorker.id,
          profession: 'doctor',
          facility_id: 2,
        }])

        const result = await health_workers.getEmployeeInfo(
          trx,
          healthWorker.id,
          1,
        )

        assert(result)
        assertEquals(result.health_worker_id, healthWorker.id)
        assertEquals(result.gender, null)
        assertEquals(result.name, healthWorker.name)
        assertEquals(result.date_of_birth, null)
        assertEquals(result.mobile_number, null)
        assertEquals(result.avatar_url, healthWorker.avatar_url)
        assertEquals(result.date_of_first_practice, null)
        assertEquals(result.email, healthWorker.email)
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
      },
    )

    itUsesTrxAnd(
      'returns the nurse registration details & specialty where applicable',
      async (trx) => {
        const healthWorker = await addTestHealthWorker(trx)

        const [firstEmployment, secondEmployment] = await employment.add(trx, [{
          health_worker_id: healthWorker.id,
          profession: 'nurse',
          facility_id: 1,
        }, {
          health_worker_id: healthWorker.id,
          profession: 'nurse',
          facility_id: 2,
        }])

        await nurse_specialties.add(trx, {
          employee_id: firstEmployment.id,
          specialty: 'midwife',
        })

        await nurse_specialties.add(trx, {
          employee_id: secondEmployment.id,
          specialty: 'clinical care',
        })

        const nurse_address = await insertTestAddress(trx)
        assert(nurse_address)

        const details = await testRegistrationDetails(trx, {
          health_worker_id: healthWorker.id,
        })
        await nurse_registration_details.add(trx, details)

        const result = await health_workers.getEmployeeInfo(
          trx,
          healthWorker.id,
          1,
        )

        assert(result)
        assertEquals(result.health_worker_id, healthWorker.id)
        assertEquals(result.gender, 'male')
        assertEquals(result.name, healthWorker.name)
        assertEquals(result.date_of_birth, '12 December 1979')
        assertEquals(result.mobile_number, details.mobile_number)
        assertEquals(result.avatar_url, healthWorker.avatar_url)
        assertEquals(result.date_of_first_practice, '11 November 1999')
        assertEquals(result.email, healthWorker.email)
        assert(
          /^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/.test(
            result.national_id_number!,
          ),
        )
        assertEquals(
          result.ncz_registration_number,
          details.ncz_registration_number,
        )
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
      },
    )

    itUsesTrxAnd('returns documents where applicable', async (trx) => {
      const healthWorker = await addTestHealthWorker(trx)

      const [firstEmployment] = await employment.add(trx, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }, {
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 2,
      }])

      await nurse_specialties.add(trx, {
        employee_id: firstEmployment.id,
        specialty: 'midwife',
      })

      const nationalIdMedia = await media.insert(trx, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      const facePictureMedia = await media.insert(trx, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      const registrationCardMedia = await media.insert(trx, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      const nursePracticingCertMedia = await media.insert(trx, {
        binary_data: new Uint8Array(),
        mime_type: 'image/png',
      })

      const details = await testRegistrationDetails(trx, {
        health_worker_id: healthWorker.id,
      })
      details.national_id_media_id = nationalIdMedia.id
      details.face_picture_media_id = facePictureMedia.id
      details.ncz_registration_card_media_id = registrationCardMedia.id
      details.nurse_practicing_cert_media_id = nursePracticingCertMedia.id

      await nurse_registration_details.add(trx, details)

      const result = await health_workers.getEmployeeInfo(
        trx,
        healthWorker.id,
        1,
      )

      assert(result)
      assertEquals(result.health_worker_id, healthWorker.id)
      assertEquals(result.gender, 'male')
      assertEquals(result.date_of_birth, '12 December 1979')
      assertEquals(result.name, healthWorker.name)
      assertEquals(result.mobile_number, details.mobile_number)
      assertEquals(result.avatar_url, healthWorker.avatar_url)
      assertEquals(result.date_of_first_practice, '11 November 1999')
      assertEquals(result.email, healthWorker.email)
      assert(
        /^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/.test(result.national_id_number!),
      )
      assertEquals(
        result.ncz_registration_number,
        details.ncz_registration_number,
      )
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

    itUsesTrxAnd('can filter by facility_id', async (trx) => {
      const healthWorker = await addTestHealthWorker(trx)

      await employment.add(trx, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 1,
      }, {
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 2,
      }])

      const same_facility_result = await health_workers.search(trx, {
        search: healthWorker.name,
        facility_id: 1,
      })
      assertEquals(same_facility_result.length, 1)
      assertEquals(
        same_facility_result[0],
        {
          avatar_url: healthWorker.avatar_url,
          email: healthWorker.email,
          facilities: [
            {
              facility_id: 1,
              facility_name: 'VHA Test Hospital',
              professions: [
                'nurse',
              ],
            },
          ],
          gcal_appointments_calendar_id:
            healthWorker.gcal_appointments_calendar_id,
          gcal_availability_calendar_id:
            healthWorker.gcal_availability_calendar_id,
          name: healthWorker.name,
          id: healthWorker.id,
          created_at: same_facility_result[0].created_at,
          updated_at: same_facility_result[0].updated_at,
          description: [
            'nurse @ VHA Test Hospital',
          ],
        },
      )

      const other_facility_result = await health_workers.search(trx, {
        search: healthWorker.name,
        facility_id: 10,
      })
      assertEquals(other_facility_result.length, 0)
    })
  })
})
