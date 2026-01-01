import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID from '../../../../../util/uuid.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import { Prefix } from '../../../../../types.ts'
import { addTestPharmacist } from '../../../../_helpers/pharmacists.ts'
import { addTestRegulatorWithSession } from '../../../../_helpers/regulators.ts'
import { route } from '../../../../route.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'

describe.skip(
  '/regulator/[country]/pharmacists/[pharmacist_id]/edit',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    itParallel('renders the edit page with correct pharmacist data on GET', async () => {
      const new_pharmacist = await addTestPharmacist(db)
      const { fetch, regulator } = await addTestRegulatorWithSession(db)

      const response = await fetch(
        `${route}/regulator/${regulator.country}/pharmacists/${new_pharmacist.id}/edit`,
      )

      assert(response.ok, 'should have returned ok')
      assert(
        response.url ===
          `${route}/regulator/${regulator.country}/pharmacists/${new_pharmacist.id}/edit`,
      )
      const page_contents = await response.text()

      const $ = cheerio.load(page_contents)

      assert($('input[name="given_name"]').length === 1)
      assert(
        $('input[name="given_name"]').attr('value') ===
          new_pharmacist.given_name,
      )
      assert($('input[name="family_name"]').length === 1)
      assert(
        $('input[name="family_name"]').attr('value') ===
          new_pharmacist.family_name,
      )
      assert($('input[name="licence_number"]').length === 1)
      assert(
        $('input[name="licence_number"]').attr('value') ===
          new_pharmacist.licence_number,
      )
      assert($('input[name="expiry_date"]').length === 1)
      assert(
        $('input[name="expiry_date"]').attr('value') ===
          new_pharmacist.expiry_date,
      )
      assert($('input[name="town"]').length === 1)
      assert($('input[name="town"]').attr('value') === new_pharmacist.town)
      assert($('input[name="address"]').length === 1)
      assert(
        $('input[name="address"]').attr('value') === new_pharmacist.address,
      )
      assert($('select[name="prefix"]').length === 1)
      assert(
        $(`select[name="prefix"] option[value=${new_pharmacist.prefix}]`).attr(
          'selected',
        ) === 'selected',
      )
      assert($('select[name="pharmacist_type"]').length === 1)
      assert(
        $(
          `select[name="pharmacist_type"] option[value=${new_pharmacist.pharmacist_type}]`,
        ).attr('selected') === 'selected',
      )
    })

    itParallel('can update a pharmacist via POST', async () => {
      const new_pharmacist = await addTestPharmacist(db)
      const { fetch, regulator } = await addTestRegulatorWithSession(db)

      const response = await fetch(
        `${route}/regulator/${regulator.country}/pharmacists/${new_pharmacist.id}/edit`,
      )

      assert(response.ok, 'should have returned ok')
      assert(
        response.url ===
          `${route}/regulator/${regulator.country}/pharmacists/${new_pharmacist.id}/edit`,
      )

      {
        const given_name = `New Given Name ${generateUUID()}`
        const family_name = `New Family Name ${generateUUID()}`
        const licence_number = 'P01-0805-2025'
        const body = new FormData()
        body.set('given_name', given_name)
        body.set('family_name', family_name)
        body.set('licence_number', licence_number)
        body.set('expiry_date', new_pharmacist.expiry_date)
        body.set('town', new_pharmacist.town as string)
        body.set('address', new_pharmacist.address as string)
        body.set('prefix', new_pharmacist.prefix as Prefix)
        body.set('pharmacist_type', new_pharmacist.pharmacist_type)

        const post_response = await fetch(
          `${route}/regulator/${regulator.country}/pharmacists/${new_pharmacist.id}/edit`,
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
            encodeURIComponent(
              'Pharmacist updated',
            )
          }`,
        )

        const updated_pharmacist = await db
          .selectFrom('pharmacists')
          .where('id', '=', new_pharmacist.id)
          .select(['given_name', 'family_name', 'licence_number'])
          .executeTakeFirst()

        assertEquals(updated_pharmacist?.given_name, given_name)
        assertEquals(updated_pharmacist?.family_name, family_name)
        assertEquals(updated_pharmacist?.licence_number, licence_number)
      }
    })
  },
)
