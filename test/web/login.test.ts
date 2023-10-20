import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'std/testing/bdd.ts'
import { redis } from '../../external-clients/redis.ts'
import db from '../../db/db.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import * as employee from '../../db/models/employment.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import {
  killWebServer,
  startWebServer,
  testHealthWorker,
  testRegistrationDetails,
} from './utilities.ts'
import sample from '../../util/sample.ts'
import { resetInTest } from '../../db/reset.ts'
import { GoogleTokens, HealthWorker } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'

describe('/login', { sanitizeResources: false }, () => {
  const PORT = '8002'
  const ROUTE = `https://localhost:${PORT}`
  let process: Deno.ChildProcess
  beforeAll(async () => {
    process = await startWebServer(PORT)
  })
  beforeEach(resetInTest)
  afterAll(async () => {
    await killWebServer(process)
    await db.destroy()
    await redis.flushdb()
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
    let sessionId: string
    let healthWorker: HealthWorker & GoogleTokens & { id: number }
    beforeEach(async () => {
      sessionId = generateUUID()
      healthWorker = await upsertWithGoogleCredentials(db, testHealthWorker())
      await redis.set(
        `S_${sessionId}`,
        JSON.stringify({
          data: { health_worker_id: healthWorker.id },
          _flash: {},
        }),
      )
    })

    it('doesn\'t allow unemployed access to /app', async () => {
      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })
      assert(!response.ok)
      response.body?.cancel()
    })

    it('allows admin access to /app', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'admin',
      }])

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
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
        health_worker_id: healthWorker.id,
        profession: 'doctor',
      }])

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${ROUTE}/app`, `should be in ${ROUTE}/app`)
      assert(
        (await response.text()).includes('My Patients'),
        'response should contain My Patients',
      )
    })

    it('redirects from /login to /app', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: sample(['admin', 'doctor', 'nurse']),
      }])

      const response = await fetch(`${ROUTE}/login`, {
        redirect: 'manual',
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })
      const redirectLocation = response.headers.get('location')
      assert(redirectLocation === '/app')
      response.body?.cancel()
    })

    it('redirects unregistered nurse to registration', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }])

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })
      assert(response.ok, 'should have returned ok')
      assert(
        response.url === `${ROUTE}/app/facilities/1/register?step=personal`,
        `should be in ${ROUTE}/app/facilities/1/register`,
      )
      assert(
        (await response.text()).includes('First Name'),
        'response should contain First Name',
      )
    })

    it('redirects unapproved nurse to /app/pending_approval', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(db, {
        registrationDetails: testRegistrationDetails({
          health_worker_id: healthWorker.id,
        }),
      })

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })
      assert(response.url === `${ROUTE}/app/pending_approval`)
      await response.text()
    })

    it('allows approved nurse access to /app', async () => {
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'admin',
      }, {
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(db, {
        registrationDetails: testRegistrationDetails({
          health_worker_id: healthWorker.id,
        }),
      })
      await details.approve(db, {
        approverId: admin.id,
        healthWorkerId: healthWorker.id,
      })

      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
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
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'admin',
      }, {
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(db, {
        registrationDetails: testRegistrationDetails({
          health_worker_id: healthWorker.id,
        }),
      })
      await details.approve(db, {
        approverId: admin.id,
        healthWorkerId: healthWorker.id,
      })
      let response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
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
          Cookie: `sessionId=${sessionId}`,
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
          Cookie: `sessionId=${sessionId}`,
        },
      })
      assert(response.ok)
      assert(response.url === `${ROUTE}/app/patients`)
      assert((await response.text()).includes('Add patient'))
    })

    it('allows user to go to and from the My Patients page', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'doctor',
      }])
      let response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })

      assert(response.ok)
      let pageContents = await response.text()
      assert(pageContents.includes('href="/app/patients"'))
      assert(pageContents.includes('My Patients'))

      response = await fetch(`${ROUTE}/app/patients`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
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
          Cookie: `sessionId=${sessionId}`,
        },
      })

      assert(response.ok)
      assert(response.url === `${ROUTE}/app`)
      await response.text()
    })

    it('allows user can go to calendar', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'doctor',
      }])
      const response = await fetch(`${ROUTE}/app`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })
      assert(response.ok, 'should have returned ok')
      const pageContents = await response.text()
      assert(pageContents.includes('href="/app/calendar"'))
      assert(pageContents.includes('Calendar'))
    })

    it('allows a health worker employed at a facility to view/approve its employees', async () => {
      const nurse = await upsertWithGoogleCredentials(db, testHealthWorker())
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())

      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'admin',
      }, {
        facility_id: 1,
        health_worker_id: nurse.id,
        profession: 'nurse',
      }, {
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'doctor',
      }])

      await nurse_registration_details.add(db, {
        registrationDetails: {
          health_worker_id: healthWorker.id,
          gender: 'female',
          national_id: '12345678A12',
          date_of_first_practice: '2020-01-01',
          ncz_registration_number: 'GN123456',
          mobile_number: '5555555555',
          national_id_media_id: null,
          ncz_registration_card_media_id: null,
          face_picture_media_id: null,
          approved_by: healthWorker.id,
        },
      })

      const response = await fetch(`${ROUTE}/app/employees`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })

      assert(response.ok)
      assert(response.redirected)
      assert(response.url === `${ROUTE}/app/facilities/1/employees`)
      const pageContents = await response.text()
      assert(
        pageContents.includes(
          `href="/app/facilities/1/health-workers/${healthWorker.id}"`,
        ),
      )
      assert(
        pageContents.includes(
          `href="/app/facilities/1/health-workers/${nurse.id}"`,
        ),
      )
    })

    it(`allows admin access to invite`, async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'admin',
      }])
      let response = await fetch(`${ROUTE}/app/facilities/1/employees`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })
      assert(response.ok)
      assert(response.url === `${ROUTE}/app/facilities/1/employees`)
      let pageContents = await response.text()
      assert(pageContents.includes('href="/app/facilities/1/employees/invite"'))

      response = await fetch(`${ROUTE}/app/facilities/1/employees/invite`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })

      assert(response.ok)
      assert(response.url === `${ROUTE}/app/facilities/1/employees/invite`)
      pageContents = await response.text()
      assert(pageContents.includes('Email'))
      assert(pageContents.includes('Profession'))
      assert(pageContents.includes('Invite'))
    })

    it('doesn\'t allow unemployed access to employees', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'doctor',
      }])
      const response = await fetch(`${ROUTE}/app/facilities/2/employees`, {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      })

      assertEquals(response.status, 403)
    })

    it('doesn\'t allow non-admin to invite page', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: healthWorker.id,
        profession: 'doctor',
      }])
      const employeesResponse = await fetch(
        `${ROUTE}/app/facilities/1/employees`,
        {
          headers: {
            Cookie: `sessionId=${sessionId}`,
          },
        },
      )

      assert(
        employeesResponse.ok,
        'user should still be able to access employees page',
      )
      assert(employeesResponse.url === `${ROUTE}/app/facilities/1/employees`)
      const pageContents = await employeesResponse.text()
      assert(
        !pageContents.includes('href="/app/facilities/1/employees/invite"'),
        'there shouldn\'t be a link to the invite page',
      )

      const invitesResponse = await fetch(
        `${ROUTE}/app/facilities/1/employees/invite`,
        {
          headers: {
            Cookie: `sessionId=${sessionId}`,
          },
        },
      )

      assertEquals(invitesResponse.status, 403)
    })
  })
})
