import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { describeWithWebServer } from './utilities.ts'

describeWithWebServer('landing page', 8003, (route) => {
  it('can be accessed', async () => {
    const response = await fetch(route)
    assert((await response.text()).includes('Virtual Hospitals Africa'))
  })
})
