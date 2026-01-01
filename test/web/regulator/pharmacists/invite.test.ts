import { before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID from '../../../../util/uuid.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'
import { addTestRegulatorWithSession } from '../../../_helpers/regulators.ts'
import { route } from '../../../route.ts'
import waitUntilTestServerUp from '../../../_helpers/waitUntilTestServerUp.ts'

describeParallel
  '/regulator/[country]/pharmacists/invite',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    before(waitUntilTestServerUp)
    itParallel('renders an invite page on GET', async () => {
      const { regulator, fetchOk } = await addTestRegulatorWithSession(db)

      const response = await fetchOk(
        `/regulator/${regulator.country}/pharmacists/invite`,
      )

      assert(
        response.url ===
          `${route}/regulator/${regulator.country}/pharmacists/invite`,
      )
      const page_contents = await response.text()

      const $ = cheerio.load(page_contents)

      assert($('input[name="given_name"]').length === 1)
      assert($('input[name="family_name"]').length === 1)
      assert($('input[name="licence_number"]').length === 1)
      assert($('input[name="expiry_date"]').length === 1)
      assert($('input[name="town"]').length === 1)
      assert($('input[name="address"]').length === 1)
      assert($('select[name="prefix"]').length === 1)
      assert($('select[name="pharmacist_type"]').length === 1)
    })

    itParallel('can create a pharmacist via POST', async () => {
      const { fetch, regulator } = await addTestRegulatorWithSession(db)

      {
        const given_name = `Test Given Name ${generateUUID()}`
        const family_name = `Test Family Name ${generateUUID()}`
        const licence_number = 'P01-0805-2024'
        const body = new FormData()
        body.set('given_name', given_name)
        body.set('family_name', family_name)
        body.set('licence_number', licence_number)
        body.set('expiry_date', '2030-01-01')
        body.set('town', 'Test Town')
        body.set('address', 'Test Address')
        body.set('prefix', 'Mrs')
        body.set('pharmacist_type', 'Pharmacist')

        const post_response = await fetch(
          `${route}/regulator/${regulator.country}/pharmacists/invite`,
          {
            method: 'POST',
            body,
          },
        )

        if (!post_response.ok) {
          throw new Error(await post_response.text())
        }

        assertEquals(
          post_response.url,
          `${route}/regulator/${regulator.country}/pharmacists?success=${
            encodeURIComponent('New pharmacist added')
          }`,
        )

        const invited_pharmacist = await db
          .selectFrom('pharmacists')
          .where('given_name', '=', given_name)
          .where('family_name', '=', family_name)
          .select(['given_name', 'family_name', 'licence_number'])
          .executeTakeFirst()

        assertEquals(invited_pharmacist?.given_name, given_name)
        assertEquals(invited_pharmacist?.family_name, family_name)
        assertEquals(invited_pharmacist?.licence_number, licence_number)
      }
    })
  },
)
