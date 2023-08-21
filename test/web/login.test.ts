import { afterAll, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { redis } from '../../external-clients/redis.ts'
import db from '../../db/db.ts'
import { assert } from 'std/testing/asserts.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import * as employee from '../../db/models/employment.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import {
  cleanUpWebServer,
  dbWipeThenLatest,
  startWebServer,
  testHealthWorker,
  testRegistrationDetails,
} from './utilities.ts'

describe('/login', () => {
  const PORT = '8002'
  const ROUTE = `https://localhost:${PORT}`
  let process: Deno.ChildProcess
  beforeAll(async () => {
    await dbWipeThenLatest()
    process = await startWebServer(PORT)
  })
  afterAll(async () => {
    await cleanUpWebServer(process)
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

    it('doesn\'t allow unemployed access to /app', async () => {
      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(!response.ok)
      response.body?.cancel()
    })

    it('allows admin access to /app', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: 1,
        profession: 'admin',
      }])

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok, 'should have returned ok')
      assert(response.url === `${ROUTE}/app`, `should be in ${ROUTE}/app`)
      assert(
        (await response.text()).includes('My Patients'),
        'response should contain My Patients',
      )
    })

    it('allows doctor access /app', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: 1,
        profession: 'doctor',
      }])

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${ROUTE}/app`, `should be in ${ROUTE}/app`)
      assert(
        (await response.text()).includes('My Patients'),
        'response should contain My Patients',
      )
    })

    it('redirects unregistered nurse to registration', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: 1,
        profession: 'nurse',
      }])

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok, 'should have returned ok')
      assert(
        response.url === `${ROUTE}/app/facilities/1/register`,
        `should be in ${ROUTE}/app/facilities/1/register`,
      )
      assert(
        (await response.text()).includes('First Name'),
        'response should contain First Name',
      )
    })

    it('redirects unapproved nurse to /app/pending-approval', async () => {
      await details.add(db, { registrationDetails: testRegistrationDetails })

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.url === `${ROUTE}/app/pending-approval`)
      await response.text()
    })

    it('allows approvoed nurse access to /app', async () => {
      await details.approve(db, {
        approverId: 1,
        healthWorkerId: 1,
      })

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${ROUTE}/app`, `should be in ${ROUTE}/app`)
      assert(
        (await response.text()).includes('My Patients'),
        'response should contain My Patients',
      )
    })

    it('allows user to go to and from the add patient page', async () => {
      let response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok, 'should have returned ok')
      let pageContents = await response.text()
      assert(
        pageContents.includes('href="/app/patients/add"'),
        'should include a href to patient screen',
      )
      assert(
        pageContents.includes('Add patient'),
        'should include text Add patient',
      )

      response = await fetch(`${ROUTE}/app/patients/add`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok, 'should have returned ok')
      assert(response.url === `${ROUTE}/app/patients/add`)
      pageContents = await response.text()
      assert(pageContents.includes('Next Step'), 'should include Next Step')
      assert(
        pageContents.includes('href="/app/patients"'),
        'should be a link back to patients screen',
      )

      response = await fetch(`${ROUTE}/app/patients`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok)
      assert(response.url === `${ROUTE}/app/patients`)
      assert((await response.text()).includes('Add patient'))
    })

    it('allows user to go to and from the My Patients page', async () => {
      let response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok)
      let pageContents = await response.text()
      assert(pageContents.includes('href="/app/patients"'))
      assert(pageContents.includes('My Patients'))

      response = await fetch(`${ROUTE}/app/patients`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok)
      assert(response.url === `${ROUTE}/app/patients`)
      pageContents = await response.text()
      assert(pageContents.includes('Patients'))
      assert(pageContents.includes('Add patient'))
      assert(pageContents.includes('href="/app"'))

      response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok)
      assert(response.url === `${ROUTE}/app`)
      await response.text()
    })

    it('allows user can go to calendar', async () => {
      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok, 'should have returned ok')
      const pageContents = await response.text()
      assert(pageContents.includes('href="/app/calendar"'))
      assert(pageContents.includes('Calendar'))
    })

    it('allows user can go to and from employees table screen', async () => {
      let response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok)
      let pageContents = await response.text()
      assert(pageContents.includes('href="/app/employees"'))

      response = await fetch(`${ROUTE}/app/employees`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok)
      assert(response.redirected)
      assert(response.url === `${ROUTE}/app/facilities/1/employees`)
      pageContents = await response.text()
      assert(pageContents.includes('href="/app"'))

      response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok)
      assert(response.url === `${ROUTE}/app`)
      await response.text()
    })

    it(`allows admin access to invite, `, async () => {
      let response = await fetch(`${ROUTE}/app/facilities/1/employees`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })
      assert(response.ok)
      assert(response.url === `${ROUTE}/app/facilities/1/employees`)
      let pageContents = await response.text()
      assert(pageContents.includes('href="/app/facilities/1/employees/invite"'))

      response = await fetch(`${ROUTE}/app/facilities/1/employees/invite`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok)
      assert(response.url === `${ROUTE}/app/facilities/1/employees/invite`)
      pageContents = await response.text()
      assert(pageContents.includes('Email'))
      assert(pageContents.includes('Profession'))
      assert(pageContents.includes('Invite'))
    })

    it('doesn\'t allow unemployed access to employees, redirecting back to app', async () => {
      const response = await fetch(`${ROUTE}/app/facilities/2/employees`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.redirected)
      assert(response.url === `${ROUTE}/app`)
      await response.text()
    })

    it('doesn\'t allow non-admin to invite page', async () => {
      await db
        .deleteFrom('employment')
        .where('health_worker_id', '=', 1)
        .where('profession', '=', 'admin')
        .execute()

      let response = await fetch(`${ROUTE}/app/facilities/1/employees`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(response.ok, 'user should still be able to access employees page')
      assert(response.url === `${ROUTE}/app/facilities/1/employees`)
      const pageContents = await response.text()
      assert(
        !pageContents.includes('href="/app/facilities/1/employees/invite"'),
        'there shouldn\'t be a link to the invite page',
      )

      response = await fetch(`${ROUTE}/app/facilities/1/employees/invite`, {
        headers: {
          Cookie: 'sessionId=123',
        },
      })

      assert(!response.ok, 'shouldn\'t be able to access invite page')
      await response.text()
    })
  })
})
