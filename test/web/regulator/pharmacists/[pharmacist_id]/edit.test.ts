import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID from '../../../../../util/uuid.ts'
import {
  addTestPharmacist,
  addTestRegulatorWithSession,
  route,
} from '../../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import { Prefix } from '../../../../../types.ts'

describe(
  '/regulator/pharmacists/[pharmacist_id]/edit',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders the edit page with correct pharmacist data on GET', async () => {
      const newPharmacist = await addTestPharmacist(db)
      const { fetch } = await addTestRegulatorWithSession(db)

      const response = await fetch(
        `${route}/regulator/pharmacists/${newPharmacist.id}/edit`,
      )

      assert(response.ok, 'should have returned ok')
      assert(
        response.url ===
          `${route}/regulator/pharmacists/${newPharmacist.id}/edit`,
      )
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      assert($('input[name="given_name"]').length === 1)
      assert(
        $('input[name="given_name"]').attr('value') ===
          newPharmacist.given_name,
      )
      assert($('input[name="family_name"]').length === 1)
      assert(
        $('input[name="family_name"]').attr('value') ===
          newPharmacist.family_name,
      )
      assert($('input[name="licence_number"]').length === 1)
      assert(
        $('input[name="licence_number"]').attr('value') ===
          newPharmacist.licence_number,
      )
      assert($('input[name="expiry_date"]').length === 1)
      assert(
        $('input[name="expiry_date"]').attr('value') ===
          newPharmacist.expiry_date,
      )
      assert($('input[name="town"]').length === 1)
      assert($('input[name="town"]').attr('value') === newPharmacist.town)
      assert($('input[name="address"]').length === 1)
      assert($('input[name="address"]').attr('value') === newPharmacist.address)
      assert($('select[name="prefix"]').length === 1)
      assert(
        $(`select[name="prefix"] option[value=${newPharmacist.prefix}]`).attr(
          'selected',
        ) === 'selected',
      )
      assert($('select[name="pharmacist_type"]').length === 1)
      assert(
        $(
          `select[name="pharmacist_type"] option[value=${newPharmacist.pharmacist_type}]`,
        ).attr('selected') === 'selected',
      )
    })

    it('can update a pharmacist via POST', async () => {
      const newPharmacist = await addTestPharmacist(db)
      const { fetch } = await addTestRegulatorWithSession(db)

      const response = await fetch(
        `${route}/regulator/pharmacists/${newPharmacist.id}/edit`,
      )

      assert(response.ok, 'should have returned ok')
      assert(
        response.url ===
          `${route}/regulator/pharmacists/${newPharmacist.id}/edit`,
      )

      {
        const givenName = `New Given Name ${generateUUID()}`
        const familyName = `New Family Name ${generateUUID()}`
        const licenceNumber = 'P01-0805-2025'
        const body = new FormData()
        body.set('given_name', givenName)
        body.set('family_name', familyName)
        body.set('licence_number', licenceNumber)
        body.set('expiry_date', newPharmacist.expiry_date)
        body.set('town', newPharmacist.town as string)
        body.set('address', newPharmacist.address as string)
        body.set('prefix', newPharmacist.prefix as Prefix)
        body.set('pharmacist_type', newPharmacist.pharmacist_type)

        const postResponse = await fetch(
          `${route}/regulator/pharmacists/${newPharmacist.id}/edit`,
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
            encodeURIComponent(
              'Pharmacist updated',
            )
          }`,
        )

        const updatedPharmacist = await db
          .selectFrom('pharmacists')
          .where('id', '=', newPharmacist.id)
          .select(['given_name', 'family_name', 'licence_number'])
          .executeTakeFirst()

        assertEquals(updatedPharmacist?.given_name, givenName)
        assertEquals(updatedPharmacist?.family_name, familyName)
        assertEquals(updatedPharmacist?.licence_number, licenceNumber)
      }
    })
  },
)
