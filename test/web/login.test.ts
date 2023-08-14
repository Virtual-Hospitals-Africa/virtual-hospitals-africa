import { afterAll, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { redis } from '../../external-clients/redis.ts'
import db from '../../db/db.ts'
import { assert } from 'https://deno.land/std@0.190.0/testing/asserts.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import reset from "../../db/reset.ts";

describe('/login', () => {
  let server: Deno.ChildProcess
  beforeAll(() => {
    server = new Deno.Command("deno", {
      args: [
        "task",
        "start",
      ],
      env: {
        PORT: '8002',
      },
      stdin: 'null',
      stdout: 'null',
      stderr: 'null',
    }).spawn()

    // TODO use readLines to actually know the server has started when we see this line
    // Listening on https://localhost:8002/
    return new Promise((resolve) => setTimeout(resolve, 2000))
  })

  it("redirects to google if not already logged in", async () => {
    const response = await fetch('https://localhost:8002/login', { redirect: 'manual' })    
    const redirectLocation = response.headers.get('location')
    assert(redirectLocation)
    assert(redirectLocation.startsWith('https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Flogged-in'))
    await response.body?.cancel()
  })

  describe('when logged in', () => {
    beforeAll(async () => {
      await reset()
      const testHealthWorker = {
        name: "Test Health Worker",
        email: "test@healthworker.com",
        avatar_url: "https://lh3.googleusercontent.com/a/AAcHTtdCli8DiIjBkdb9TZL3W46MoxFPOy2Xuqkm345WiS446Ow=s96-c",
        gcal_appointments_calendar_id: "vjf3q6onfgnn83me7rf10fdcj4@group.calendar.google.com",
        gcal_availability_calendar_id: "fq5vbod94ihhherp9fad2tlaqk@group.calendar.google.com",
        access_token: "ya29.whateverlrkwlkawlk-tl2O85WA2QW_1Lf_P4lRqyAG4aUCIo0D18F",
        expires_in: 3599,
        refresh_token: "1//01_ao4e0Kf-uTCgYIARAAGAESNwF-L9IrQkmis6YBAP4NE7BWrI7ry1qSeotPA_DLMYW9yiGLUUsaOjy7rlUvYs2nL_BTFjuv",
        expires_at: "2023-07-25T19:20:45.123Z"
      }
      const upserted = await upsertWithGoogleCredentials(db, testHealthWorker)

      redis.set('S_123', JSON.stringify({
        data: upserted,
        _flash: {}
      }))
    })

    afterAll(() => db.destroy())

    it("redirects to /app", async () => {
      const response = await fetch('https://localhost:8002/login', { 
        redirect: "manual",
        headers: {
          cookie: 'sessionId=123'
        }
      })
      
      const redirectLocation = response.headers.get('location')
      assert(redirectLocation)
      console.log('redirectLocation', redirectLocation)
      // assert(redirectLocation.startsWith('https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Flogged-in'))
      if (response.body) response.body.cancel()
    })
  })
})
