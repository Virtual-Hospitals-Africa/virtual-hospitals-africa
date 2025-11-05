import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as nurse_registration_details from '../../../../db/models/nurse_registration_details.ts'
import db from '../../../../db/db.ts'
import {
  addTestEmployee,
  addTestEmployeeWithSession,
} from '../../../_helpers/employees.ts'
import { route } from '../../../route.ts'
import randomDemographics from '../../../../mocks/randomDemographics.ts'
import createTestAddress from '../../../../mocks/createTestAddress.ts'

describe(
  '/app/organizations/[organization_id]/register',
  () => {
    afterAll(() => db.destroy())
    it('renders a registration page on GET', async () => {
      const { fetch } = await addTestEmployeeWithSession(db, {
        profession: 'nurse',
        registration_status: 'not started',
      })

      const response = await fetch(
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/personal`,
      )

      assert(response.ok, 'should have returned ok')
      assert(
        response.url ===
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/personal`,
      )
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      assert($('input[name="first_names"]').length === 1)
      assert($('input[name="surname"]').length === 1)
      assert($('input[name="preferred_name"]').length === 1)
      assert($('input[name="date_of_birth"]').length === 1)
      assert($('input[name="email"]').length === 1)
      assert($('select[name="sex"]').length === 1)
      assert($('input[name="gender"]').length === 1)
      assert($('input[name="national_id_number"]').length === 1)
      assert($('input[name="mobile_number"]').length === 1)

      assert($('input[name="address.country"]').length === 1)
      assert(
        $('input[name="address.administrative_area_level_1"]').length === 1,
      )
      assert(
        $('input[name="address.administrative_area_level_2"]').length === 1,
      )
      assert($('input[name="address.locality"]').length === 1)
      assert($('input[name="address.street"]').length === 1)
    })

    it('supports POSTs on the personal, professional, and documents step, moving you into /pending_approval', async () => {
      await addTestEmployee(db, { profession: 'admin' })
      const { fetch, health_worker: nurse } = await addTestEmployeeWithSession(
        db,
        {
          profession: 'nurse',
          registration_status: 'not started',
        },
      )
      const address = createTestAddress()

      const demographics = randomDemographics('ZA')
      {
        const body = new FormData()
        body.set('first_names', demographics.first_names)
        body.set('surname', demographics.surname)
        body.set('preferred_name', demographics.preferred_name)
        body.set('sex', demographics.sex)
        body.set('gender', demographics.gender)
        body.set('national_id_number', demographics.national_id_number)
        body.set('date_of_birth', demographics.date_of_birth)
        body.set('mobile_number', '+1 (203) 555-5555')

        body.set('address.country', address.country)
        body.set(
          'address.administrative_area_level_1',
          address.administrative_area_level_1,
        )
        body.set(
          'address.administrative_area_level_2',
          address.administrative_area_level_2,
        )
        body.set('address.locality', address.locality)
        body.set('address.street', address.street)

        const postResponse = await fetch(
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/personal`,
          {
            method: 'POST',
            body,
          },
        )

        if (!postResponse.ok) {
          throw new Error(await postResponse.text())
        }

        assertEquals(
          postResponse.url,
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/professional`,
        )

        await postResponse.body?.cancel()

        const registrationFormState = await nurse_registration_details
          .getInProgress(db, {
            health_worker_id: nurse.id,
          })

        assertEquals(registrationFormState, {
          date_of_birth: demographics.date_of_birth,
          first_names: demographics.first_names,
          sex: demographics.sex,
          gender: demographics.gender,
          surname: demographics.surname,
          preferred_name: demographics.preferred_name,
          national_id_number: demographics.national_id_number,
          mobile_number: '+12035555555',
          address,
        })

        const getPersonalResponse = await fetch(
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/personal`,
        )

        const pageContents = await getPersonalResponse.text()
        const $ = cheerio.load(pageContents)
        console.log($.html())
        assertEquals(
          $('input[name="first_names"]').val(),
          demographics.first_names,
        )
        assertEquals($('input[name="surname"]').val(), demographics.surname)
        assertEquals(
          $('input[name="date_of_birth"]').val(),
          demographics.date_of_birth,
        )
        assertEquals($('select[name="sex"]').val(), demographics.sex)
        assertEquals(
          $('input[name="national_id_number"]').val(),
          demographics.national_id_number,
        )
        assertEquals($('input[name="mobile_number"]').val(), '+12035555555')

        // TODO
        // assertEquals(
        //   $('input[name="address.country"]').val(),
        //   address.country,
        // )
        assertEquals(
          $('input[name="address.administrative_area_level_1"]').val(),
          address.administrative_area_level_1,
        )
        assertEquals(
          $('input[name="address.administrative_area_level_2"]').val(),
          address.administrative_area_level_2,
        )
        assertEquals(
          $('input[name="address.locality"]').val(),
          address.locality,
        )
        assertEquals(
          $('input[name="address.street"]').val(),
          address.street!,
        )
      }

      {
        const body = new FormData()
        body.set('date_of_first_practice', '2022-01-01')
        body.set('ncz_registration_number', 'GN123456')
        body.set('specialty', 'oncology and palliative care')

        const postResponse = await fetch(
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/professional`,
          {
            method: 'POST',
            body,
          },
        )

        if (!postResponse.ok) {
          throw new Error(await postResponse.text())
        }

        assertEquals(
          postResponse.url,
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/documents`,
        )

        await postResponse.body?.cancel()

        const registrationFormState = await nurse_registration_details
          .getInProgress(db, {
            health_worker_id: nurse.id,
          })

        assertEquals(registrationFormState, {
          date_of_birth: demographics.date_of_birth,
          first_names: demographics.first_names,
          surname: demographics.surname,
          preferred_name: demographics.preferred_name,
          sex: demographics.sex,
          gender: demographics.gender,
          national_id_number: demographics.national_id_number,
          mobile_number: '+12035555555',
          date_of_first_practice: '2022-01-01',
          ncz_registration_number: 'GN123456',
          specialty: 'oncology and palliative care',
          address,
        })

        const getProfessionalResponse = await fetch(
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/professional`,
        )

        const pageContents = await getProfessionalResponse.text()
        const $ = cheerio.load(pageContents)
        assertEquals(
          $('input[name="date_of_first_practice"]').val(),
          '2022-01-01',
        )
        assertEquals(
          $('input[name="ncz_registration_number"]').val(),
          'GN123456',
        )
        assertEquals(
          $('select[name="specialty"]').val(),
          'oncology and palliative care',
        )
      }

      {
        // TODO: upload documents
        const body = new FormData()

        const postResponse = await fetch(
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/documents`,
          {
            method: 'POST',
            body,
          },
        )

        if (!postResponse.ok) {
          throw new Error(await postResponse.text())
        }

        assertEquals(
          postResponse.url,
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/waiting_room`,
        )

        await postResponse.body?.cancel()

        const registrationDetails = await nurse_registration_details.get(db, {
          health_worker_id: nurse.id,
        })

        const newNurse = await db.selectFrom('health_workers').where(
          'id',
          '=',
          nurse.id,
        ).selectAll().executeTakeFirst()
        const nurseEmployment = await db.selectFrom('employment').where(
          'health_worker_id',
          '=',
          nurse.id,
        ).selectAll().executeTakeFirstOrThrow()

        assert(registrationDetails)
        assert(newNurse)
        assert(nurseEmployment)

        assertEquals(
          registrationDetails.date_of_birth,
          demographics.date_of_birth,
        )
        assertEquals(newNurse.name, demographics.name)
        assertEquals(registrationDetails.gender, demographics.gender)
        assertEquals(registrationDetails.mobile_number, '+12035555555')
        assertEquals(
          registrationDetails.national_id_number,
          demographics.national_id_number,
        )
        assertEquals(registrationDetails.date_of_first_practice, '2022-01-01')
        assertEquals(registrationDetails.ncz_registration_number, 'GN123456')
        assertEquals(nurseEmployment.specialty, 'oncology and palliative care')
        // TODO turn off SKIP_NURSE_REGISTRATION
        // assertEquals(
        //   postResponse.url,
        //   `${route}/app/pending_approval`,
        // )
      }
    })
  },
)
