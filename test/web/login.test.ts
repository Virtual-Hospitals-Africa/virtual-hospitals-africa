import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as cheerio from 'cheerio'
import db from '../../db/db.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  withTestFacility,
} from './utilities.ts'
import sample from '../../util/sample.ts'
import { testHealthWorker, testRegistrationDetails } from '../mocks.ts'

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
    it("doesn't allow unemployed access to /app", async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assert(response.ok)
      assert(
        response.url ===
          `${route}/?warning=Could%20not%20locate%20your%20account.%20Please%20try%20logging%20in%20once%20more.%20If%20this%20issue%20persists%2C%20please%20contact%20your%20facility%27s%20administrator.`,
      )
    })

    it('allows admin access to /app', async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'admin',
      }])

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      if (!response.ok) throw new Error(await response.text())
      assertEquals(response.url, `${route}/app`)
      const pageContents = await response.text()
      assert(pageContents.includes('My Patients'))
    })

    it('allows doctor access /app', async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'doctor',
      }])

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      if (!response.ok) throw new Error(await response.text())
      assertEquals(response.url, `${route}/app`)
      const pageContents = await response.text()
      assert(pageContents.includes('My Patients'))
    })

    it('redirects from /login to /app', async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
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
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      if (!response.ok) throw new Error(await response.text())
      assertEquals(
        response.url,
        `${route}/app/facilities/1/register/personal`,
      )
      const pageContents = await response.text()
      assert(pageContents.includes('First Name'))
    })

    it('redirects unapproved nurse to /app/pending_approval', async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(
        db,
        await testRegistrationDetails(db, {
          health_worker_id: mock.healthWorker.id,
        }),
      )

      const response = await fetch(`${route}/app`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      assertEquals(response.url, `${route}/app/pending_approval`)
      await response.text()
    })

    it('allows approved nurse access to /app', async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())
      await employment.add(db, [{
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
        await testRegistrationDetails(db, {
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

      if (!response.ok) throw new Error(await response.text())
      assertEquals(response.url, `${route}/app`)
      const pageContents = await response.text()
      assert(pageContents.includes('My Patients'))
    })

    it('starts in an empty waiting room with sidebar links', () =>
      withTestFacility(db, async (facility_id) => {
        const mock = await addTestHealthWorkerWithSession(db)
        const admin = await upsertWithGoogleCredentials(db, testHealthWorker())
        await employment.add(db, [{
          facility_id,
          health_worker_id: admin.id,
          profession: 'admin',
        }, {
          facility_id,
          health_worker_id: mock.healthWorker.id,
          profession: 'nurse',
        }])
        await details.add(
          db,
          await testRegistrationDetails(db, {
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
        if (!response.ok) throw new Error(await response.text())
        const $ = cheerio.load(await response.text())

        const waiting_room_add_link = $(
          `a[href="/app/facilities/${facility_id}/waiting-room/add"]`,
        )
        assertEquals(waiting_room_add_link.first().text(), 'Add patient')

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
      }))

    it('allows a health worker employed at a facility to view/approve its employees', async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      const nurse = await upsertWithGoogleCredentials(db, testHealthWorker())
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())

      await employment.add(db, [{
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

      const details = await testRegistrationDetails(db, {
        health_worker_id: nurse.id,
      })

      await nurse_registration_details.add(db, details)

      const response = await fetch(`${route}/app/employees`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      if (!response.ok) throw new Error(await response.text())
      assert(response.redirected)
      assertEquals(response.url, `${route}/app/facilities/1/employees`)
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
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'admin',
      }])
      let response = await fetch(`${route}/app/facilities/1/employees`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
      assertEquals(response.url, `${route}/app/facilities/1/employees`)
      let pageContents = await response.text()
      assert(pageContents.includes('href="/app/facilities/1/employees/invite"'))

      response = await fetch(`${route}/app/facilities/1/employees/invite`, {
        headers: {
          Cookie: `sessionId=${mock.sessionId}`,
        },
      })

      if (!response.ok) throw new Error(await response.text())
      assertEquals(response.url, `${route}/app/facilities/1/employees/invite`)
      pageContents = await response.text()
      assert(pageContents.includes('Email'))
      assert(pageContents.includes('Profession'))
      assert(pageContents.includes('Invite'))
    })

    it("doesn't allow unemployed access to employees", async () => {
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
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
      const mock = await addTestHealthWorkerWithSession(db)
      await employment.add(db, [{
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
      )
      assert(employeesResponse.url === `${route}/app/facilities/1/employees`)
      const pageContents = await employeesResponse.text()
      assert(
        !pageContents.includes('href="/app/facilities/1/employees/invite"'),
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
