import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestRegulatorWithSession, route } from '../utilities.ts'
import * as cheerio from 'cheerio'
import db from '../../../db/db.ts'

describe(
  '/regulator/pharmacies',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders a search input with GET', async () => {
      const { fetch } = await addTestRegulatorWithSession(db)

      const response = await fetch(`${route}/regulator/pharmacies`)

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${route}/regulator/pharmacies`)
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      assert($('input[name="search"]').length === 1)
    })

    it('renders a pharmacy table with GET', async () => {
      const { fetch } = await addTestRegulatorWithSession(db)

      const response = await fetch(`${route}/regulator/pharmacies`)

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${route}/regulator/pharmacies`)
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      assert($('table').length === 1)
    })
  },
)
