import { afterAll, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'https://deno.land/std@0.190.0/testing/asserts.ts'
import { readLines } from 'https://deno.land/std@0.140.0/io/buffer.ts'
import { readerFromStreamReader } from 'https://deno.land/std@0.140.0/streams/conversion.ts'



describe('landing page', () => {
  const PORT = '8001'
  const ROUTE = `https://localhost:${PORT}`
  let process: Deno.ChildProcess
  beforeAll(async () => {
    process = new Deno.Command('deno', {
      args: [
        'task',
        'start',
      ],
      env: {
        PORT: PORT,
      },
      stdin: 'null',
      stdout: 'piped',
      stderr: 'null',
    }).spawn()

    const stdout = process.stdout.getReader()
    const reader = readerFromStreamReader(stdout)
    const lineReader = readLines(reader)

    let line: string
    const ___timeout___ = Date.now()
    do {
      if (Date.now() > ___timeout___ + 20000 ) {
        stdout.releaseLock()
        await process.stdout.cancel()
        throw new Error('hung process')
      }
      line = (await lineReader.next()).value
    } while (line !== `Listening on ${ROUTE}/`)
    stdout.releaseLock()
    await process.stdout.cancel()
  })
  afterAll(() => {
    process.kill()
  })

  it('can be accessed', async () => {
    const response = await fetch('https://localhost:8001/')
    assert((await response.text()).includes('Virtual Hospitals Africa'))
  })
})
