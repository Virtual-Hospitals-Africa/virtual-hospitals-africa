import { afterAll, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { redis } from '../../external-clients/redis.ts'
import db from '../../db/db.ts'
import { assert } from 'https://deno.land/std@0.190.0/testing/asserts.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import { readLines } from 'https://deno.land/std@0.140.0/io/buffer.ts'
import { readerFromStreamReader } from 'https://deno.land/std@0.140.0/streams/conversion.ts'
import * as employee from '../../db/models/employment.ts'

describe('/login', () => {
  const PORT = '8002'
  const ROUTE = `https://localhost:${PORT}`

  const testHealthWorker = {
    name: 'Test Health Worker',
    email: 'test@healthworker.com',
    avatar_url:
      'https://lh3.googleusercontent.com/a/AAcHTtdCli8DiIjBkdb9TZL3W46MoxFPOy2Xuqkm345WiS446Ow=s96-c',
    gcal_appointments_calendar_id:
      'vjf3q6onfgnn83me7rf10fdcj4@group.calendar.google.com',
    gcal_availability_calendar_id:
      'fq5vbod94ihhherp9fad2tlaqk@group.calendar.google.com',
    access_token: 'ya29.whateverlrkwlkawlk-tl2O85WA2QW_1Lf_P4lRqyAG4aUCIo0D18F',
    expires_in: 3599,
    refresh_token:
      '1//01_ao4e0Kf-uTCgYIARAAGAESNwF-L9IrQkmis6YBAP4NE7BWrI7ry1qSeotPA_DLMYW9yiGLUUsaOjy7rlUvYs2nL_BTFjuv',
    expires_at: '2023-07-25T19:20:45.123Z',
  }

  let process: Deno.ChildProcess
  beforeAll(async () => {
    await dbWipeThenLatest()
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
      if (Date.now() > ___timeout___ + 20000) {
        stdout.releaseLock()
        await process.stdout.cancel()
        throw new Error('hung process')
      }
      line = (await lineReader.next()).value
    } while (line !== `Listening on ${ROUTE}/`)
    stdout.releaseLock()
  })
  afterAll(async () => {
    await process.stdout.cancel()
    process.kill()
  })

  it('redirects to google if not already logged in', async () => {
    const response = await fetch(`${ROUTE}/login`, {
      redirect: 'manual',
    })
    const redirectLocation = response.headers.get('location')
    assert(redirectLocation)
    assert(
      redirectLocation.startsWith(
        'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Flogged-in',
      ),
    )
    await response.body?.cancel()
  })

  describe('when logged in', () => {
    beforeAll(async () => {
      const upserted = await upsertWithGoogleCredentials(db, testHealthWorker)
      await redis.set(
        'S_123',
        JSON.stringify({
          data: upserted,
          _flash: {},
        }),
      )
    })

    afterAll(() => db.destroy())

    it('redirects to /app', async () => {
      const response = await fetch(`${ROUTE}/login`, {
        redirect: 'manual',
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      const redirectLocation = response.headers.get('location')
      assert(redirectLocation === '/app')
      response.body?.cancel()
    })

    it('unemployed is unauthorized', async () => {
      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(!response.ok)
      response.body?.cancel()
    })

    it('unregistered nurse is redirected to registration', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: 1,
        profession: 'nurse',
      }])

      await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      }).then((response) => {
        assert(response.ok)
        assert(
          response.text().then((text) => {
            text.includes('Personal')
          }),
        )
      })
    })
  })
})

async function dbWipeThenLatest() {
  await new Deno.Command('deno', {
    args: [
      'task',
      'db:migrate:wipe',
    ],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  }).output()

  await new Deno.Command('deno', {
    args: [
      'task',
      'db:migrate:latest',
    ],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  }).output()
}
