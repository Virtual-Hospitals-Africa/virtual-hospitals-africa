import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID from '../../../../util/uuid.ts'
import { addTestRegulatorWithSession, route } from '../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'

describe(
  '/regulator/pharmacists/invite',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders an invite page on GET', async () => {
      const { fetch } = await addTestRegulatorWithSession(db)

      const response = await fetch(`/regulator/pharmacists/invite`)

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${route}/regulator/pharmacists/invite`)
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      assert($('input[name="given_name"]').length === 1)
      assert($('input[name="family_name"]').length === 1)
      assert($('input[name="licence_number"]').length === 1)
      assert($('input[name="expiry_date"]').length === 1)
      assert($('input[name="town"]').length === 1)
      assert($('input[name="address"]').length === 1)
      assert($('select[name="prefix"]').length === 1)
      assert($('select[name="pharmacist_type"]').length === 1)
    })

    it('can create a pharmacist via POST', async () => {
      const { fetch } = await addTestRegulatorWithSession(db)

      {
        const givenName = `Test Given Name ${generateUUID()}`
        const familyName = `Test Family Name ${generateUUID()}`
        const licenceNumber = 'P01-0805-2024'
        const body = new FormData()
        body.set('given_name', givenName)
        body.set('family_name', familyName)
        body.set('licence_number', licenceNumber)
        body.set('expiry_date', '2030-01-01')
        body.set('town', 'Test Town')
        body.set('address', 'Test Address')
        body.set('prefix', 'Mrs')
        body.set('pharmacist_type', 'Pharmacist')

        const postResponse = await fetch(
          `${route}/regulator/pharmacists/invite`,
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
          `${route}/regulator/pharmacists?success=${
            encodeURIComponent('New pharmacist added')
          }`,
        )

        const invitedPharmacist = await db
          .selectFrom('pharmacists')
          .where('given_name', '=', givenName)
          .where('family_name', '=', familyName)
          .select(['given_name', 'family_name', 'licence_number'])
          .executeTakeFirst()

        assertEquals(invitedPharmacist?.given_name, givenName)
        assertEquals(invitedPharmacist?.family_name, familyName)
        assertEquals(invitedPharmacist?.licence_number, licenceNumber)
      }
    })
  },
)
