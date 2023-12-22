import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as cheerio from 'cheerio'
import db from '../../db/db.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import * as employee from '../../db/models/employment.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from './utilities.ts'
import sample from '../../util/sample.ts'
import { GoogleTokens, HealthWorker } from '../../types.ts'
import {
  insertTestAddress,
  randomNationalId,
  testHealthWorker,
  testRegistrationDetails,
} from '../mocks.ts'

describeWithWebServer('/login', 8002, (route) => {
  it('redirects to google if not already logged in', async () => {
    const response = await fetch(`${route}/login`, {
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
    let mock: {
      sessionId: string
      healthWorker: HealthWorker & GoogleTokens & { id: number }
    }
    beforeEach(async () => {
      mock = await addTestHealthWorkerWithSession()
    })

    it("doesn't allow unemployed access to /app", async () => {
      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assert(!response.ok)
      response.body?.cancel()
    })

    it('allows admin access to /app', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'admin',
      }])

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assert(response.ok, 'should have returned ok')
      assert(response.url === `${route}/app`, `should be in ${route}/app`)
      assert(
        (await response.text()).includes('My Patients'),
        'response should contain My Patients',
      )
    })

    it('allows doctor access /app', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'doctor',
      }])

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${route}/app`, `should be in ${route}/app`)
      assert(
        (await response.text()).includes('My Patients'),
        'response should contain My Patients',
      )
    })

    it('redirects from /login to /app', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: sample(['admin', 'doctor', 'nurse']),
      }])

      const response = await fetch(`${route}/login`, {
        redirect: 'manual',
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      const redirectLocation = response.headers.get('location')
      assert(redirectLocation === '/app')
      response.body?.cancel()
    })

    it('redirects unregistered nurse to registration', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assert(response.ok, 'should have returned ok')
      assert(
        response.url === `${route}/app/facilities/1/register?step=personal`,
        `should be in ${route}/app/facilities/1/register`,
      )
      assert(
        (await response.text()).includes('First Name'),
        'response should contain First Name',
      )
    })

    it('redirects unapproved nurse to /app/pending_approval', async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(
        db,
        await testRegistrationDetails({
          health_worker_id: mock.healthWorker.id,
        }),
      )

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assert(response.url === `${route}/app/pending_approval`)
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
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(
        db,
        await testRegistrationDetails({
          health_worker_id: mock.healthWorker.id,
        }),
      )
      await details.approve(db, {
        approverId: admin.id,
        healthWorkerId: mock.healthWorker.id,
      })

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      assert(response.ok, 'should have returned ok')
      assert(response.url === `${route}/app`, `should be in ${route}/app`)
      assert(
        (await response.text()).includes('My Patients'),
        'response should contain My Patients',
      )
    })

    it('starts in an empty waiting room with sidebar links', async () => {
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'admin',
      }, {
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(
        db,
        await testRegistrationDetails({
          health_worker_id: mock.healthWorker.id,
        }),
      )
      await details.approve(db, {
        approverId: admin.id,
        healthWorkerId: mock.healthWorker.id,
      })
      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assert(response.ok, 'should have returned ok')
      const $ = cheerio.load(await response.text())

      const waiting_room_add_link = $(
        'a[href="/app/facilities/1/waiting-room/add"]',
      )
      assert(waiting_room_add_link.first().text().includes('Add patient'))

      const patients_link = $('a[href="/app/patients"]')
      assert(patients_link.first().text().includes('My Patients'))

      const employees_link = $('a[href="/app/employees"]')
      assert(employees_link.first().text().includes('Employees'))

      const calendar_link = $('a[href="/app/calendar"]')
      assert(calendar_link.first().text().includes('Calendar'))

      const dispensary_link = $('a[href="/app/dispensary"]')
      assert(dispensary_link.first().text().includes('Dispensary'))

      const logout_link = $('a[href="/logout"]')
      assert(logout_link.first().text().includes('Log Out'))
    })

    it('allows a health worker employed at a facility to view/approve its employees', async () => {
      const nurse = await upsertWithGoogleCredentials(db, testHealthWorker())
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())

      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'admin',
      }, {
        facility_id: 1,
        health_worker_id: nurse.id,
        profession: 'nurse',
      }, {
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'admin',
      }])

      const nurse_address = await insertTestAddress()
      assert(nurse_address)

      await nurse_registration_details.add(db, {
        health_worker_id: nurse.id,
        gender: 'female',
        national_id_number: randomNationalId(),
        date_of_first_practice: '2020-01-01',
        ncz_registration_number: 'GN123456',
        mobile_number: '5555555555',
        national_id_media_id: null,
        ncz_registration_card_media_id: null,
        face_picture_media_id: null,
        nurse_practicing_cert_media_id: null,
        approved_by: admin.id,
        date_of_birth: '2020-01-01',
        address_id: nurse_address.id,
      })

      const response = await fetch(`${route}/app/employees`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      assert(response.ok)
      assert(response.redirected)
      assert(response.url === `${route}/app/facilities/1/employees`)
      const pageContents = await response.text()
      assert(
        pageContents.includes(
          `href="/app/facilities/1/employees/${mock.healthWorker.id}"`,
        ),
      )
      assert(
        pageContents.includes(
          `href="/app/facilities/1/employees/${nurse.id}"`,
        ),
      )
    })

    it(`allows admin access to invite`, async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'admin',
      }])
      let response = await fetch(`${route}/app/facilities/1/employees`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assert(response.ok)
      assert(response.url === `${route}/app/facilities/1/employees`)
      let pageContents = await response.text()
      assert(pageContents.includes('href="/app/facilities/1/employees/invite"'))

      response = await fetch(`${route}/app/facilities/1/employees/invite`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      assert(response.ok)
      assert(response.url === `${route}/app/facilities/1/employees/invite`)
      pageContents = await response.text()
      assert(pageContents.includes('Email'))
      assert(pageContents.includes('Profession'))
      assert(pageContents.includes('Invite'))
    })

    it("doesn't allow unemployed access to employees", async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'doctor',
      }])
      const response = await fetch(`${route}/app/facilities/2/employees`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      assertEquals(response.status, 403)
    })

    it("doesn't allow non-admin to invite page", async () => {
      await employee.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'doctor',
      }])
      const employeesResponse = await fetch(
        `${route}/app/facilities/1/employees`,
        {
          headers: {
            Cookie: `sessionId=${mock.sessionId}`,
          },
        },
      )

      assert(
        employeesResponse.ok,
        'user should still be able to access employees page',
      )
      assert(employeesResponse.url === `${route}/app/facilities/1/employees`)
      const pageContents = await employeesResponse.text()
      assert(
        !pageContents.includes('href="/app/facilities/1/employees/invite"'),
        "there shouldn't be a link to the invite page",
      )

      const invitesResponse = await fetch(
        `${route}/app/facilities/1/employees/invite`,
        {
          headers: {
            Cookie: `sessionId=${mock.sessionId}`,
          },
        },
      )

      assertEquals(invitesResponse.status, 403)
    })
  })
})
