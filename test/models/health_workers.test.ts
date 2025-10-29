import { afterAll, describe } from 'std/testing/bdd.ts'
import { testHealthWorker } from '../_helpers/health_workers.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
// import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as media from '../../db/models/media.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import omit from '../../util/omit.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import db from '../../db/db.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { testNurseRegistrationDetails } from '../../mocks/testRegistrationDetails.ts'
import insertTestAddress from '../../mocks/insertTestAddress.ts'
import { prettyPatientDateOfBirth } from '../../util/date.ts'

describe('db/models/health_workers.ts', () => {
  afterAll(() => db.destroy())
  describe('upsertWithGoogleCredentials', () => {
    itUsesTrxAnd(
      'works even if a previous health worker without tokens was inserted',
      async (trx) => {
        const health_worker_data = testHealthWorker()
        await health_workers.upsert(
          trx,
          omit(health_worker_data, [
            'access_token',
            'refresh_token',
            'expires_at',
            'expires_in',
          ]),
        )

        const result = await upsertWithGoogleCredentials(
          trx,
          health_worker_data,
        )

        assert(result)
        assertEquals(
          await health_workers.get(trx, { health_worker_id: result.id }),
          {
            ...result,
            employment: [],
            present_encounter: null,
            default_organization_id: null,
            reviews: {
              in_progress: [],
              requested: [],
            },
          },
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
        const health_worker = await addTestEmployee(trx, {
          profession: 'nurse',
          registration_status: 'not started',
        })

        const result = await health_workers.get(trx, {
          health_worker_id: health_worker.id,
        })
        assert(result)

        assertEquals(omit(result, ['expires_at']), {
          avatar_url: health_worker.avatar_url,
          email: health_worker.email,
          employment: [
            {
              organization: {
                id: '00000000-0000-0000-0000-000000000001',
                name: 'VHA Test Clinic South Africa',
                address: '123 Main St, Polokwane, South Africa, 23456',
              },
              roles: {
                admin: null,
                doctor: null,
                receptionist: null,
                nurse: {
                  registration_completed: false,
                  registration_needed: true,
                  registration_pending_approval: true,
                  employment_id: health_worker.employee_id,
                },
              },
              provider_id: health_worker.employee_id,
              non_admin_id: health_worker.employee_id,
              gcal_appointments_calendar_id:
                health_worker.calendars!.gcal_appointments_calendar_id,
              gcal_availability_calendar_id:
                health_worker.calendars!.gcal_availability_calendar_id,
              availability_set: true,
              departments: result.employment[0].departments,
            },
          ],
          default_organization_id: '00000000-0000-0000-0000-000000000001',
          id: health_worker.id,
          name: health_worker.name,
          first_names: health_worker.first_names,
          surname: health_worker.surname,
          preferred_name: health_worker.preferred_name,
          access_token: health_worker.access_token,
          refresh_token: health_worker.refresh_token,
          present_encounter: null,
          reviews: {
            in_progress: [],
            requested: [],
          },
        })
      },
    )

    // itUsesTrxAnd('returns open encounters', async (trx) => {
    //   const nurse1 = await addTestEmployee(trx, {
    //     profession: 'nurse',
    //     specialty: 'primary care',
    //     registration_status: 'approved',
    //   })
    //   const nurse2 = await addTestEmployee(trx, {
    //     profession: 'nurse',
    //     specialty: 'primary care',
    //     registration_status: 'approved',
    //   })

    //   const just_nurse1 =
    //     await insertReturningSeekingTreatmentWithEmployeeForTest(
    //       trx,
    //       '00000000-0000-0000-0000-000000000001',
    //       {
    //         patient_name: 'Test Patient 1',
    //         employment_id: nurse1.employee_id!,
    //       },
    //     )

    //   const both = await patient_encounters
    //     .insertSeekingTreatmentForRegisteredPatient(
    //       trx,
    //       '00000000-0000-0000-0000-000000000001',
    //       {
    //         patient_name: 'Test Patient 2',
    //         reason: 'referral',
    //         provider_ids: [nurse1.employee_id!, nurse2.employee_id!],
    //       },
    //     )

    //   const result1 = await health_workers.get(trx, {
    //     health_worker_id: nurse1.id,
    //   })
    //   assert(result1)
    //   assertEquals(result1.open_encounters.length, 2)

    //   const encounter_both = result1.open_encounters.find((encounter) =>
    //     encounter.patient_encounter_id === both.id
    //   )
    //   assert(encounter_both)
    //   assertEquals(encounter_both.providers.length, 2)

    //   const encounter_just_nurse1 = result1.open_encounters.find((encounter) =>
    //     encounter.patient_encounter_id === just_nurse1.id
    //   )
    //   assert(encounter_just_nurse1)
    //   assertEquals(encounter_just_nurse1.providers.length, 1)

    //   const result2 = await health_workers.get(trx, {
    //     health_worker_id: nurse2.id,
    //   })
    //   assert(result2)
    //   assertEquals(result2.open_encounters.length, 1)
    //   assertEquals(result2.open_encounters[0].patient_encounter_id, both.id)
    //   assertEquals(result2.open_encounters[0].providers.length, 2)
    // })
  })

  describe('getEmployeeInfo', () => {
    itUsesTrxAnd(
      'returns the health worker and their employment information if that matches a given organization id',
      async (trx) => {
        const health_worker = await addTestEmployee(trx, {
          profession: 'nurse',
          registration_status: 'not started',
        })

        await employment.add(trx, [{
          health_worker_id: health_worker.id,
          profession: 'doctor',
          organization_id: '00000000-0000-0000-0000-000000000002',
        }])

        const result = await health_workers.getEmployeeInfo(
          trx,
          {
            health_worker_id: health_worker.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
          },
        )

        assert(result)
        assertEquals(result.health_worker_id, health_worker.id)
        assertEquals(result.gender, null)
        assertEquals(result.name, health_worker.name)
        assertEquals(result.date_of_birth, null)
        assertEquals(result.mobile_number, null)
        assertEquals(result.avatar_url, health_worker.avatar_url)
        assertEquals(result.date_of_first_practice, null)
        assertEquals(result.email, health_worker.email)
        assertEquals(result.national_id_number, null)
        assertEquals(result.ncz_registration_number, null)
        assertEquals(result.specialty, null)
        assertEquals(result.registration_completed, false)
        assertEquals(result.registration_needed, true)
        assertEquals(result.registration_pending_approval, false)
        assertEquals(
          result.organization_id,
          '00000000-0000-0000-0000-000000000001',
        )
        assertEquals(result.organization_name, 'VHA Test Clinic South Africa')
        assertEquals(
          result.organization_address,
          '123 Main St, Polokwane, South Africa, 23456',
        )
        assertEquals(result.professions, ['nurse'])
      },
    )

    itUsesTrxAnd(
      'returns the nurse registration details & specialty where applicable',
      async (trx) => {
        const health_worker = await addTestEmployee(trx, {
          profession: 'nurse',
          registration_status: 'not started',
        })

        const [secondEmployment] = await employment.add(trx, [{
          health_worker_id: health_worker.id,
          profession: 'nurse',
          organization_id: '00000000-0000-0000-0000-000000000002',
        }])

        await employment.updateSpecialty(trx, {
          employee_id: health_worker.employee_id,
          specialty: 'midwife',
        })

        await employment.updateSpecialty(trx, {
          employee_id: secondEmployment.id,
          specialty: 'clinical care',
        })

        const nurse_address = await insertTestAddress(trx)
        assert(nurse_address)

        const details = await testNurseRegistrationDetails(trx, {
          health_worker_id: health_worker.id,
        })
        await nurse_registration_details.add(trx, details)

        const result = await health_workers.getEmployeeInfo(
          trx,
          {
            health_worker_id: health_worker.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
          },
        )

        assert(result)
        assertEquals(result.health_worker_id, health_worker.id)
        assertEquals(result.sex, details.sex)
        assertEquals(result.gender, details.gender)
        assertEquals(result.name, details.name)
        assertEquals(
          result.date_of_birth,
          prettyPatientDateOfBirth(details.date_of_birth),
        )
        assertEquals(result.mobile_number, details.mobile_number)
        assertEquals(result.avatar_url, health_worker.avatar_url)
        assertEquals(result.date_of_first_practice, '11 November 1999')
        assertEquals(result.email, health_worker.email)
        assert(result.national_id_number)
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
          result.organization_id,
          '00000000-0000-0000-0000-000000000001',
        )
        assertEquals(result.organization_name, 'VHA Test Clinic South Africa')
        assertEquals(
          result.organization_address,
          '123 Main St, Polokwane, South Africa, 23456',
        )
        assertEquals(result.professions, ['nurse'])
      },
    )

    itUsesTrxAnd('returns documents where applicable', async (trx) => {
      const health_worker = await addTestEmployee(trx, {
        profession: 'nurse',
        registration_status: 'not started',
      })

      await employment.add(trx, [{
        health_worker_id: health_worker.id,
        profession: 'nurse',
        organization_id: '00000000-0000-0000-0000-000000000002',
      }])

      await employment.updateSpecialty(trx, {
        employee_id: health_worker.employee_id,
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

      const details = await testNurseRegistrationDetails(trx, {
        health_worker_id: health_worker.id,
      })
      details.national_id_media_id = nationalIdMedia.id
      details.face_picture_media_id = facePictureMedia.id
      details.ncz_registration_card_media_id = registrationCardMedia.id
      details.nurse_practicing_cert_media_id = nursePracticingCertMedia.id

      await nurse_registration_details.add(trx, details)

      const result = await health_workers.getEmployeeInfo(
        trx,
        {
          health_worker_id: health_worker.id,
          organization_id: '00000000-0000-0000-0000-000000000001',
        },
      )

      assert(result)
      assertEquals(result.health_worker_id, health_worker.id)
      assertEquals(result.sex, details.sex)
      assertEquals(result.gender, details.gender)
      assertEquals(
        result.date_of_birth,
        prettyPatientDateOfBirth(details.date_of_birth),
      )
      assertEquals(result.name, details.name)
      assertEquals(result.mobile_number, details.mobile_number)
      assertEquals(result.avatar_url, health_worker.avatar_url)
      assertEquals(result.date_of_first_practice, '11 November 1999')
      assertEquals(result.email, health_worker.email)
      assert(result.national_id_number)
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
            `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${health_worker.id}/media/${facePictureMedia.id}`,
        },
        {
          name: 'National ID',
          href:
            `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${health_worker.id}/media/${nationalIdMedia.id}`,
        },
        {
          name: 'Nurse Practicing Certificate',
          href:
            `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${health_worker.id}/media/${nursePracticingCertMedia.id}`,
        },
        {
          name: 'Registration Card',
          href:
            `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${health_worker.id}/media/${registrationCardMedia.id}`,
        },
      ])
      assertEquals(
        result.organization_id,
        '00000000-0000-0000-0000-000000000001',
      )
      assertEquals(result.organization_name, 'VHA Test Clinic South Africa')
      assertEquals(
        result.organization_address,
        '123 Main St, Polokwane, South Africa, 23456',
      )
      assertEquals(result.professions, ['nurse'])
    })
  })
})
