import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe } from 'std/testing/bdd.ts'
import insertTestAddress from '../../mocks/insertTestAddress.ts'
import { testNurseRegistrationDetails } from '../../mocks/testRegistrationDetails.ts'
import { prettyPatientDateOfBirth } from '../../util/date.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as employment from '../../db/models/employment.ts'
import * as media from '../../db/models/media.ts'
import { getEmployeeInfo } from '../../db/models/employee_info.ts'

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
        is_admin: false,

        organization_id: '00000000-0000-1000-8000-000000000002',
      }])

      const result = await getEmployeeInfo(
        trx,
        {
          health_worker_id: health_worker.id,
          organization_id: '00000000-0000-1000-8000-000000000001',
        },
      )

      assert(result)
      assertEquals(result.health_worker_id, health_worker.id)
      assertEquals(result.gender, null)
      assertEquals(result.name, health_worker.name)
      assertEquals(result.date_of_birth, null)
      assertEquals(result.mobile_number, null)
      assertEquals(result.avatar_url, null)
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
        '00000000-0000-1000-8000-000000000001',
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
        is_admin: false,

        organization_id: '00000000-0000-1000-8000-000000000002',
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

      const result = await getEmployeeInfo(
        trx,
        {
          health_worker_id: health_worker.id,
          organization_id: '00000000-0000-1000-8000-000000000001',
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
      assertEquals(result.avatar_url, null)
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
        '00000000-0000-1000-8000-000000000001',
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
      is_admin: false,
      organization_id: '00000000-0000-1000-8000-000000000002',
    }])

    await employment.updateSpecialty(trx, {
      employee_id: health_worker.employee_id,
      specialty: 'midwife',
    })

    const national_id_media = await media.insert(trx, {
      binary_data: new Uint8Array(),
      mime_type: 'image/png',
    })

    const face_picture_media = await media.insert(trx, {
      binary_data: new Uint8Array(),
      mime_type: 'image/png',
    })

    const registration_card_media = await media.insert(trx, {
      binary_data: new Uint8Array(),
      mime_type: 'image/png',
    })

    const nurse_practicing_cert_media = await media.insert(trx, {
      binary_data: new Uint8Array(),
      mime_type: 'image/png',
    })

    const details = await testNurseRegistrationDetails(trx, {
      health_worker_id: health_worker.id,
    })
    details.national_id_media_id = national_id_media.id
    details.face_picture_media_id = face_picture_media.id
    details.ncz_registration_card_media_id = registration_card_media.id
    details.nurse_practicing_cert_media_id = nurse_practicing_cert_media.id

    await nurse_registration_details.add(trx, details)

    const result = await getEmployeeInfo(
      trx,
      {
        health_worker_id: health_worker.id,
        organization_id: '00000000-0000-1000-8000-000000000001',
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
    assertEquals(result.avatar_url, null)
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
          `/app/organizations/00000000-0000-1000-8000-000000000001/employees/${health_worker.id}/media/${face_picture_media.id}`,
      },
      {
        name: 'National ID',
        href:
          `/app/organizations/00000000-0000-1000-8000-000000000001/employees/${health_worker.id}/media/${national_id_media.id}`,
      },
      {
        name: 'Nurse Practicing Certificate',
        href:
          `/app/organizations/00000000-0000-1000-8000-000000000001/employees/${health_worker.id}/media/${nurse_practicing_cert_media.id}`,
      },
      {
        name: 'Registration Card',
        href:
          `/app/organizations/00000000-0000-1000-8000-000000000001/employees/${health_worker.id}/media/${registration_card_media.id}`,
      },
    ])
    assertEquals(
      result.organization_id,
      '00000000-0000-1000-8000-000000000001',
    )
    assertEquals(result.organization_name, 'VHA Test Clinic South Africa')
    assertEquals(
      result.organization_address,
      '123 Main St, Polokwane, South Africa, 23456',
    )
    assertEquals(result.professions, ['nurse'])
  })
})
