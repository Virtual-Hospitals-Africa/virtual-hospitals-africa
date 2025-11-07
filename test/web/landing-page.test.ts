import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { route } from '../route.ts'
import * as cheerio from 'cheerio'
import db from '../../db/db.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'

const expected_links = [
  '/waitlist?entrypoint=hero',
  '/schedule-demo?entrypoint=health-workers',
  '/waitlist?entrypoint=patients',
  '/schedule-demo?entrypoint=research',
  '/schedule-demo',
  '/partner',
  // '/volunteer',
]

describe(
  'landing page',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    it('can be accessed', async () => {
      const response = await fetch(route)
      const text = await response.text()
      assert(text.includes('Virtual Hospitals Africa'), `${text}`)
    })

    it('has links to various signup forms', async () => {
      const response = await fetch(route)
      const $ = cheerio.load(await response.text())

      for (const expected_link of expected_links) {
        assert(
          $(`a[href="${expected_link}"]`).length === 1,
          `expected to find a link to ${expected_link}`,
        )
      }
    })

    for (const expected_link of expected_links) {
      it(`can load ${expected_link}`, async () => {
        const response = await fetch(`${route}${expected_link}`)
        if (!response.ok) throw new Error(await response.text())
        await response.body?.cancel()
      })
    }
  },
)
