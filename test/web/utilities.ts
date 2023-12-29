import { readLines } from 'https://deno.land/std@0.164.0/io/buffer.ts'
import { readerFromStreamReader } from 'https://deno.land/std@0.164.0/streams/conversion.ts'
import * as cheerio from 'cheerio'
import generateUUID from '../../util/uuid.ts'
import { afterAll, beforeAll, beforeEach, describe } from 'std/testing/bdd.ts'
import { redis } from '../../external-clients/redis.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'

import * as employee from '../../db/models/employment.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import { assert } from 'std/assert/assert.ts'
import { testHealthWorker, testRegistrationDetails } from '../mocks.ts'
import set from '../../util/set.ts'
import { parseParam } from '../../util/parseForm.ts'
import { HealthWorkerWithGoogleTokens } from '../../types.ts'

type WebServer = {
  process: Deno.ChildProcess
  lineReader: AsyncIterableIterator<string>
  kill: () => Promise<void>
}

export async function startWebServer(
  port: number,
): Promise<WebServer> {
  const process = new Deno.Command('deno', {
    args: [
      'task',
      'web',
    ],
    env: {
      PORT: String(port),
    },
    stdin: 'null',
    stdout: 'piped',
    stderr: 'null',
  }).spawn()

  const stdout = process.stdout.getReader()
  const lineReader = readLines(readerFromStreamReader(stdout))
  const ___timeout___ = Date.now()

  let line: string
  do {
    if (Date.now() > ___timeout___ + 7000) {
      stdout.releaseLock()
      await process.stdout.cancel()
      throw new Error('hung process')
    }
    line = (await lineReader.next()).value
  } while (!line.includes(`http://localhost:${port}/`))

  async function kill() {
    stdout.releaseLock()
    await process.stdout.cancel()
    process.kill()
  }
  return { process, lineReader, kill }
}

export async function killProcessOnPort(port: number) {
  const lsof = await new Deno.Command('bash', {
    args: ['-c', `lsof -i tcp:${port}`],
  }).output()

  const pid = new TextDecoder()
    .decode(lsof.stdout)
    .split('\n')[1]
    ?.split(/\s+/)?.[1]

  if (!pid) return

  const result = await new Deno.Command('bash', {
    args: ['-c', `kill ${pid}`],
  }).output()

  assert(
    result.success,
    `Failed to kill process ${new TextDecoder().decode(result.stderr)}`,
  )
}

/* TODO: figure out how to turn this on
   As it stands if you turn this on you get this

./test/web/patients/add.test.ts (uncaught error)
error: (in promise) TypeError: The reader was released.
    stdout.releaseLock()
           ^
    at readableStreamDefaultReaderRelease (ext:deno_web/06_streams.js:2469:13)
    at ReadableStreamDefaultReader.releaseLock (ext:deno_web/06_streams.js:5318:5)
    at Object.kill (file:///Users/willweiss/dev/morehumaninternet/virtual-hospitals-africa/test/web/utilities.ts:56:12)
    at Object.<anonymous> (file:///Users/willweiss/dev/morehumaninternet/virtual-hospitals-africa/test/web/utilities.ts:151:23)
    at fn (https://deno.land/std@0.204.0/testing/_test_suite.ts:145:32)
*/
export function logLines(lineReader: AsyncIterableIterator<string>) {
  ;(async () => {
    for await (const line of lineReader) {
      console.log(line)
    }
  })()
}

export function describeWithWebServer(
  description: string,
  port: number,
  callback: (route: string) => void,
) {
  describe(
    description,
    { sanitizeResources: false, sanitizeOps: false },
    () => {
      const route = `https://localhost:${port}`
      let webserver: WebServer
      beforeAll(async () => {
        // TODO: figure out why these processes are being orphaned
        await killProcessOnPort(port)
        webserver = await startWebServer(port)
        // logLines(webserver.lineReader)
      })
      beforeEach(resetInTest)
      afterAll(async () => {
        await webserver.kill()
        await db.destroy()
        await redis!.flushdb()
      })
      callback(route)
    },
  )
}

export async function addTestHealthWorker({ scenario }: {
  scenario: 'base' | 'approved-nurse' | 'doctor' | 'admin' | 'nurse'
} = { scenario: 'base' }) {
  const healthWorker: HealthWorkerWithGoogleTokens & {
    employee_id?: number
  } = await upsertWithGoogleCredentials(db, testHealthWorker())
  switch (scenario) {
    case 'approved-nurse': {
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())
      const [created_employee] = await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }, {
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'admin',
      }])
      healthWorker.employee_id = created_employee.id
      await details.add(
        db,
        await testRegistrationDetails({
          health_worker_id: healthWorker.id,
        }),
      )
      await details.approve(db, {
        approverId: admin.id,
        healthWorkerId: healthWorker.id,
      })
      break
    }
    case 'admin': {
      const [created_employee] = await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'admin',
      }])
      healthWorker.employee_id = created_employee.id
      break
    }
    case 'doctor': {
      const [created_employee] = await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'doctor',
      }])
      healthWorker.employee_id = created_employee.id
      break
    }
    case 'nurse': {
      const [created_employee] = await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }])
      healthWorker.employee_id = created_employee.id
      break
    }
  }

  return healthWorker
}

export async function addTestHealthWorkerWithSession(opts: {
  scenario: 'base' | 'approved-nurse' | 'doctor' | 'admin' | 'nurse'
} = { scenario: 'base' }) {
  const sessionId = generateUUID()
  const healthWorker = await addTestHealthWorker(opts)
  await redis!.set(
    `S_${sessionId}`,
    JSON.stringify({
      data: { health_worker_id: healthWorker.id },
      _flash: {},
    }),
  )
  return { sessionId, healthWorker }
}

export function getFormValues($: cheerio.CheerioAPI): unknown {
  const formValues = {}
  $('form input,textarea').each((_i, el) => {
    if (!el.attribs.name) return
    if (el.attribs.type !== 'radio' || ('checked' in el.attribs)) {
      set(
        formValues,
        el.attribs.name,
        el.attribs.value ? parseParam(el.attribs.value) : null,
      )
    }
  })
  $('form select').each((_i, el) => {
    let value = null
    $(el).find('option[selected]').each((_i, option) => {
      value = option.attribs.value && parseParam(option.attribs.value)
    })
    if (el.attribs.name) {
      set(
        formValues,
        el.attribs.name,
        value,
      )
    }
  })
  return formValues
}

export function getFormDisplay($: cheerio.CheerioAPI): unknown {
  const formDisplay = {}
  $('form input,textarea').each((_i, el) => {
    if (el.attribs.type !== 'hidden' && el.attribs.name) {
      set(
        formDisplay,
        el.attribs.name,
        el.attribs.value ?? null,
      )
    }
  })
  $('form select').each((_i, el) => {
    $(el).find('option[selected]').each((_i, option) => {
      if (el.attribs.name) {
        set(
          formDisplay,
          el.attribs.name,
          $(option).text(),
        )
      }
    })
  })
  return formDisplay
}
