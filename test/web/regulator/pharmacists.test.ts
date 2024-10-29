import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestPharmacist,
  addTestRegulatorWithSession,
  removeTestPharmacist,
  route,
} from '../utilities.ts'
import * as cheerio from 'cheerio'
import db from '../../../db/db.ts'
import { path } from '../../../util/path.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe(
  '/regulator/pharmacists',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders a search input with GET', async () => {
      const { fetch } = await addTestRegulatorWithSession(db)

      const response = await fetch('/regulator/pharmacists')

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${route}/regulator/pharmacists`)
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)
      assert(
        $('input[name="search"]').length === 1,
        'should have a search input',
      )
    })

    it('renders a pharmacist table and a pharmacist with GET', async () => {
      const newPharmacist = await addTestPharmacist(db)
      const { fetch } = await addTestRegulatorWithSession(db)

      const pharmacist_name =
        `${newPharmacist.given_name} ${newPharmacist.family_name}`

      const response = await fetch(path('/regulator/pharmacists', {
        search: pharmacist_name,
      }))

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      assertEquals($('table').length, 1)

      assert(
        $(`td div:contains(${pharmacist_name})`).length === 1,
        `should have one <td> with the pharmacist name"`,
      )

      const tableRow = $(`tr div:contains(${pharmacist_name})`).closest('tr')

      assert(
        tableRow.find(`td > div:contains(${newPharmacist.prefix})`).length ===
          1,
        `should have one <td> with the text the pharmacist prefix"`,
      )

      assert(
        tableRow.find(`td > div:contains(${newPharmacist.pharmacist_type})`)
          .length === 1,
        `should have one <td> with the text the pharmacist type"`,
      )

      assert(
        tableRow.find(`td > div:contains(${newPharmacist.licence_number})`)
          .length === 1,
        `should have one <td> with the text the pharmacist licence number`,
      )

      assert(
        tableRow.find(`td > div:contains(${newPharmacist.expiry_date})`)
          .length === 1,
        `should have one <td> with the text the pharmacist expiry date`,
      )

      await removeTestPharmacist(db, newPharmacist.id)
    })
  },
)
