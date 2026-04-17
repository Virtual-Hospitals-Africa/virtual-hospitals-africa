import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { before, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import * as cheerio from 'cheerio'
import { route } from './_route.ts'
import waitUntilMarketingServerUp from './_helpers/waitUntilMarketingServerUp.ts'

const expected_links = [
  '/mailing-list',
  '/schedule-demo?entrypoint=health-workers',
  '/waitlist?entrypoint=patients',
  '/schedule-demo?entrypoint=research',
  '/schedule-demo',
  '/partner',
  // '/volunteer',
]

describeParallel(
  'landing page',
  () => {
    before(waitUntilMarketingServerUp)
    itParallel('can be accessed', async () => {
      const response = await fetch(route)
      const text = await response.text()
      assert(text.includes('Virtual Hospitals Africa'), `${text}`)
    })

    itParallel('has links to various signup forms', async () => {
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
