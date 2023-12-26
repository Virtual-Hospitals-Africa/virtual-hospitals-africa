import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorker,
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from '../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestAddress } from '../../../mocks.ts'
import { redis } from '../../../../external-clients/redis.ts'
import * as nurse_registration_details from '../../../../db/models/nurse_registration_details.ts'
import db from '../../../../db/db.ts'

describeWithWebServer(
  '/app/facilities/[facility_id]/register',
  8008,
  (route) => {
    it('renders a registration page on GET', async () => {
      const { sessionId } = await addTestHealthWorkerWithSession({
        scenario: 'nurse',
      })

      const response = await fetch(
        `${route}/app/facilities/1/register`,
        {
          headers: {
            Cookie: `sessionId=${sessionId}`,
          },
        },
      )

      assert(response.ok, 'should have returned ok')
      assert(
        response.url === `${route}/app/facilities/1/register?step=personal`,
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

      assert($('select[name="country_id"]').length === 1)
      assert($('select[name="province_id"]').length === 1)
      assert($('select[name="district_id"]').length === 1)
      assert($('select[name="ward_id"]').length === 1)
      assert($('input[name="street"]').length === 1)
      assert(
        $('select[name="suburb_id"]').length === 0,
        'suburb is only necessary for certain wards',
      )
    })

    it('supports POSTs on the personal, professional, and documents step, moving you into /pending_approval', async () => {
      await addTestHealthWorker({ scenario: 'admin' })
      const { sessionId, healthWorker: nurse } =
        await addTestHealthWorkerWithSession({
          scenario: 'nurse',
        })
      const address = await createTestAddress()

      {
        const body = new FormData()
        body.set('first_name', 'Test')
        body.set('middle_names', 'Zoom Zoom')
        body.set('last_name', 'Nurse')
        body.set('gender', 'female')
        body.set('national_id_number', '08-123456 D 53')
        body.set('date_of_birth', '2020-01-01')
        body.set('mobile_number', '5555555555')

        body.set('country_id', address.country_id.toString())
        body.set('province_id', address.province_id.toString())
        body.set('district_id', address.district_id.toString())
        body.set('ward_id', address.ward_id.toString())
        if (address.suburb_id) {
          body.set('suburb_id', address.suburb_id.toString())
        }
        if (address.street) body.set('street', address.street)

        const postResponse = await fetch(
          `${route}/app/facilities/1/register?step=personal`,
          {
            method: 'POST',
            headers: {
              Cookie: `sessionId=${sessionId}`,
            },
            body,
          },
        )

        if (!postResponse.ok) {
          throw new Error(await postResponse.text())
        }

        const session = await redis.get(`S_${sessionId}`)
        assert(session)
        const sessionData = JSON.parse(session)
        assert(sessionData.data.registrationFormState)
        const registrationFormState = JSON.parse(
          sessionData.data.registrationFormState,
        )

        assertEquals({
          ...registrationFormState,
          suburb_id: registrationFormState.suburb_id || null,
        }, {
          date_of_birth: '2020-01-01',
          first_name: 'Test',
          gender: 'female',
          last_name: 'Nurse',
          middle_names: 'Zoom Zoom',
          mobile_number: 5555555555,
          national_id_number: '08-123456 D 53',
          ...address,
        })

        assertEquals(
          postResponse.url,
          `${route}/app/facilities/1/register?step=professional`,
        )

        const getPersonalResponse = await fetch(
          `${route}/app/facilities/1/register?step=personal`,
          {
            headers: {
              Cookie: `sessionId=${sessionId}`,
            },
          },
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
        assertEquals($('input[name="mobile_number"]').val(), '5555555555')

        assert(
          $('select[name="country_id"]').val(),
          address.country_id.toString(),
        )
        assert(
          $('select[name="province_id"]').val(),
          address.province_id.toString(),
        )
        assert(
          $('select[name="district_id"]').val(),
          address.district_id.toString(),
        )
        assert($('select[name="ward_id"]').val(), address.ward_id.toString())
        assert($('input[name="street"]').val(), address.street!.toString())
        if (address.suburb_id) {
          assert(
            $('select[name="suburb_id"]').val(),
            address.suburb_id.toString(),
          )
        }
      }

      {
        const body = new FormData()
        body.set('date_of_first_practice', '2022-01-01')
        body.set('ncz_registration_number', 'GN123456')
        body.set('specialty', 'oncology_and_palliative_care_nurse')

        const postResponse = await fetch(
          `${route}/app/facilities/1/register?step=professional`,
          {
            method: 'POST',
            headers: {
              Cookie: `sessionId=${sessionId}`,
            },
            body,
          },
        )

        if (!postResponse.ok) {
          throw new Error(await postResponse.text())
        }

        const session = await redis.get(`S_${sessionId}`)
        assert(session)
        const sessionData = JSON.parse(session)
        assert(sessionData.data.registrationFormState)
        const registrationFormState = JSON.parse(
          sessionData.data.registrationFormState,
        )

        assertEquals({
          ...registrationFormState,
          suburb_id: registrationFormState.suburb_id || null,
        }, {
          date_of_birth: '2020-01-01',
          first_name: 'Test',
          gender: 'female',
          last_name: 'Nurse',
          middle_names: 'Zoom Zoom',
          mobile_number: 5555555555,
          national_id_number: '08-123456 D 53',
          ...address,
          date_of_first_practice: '2022-01-01',
          ncz_registration_number: 'GN123456',
          specialty: 'oncology_and_palliative_care_nurse',
        })

        assertEquals(
          postResponse.url,
          `${route}/app/facilities/1/register?step=documents`,
        )

        const getProfessionalResponse = await fetch(
          `${route}/app/facilities/1/register?step=professional`,
          {
            headers: {
              Cookie: `sessionId=${sessionId}`,
            },
          },
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
          'oncology_and_palliative_care_nurse',
        )
      }

      {
        // TODO: upload documents
        const body = new FormData()

        const postResponse = await fetch(
          `${route}/app/facilities/1/register?step=documents`,
          {
            method: 'POST',
            headers: {
              Cookie: `sessionId=${sessionId}`,
            },
            body,
          },
        )

        if (!postResponse.ok) {
          throw new Error(await postResponse.text())
        }

        const session = await redis.get(`S_${sessionId}`)
        assert(session)
        const sessionData = JSON.parse(session)
        assert(!sessionData.data.registrationFormState)

        const registrationDetails = await nurse_registration_details.get(db, {
          healthWorkerId: nurse.id,
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
        ).selectAll().executeTakeFirst()
        const specialty = await db.selectFrom('nurse_specialties').selectAll()
          .executeTakeFirst()
        assert(registrationDetails)
        assert(newNurse)
        assert(nurseEmployment)
        assert(specialty)

        assertEquals(registrationDetails.date_of_birth, '2020-01-01')
        assertEquals(newNurse.name, 'Test Zoom Zoom Nurse')
        assertEquals(registrationDetails.gender, 'female')
        assertEquals(registrationDetails.mobile_number, '5555555555')
        assertEquals(registrationDetails.national_id_number, '08-123456 D 53')
        assertEquals(registrationDetails.date_of_first_practice, '2022-01-01')
        assertEquals(registrationDetails.ncz_registration_number, 'GN123456')
        assertEquals(specialty.employee_id, nurseEmployment.id)
        assertEquals(specialty.specialty, 'oncology_and_palliative_care_nurse')

        assertEquals(
          postResponse.url,
          `${route}/app/pending_approval`,
        )
      }
    })
  },
)
