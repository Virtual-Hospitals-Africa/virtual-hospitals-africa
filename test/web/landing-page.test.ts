import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { describeWithWebServer } from './utilities.ts'
import * as cheerio from 'cheerio'

const expectedLinks = [
  '/waitlist?entrypoint=hero',
  '/schedule-demo?entrypoint=health-workers',
  '/waitlist?entrypoint=patients',
  '/schedule-demo?entrypoint=research',
  '/schedule-demo',
  '/partner',
  // '/volunteer',
]

describeWithWebServer('landing page', 8003, (route) => {
  it('can be accessed', async () => {
    const response = await fetch(route)
    assert((await response.text()).includes('Virtual Hospitals Africa'))
  })

  it('has links to various signup forms', async () => {
    const response = await fetch(route)
    const $ = cheerio.load(await response.text())

    for (const expectedLink of expectedLinks) {
      assert(
        $(`a[href="${expectedLink}"]`).length === 1,
        `expected to find a link to ${expectedLink}`,
      )
    }
  })

  for (const expectedLink of expectedLinks) {
    it(`can load ${expectedLink}`, async () => {
      const response = await fetch(`${route}${expectedLink}`)
      if (!response.ok) throw new Error(await response.text())
    })
  }
})
