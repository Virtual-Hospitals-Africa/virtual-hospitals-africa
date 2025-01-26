import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorker,
  addTestHealthWorkerWithSession,
  route,
} from '../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestAddress } from '../../../mocks.ts'
import * as nurse_registration_details from '../../../../db/models/nurse_registration_details.ts'
import db from '../../../../db/db.ts'

describe(
  '/app/organizations/[organization_id]/register',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders a registration page on GET', async () => {
      const { fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'nurse',
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

      assert($('input[name="first_name"]').length === 1)
      assert($('input[name="middle_names"]').length === 1)
      assert($('input[name="last_name"]').length === 1)
      assert($('input[name="date_of_birth"]').length === 1)
      assert($('input[name="email"]').length === 1)
      assert($('select[name="gender"]').length === 1)
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
      await addTestHealthWorker(db, { scenario: 'admin' })
      const { fetch, healthWorker: nurse } =
        await addTestHealthWorkerWithSession(db, {
          scenario: 'nurse',
        })
      const address = await createTestAddress(db)

      {
        const body = new FormData()
        body.set('first_name', 'Test')
        body.set('middle_names', 'Zoom Zoom')
        body.set('last_name', 'Nurse')
        body.set('gender', 'female')
        body.set('national_id_number', '08-123456 D 53')
        body.set('date_of_birth', '2020-01-01')
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

        const registrationFormState = await nurse_registration_details
          .getInProgress(db, {
            health_worker_id: nurse.id,
          })

        assertEquals(registrationFormState, {
          date_of_birth: '2020-01-01',
          first_name: 'Test',
          gender: 'female',
          last_name: 'Nurse',
          middle_names: 'Zoom Zoom',
          mobile_number: '+12035555555',
          national_id_number: '08-123456 D 53',
          address,
        })

        assertEquals(
          postResponse.url,
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/professional`,
        )

        const getPersonalResponse = await fetch(
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/personal`,
        )

        const pageContents = await getPersonalResponse.text()
        const $ = cheerio.load(pageContents)
        assertEquals($('input[name="first_name"]').val(), 'Test')
        assertEquals($('input[name="middle_names"]').val(), 'Zoom Zoom')
        assertEquals($('input[name="last_name"]').val(), 'Nurse')
        assertEquals($('input[name="date_of_birth"]').val(), '2020-01-01')
        assertEquals($('select[name="gender"]').val(), 'female')
        assertEquals(
          $('input[name="national_id_number"]').val(),
          '08-123456 D 53',
        )
        assertEquals($('input[name="mobile_number"]').val(), '+12035555555')

        assert(
          $('input[name="address.country"]').val(),
          address.country,
        )
        assert(
          $('input[name="address.administrative_area_level_1"]').val(),
          address.administrative_area_level_1,
        )
        assert(
          $('input[name="address.administrative_area_level_2"]').val(),
          address.administrative_area_level_2,
        )
        assert(
          $('input[name="address.locality"]').val(),
          address.locality,
        )
        assert(
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

        const registrationFormState = await nurse_registration_details
          .getInProgress(db, {
            health_worker_id: nurse.id,
          })

        assertEquals(registrationFormState, {
          date_of_birth: '2020-01-01',
          first_name: 'Test',
          gender: 'female',
          last_name: 'Nurse',
          middle_names: 'Zoom Zoom',
          mobile_number: '+12035555555',
          national_id_number: '08-123456 D 53',
          date_of_first_practice: '2022-01-01',
          ncz_registration_number: 'GN123456',
          specialty: 'oncology and palliative care',
          address,
        })

        assertEquals(
          postResponse.url,
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/documents`,
        )

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

        assertEquals(registrationDetails.date_of_birth, '2020-01-01')
        assertEquals(newNurse.name, 'Test Zoom Zoom Nurse')
        assertEquals(registrationDetails.gender, 'female')
        assertEquals(registrationDetails.mobile_number, '+12035555555')
        assertEquals(registrationDetails.national_id_number, '08-123456 D 53')
        assertEquals(registrationDetails.date_of_first_practice, '2022-01-01')
        assertEquals(registrationDetails.ncz_registration_number, 'GN123456')
        assertEquals(nurseEmployment.specialty, 'oncology and palliative care')

        assertEquals(
          postResponse.url,
          `${route}/app`,
        )
        // TODO turn off SKIP_NURSE_REGISTRATION
        // assertEquals(
        //   postResponse.url,
        //   `${route}/app/pending_approval`,
        // )
      }
    })
  },
)
