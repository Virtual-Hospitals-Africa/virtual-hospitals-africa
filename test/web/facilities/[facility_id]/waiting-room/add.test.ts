import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorker,
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from '../../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestAddress } from '../../../../mocks.ts'
import { redis } from '../../../../../external-clients/redis.ts'
import * as nurse_registration_details from '../../../../../db/models/nurse_registration_details.ts'
import db from '../../../../../db/db.ts'

describeWithWebServer(
  '/app/facilities/[facility_id]/waiting-room/add',
  8007,
  (route) => {
    it('renders a page on GET', async () => {


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

      assert($('input[name="patient_name"]').length === 1)
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
  },
)
