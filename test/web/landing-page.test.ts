import { afterAll, afterEach, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'https://deno.land/std@0.190.0/testing/asserts.ts'

describe('landing page', () => {
  let server: Deno.ChildProcess
  beforeAll(() => {
    server = new Deno.Command("deno", {
      args: [
        "task",
        "start",
      ],
      env: {
        PORT: '8001',
      },
      stdin: 'null',
      stdout: 'null',
      stderr: 'null',
    }).spawn()
    // TODO use readLines to actually know the server has started when we see this line
    // Listening on https://localhost:8000/
    return new Promise((resolve) => setTimeout(resolve, 2000))
  })
  
  afterAll(() => {
    server.kill()
  })


  it('can be accessed', async () => {
    const response = await fetch('https://localhost:8001/')
    const text = await response.text()
    assert(text.includes('Virtual Hospitals Africa'))
  })
})
