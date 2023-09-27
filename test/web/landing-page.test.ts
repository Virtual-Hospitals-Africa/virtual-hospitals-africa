import { afterAll, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { cleanUpWebServer, startWebServer } from './utilities.ts'

describe('landing page', () => {
  const PORT = '8001'
  const ROUTE = `https://localhost:${PORT}`
  let process: Deno.ChildProcess
  beforeAll(async () => {
    process = await startWebServer(PORT)
  })
  afterAll(async () => {
    await cleanUpWebServer(process)
  })

  it('can be accessed', async () => {
    const response = await fetch(`${ROUTE}`)
    assert((await response.text()).includes('Virtual Hospitals Africa'))
  })
})
