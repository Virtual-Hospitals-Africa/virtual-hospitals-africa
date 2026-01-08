import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import * as cheerio from 'cheerio'
import db from '../../../db/db.ts'
import { path } from '../../../util/path.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  addTestPharmacist,
  removeTestPharmacist,
} from '../../_helpers/pharmacists.ts'
import { addTestRegulatorWithSession } from '../../_helpers/regulators.ts'
import { route } from '../../_route.ts'
import waitUntilTestServerUp from '../../_helpers/waitUntilTestServerUp.ts'

describeParallel.skip(
  '/regulator/[country]/pharmacists',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    itParallel('renders a search input with GET', async () => {
      const { fetch, regulator } = await addTestRegulatorWithSession(db)

      const response = await fetch(
        `/regulator/${regulator.country}/pharmacists`,
      )

      assert(response.ok, 'should have returned ok')
      assert(
        response.url === `${route}/regulator/${regulator.country}/pharmacists`,
      )
      const page_contents = await response.text()

      const $ = cheerio.load(page_contents)
      assert(
        $('input[name="search"]').length === 1,
        'should have a search input',
      )
    })

    itParallel(
      'renders a pharmacist table and a pharmacist with GET',
      async () => {
        const new_pharmacist = await addTestPharmacist(db)
        const { fetch, regulator } = await addTestRegulatorWithSession(db)

        const pharmacist_name =
          `${new_pharmacist.given_name} ${new_pharmacist.family_name}`

        const response = await fetch(
          path(`/regulator/${regulator.country}/pharmacists`, {
            search: pharmacist_name,
          }),
        )

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const page_contents = await response.text()

        const $ = cheerio.load(page_contents)

        assertEquals($('table').length, 1)

        assert(
          $(`td div:contains(${pharmacist_name})`).length === 1,
          `should have one <td> with the pharmacist name"`,
        )

        const table_row = $(`tr div:contains(${pharmacist_name})`).closest('tr')

        assert(
          table_row.find(`td > div:contains(${new_pharmacist.prefix})`)
            .length ===
            1,
          `should have one <td> with the text the pharmacist prefix"`,
        )

        assert(
          table_row.find(`td > div:contains(${new_pharmacist.pharmacist_type})`)
            .length === 1,
          `should have one <td> with the text the pharmacist type"`,
        )

        assert(
          table_row.find(`td > div:contains(${new_pharmacist.licence_number})`)
            .length === 1,
          `should have one <td> with the text the pharmacist licence number`,
        )

        assert(
          table_row.find(`td > div:contains(${new_pharmacist.expiry_date})`)
            .length === 1,
          `should have one <td> with the text the pharmacist expiry date`,
        )

        await removeTestPharmacist(db, new_pharmacist.id)
      },
    )
  },
)
