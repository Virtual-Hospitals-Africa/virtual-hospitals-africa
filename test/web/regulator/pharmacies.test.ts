import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import * as cheerio from 'cheerio'
import db from '../../../db/db.ts'
import { addTestRegulatorWithSession } from '../../_helpers/regulators.ts'
import { route } from '../../route.ts'
import waitUntilTestServerUp from '../../_helpers/waitUntilTestServerUp.ts'

describeParallel.skip(
  '/regulator/[country]/pharmacies',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    itParallel('renders a search input with GET', async () => {
      const { fetch, regulator } = await addTestRegulatorWithSession(db)

      const response = await fetch(`/regulator/${regulator.country}/pharmacies`)

      assert(response.ok, 'should have returned ok')
      assert(
        response.url === `${route}/regulator/${regulator.country}/pharmacies`,
      )
      const page_contents = await response.text()

      const $ = cheerio.load(page_contents)

      assert(
        $('input[name="search"]').length === 1,
        'should have a search input',
      )
    })

    itParallel('renders a pharmacy table with GET', async () => {
      const { fetch, regulator } = await addTestRegulatorWithSession(db)

      const response = await fetch(`/regulator/${regulator.country}/pharmacies`)

      assert(response.ok, 'should have returned ok')
      assert(
        response.url === `${route}/regulator/${regulator.country}/pharmacies`,
      )
      const page_contents = await response.text()

      const $ = cheerio.load(page_contents)

      assert($('table').length === 1)
    })
  },
)
