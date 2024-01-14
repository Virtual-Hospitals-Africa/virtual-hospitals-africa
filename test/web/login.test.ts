import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as cheerio from 'cheerio'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import * as employee from '../../db/models/employment.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  itUsesTrxAnd,
} from './utilities.ts'
import sample from '../../util/sample.ts'
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
    itUsesTrxAnd("doesn't allow unemployed access to /app", async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
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

    itUsesTrxAnd('allows admin access to /app', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
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

    itUsesTrxAnd('allows doctor access /app', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
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

    itUsesTrxAnd('redirects from /login to /app', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
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

    itUsesTrxAnd('redirects unregistered nurse to registration', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
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

    itUsesTrxAnd('redirects unapproved nurse to /app/pending_approval', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(
        trx,
        await testRegistrationDetails(trx, {
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

    itUsesTrxAnd('allows approved nurse access to /app', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      const admin = await upsertWithGoogleCredentials(trx, testHealthWorker())
      await employee.add(trx, [{
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'admin',
      }, {
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(
        trx,
        await testRegistrationDetails(trx, {
          health_worker_id: mock.healthWorker.id,
        }),
      )
      await details.approve(trx, {
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

    itUsesTrxAnd('starts in an empty waiting room with sidebar links', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      const admin = await upsertWithGoogleCredentials(trx, testHealthWorker())
      await employee.add(trx, [{
        facility_id: 1,
        health_worker_id: admin.id,
        profession: 'admin',
      }, {
        facility_id: 1,
        health_worker_id: mock.healthWorker.id,
        profession: 'nurse',
      }])
      await details.add(
        trx,
        await testRegistrationDetails(trx, {
          health_worker_id: mock.healthWorker.id,
        }),
      )
      await details.approve(trx, {
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

    itUsesTrxAnd('allows a health worker employed at a facility to view/approve its employees', async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      const nurse = await upsertWithGoogleCredentials(trx, testHealthWorker())
      const admin = await upsertWithGoogleCredentials(trx, testHealthWorker())

      await employee.add(trx, [{
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

      const nurse_address = await insertTestAddress(trx)
      assert(nurse_address)

      await nurse_registration_details.add(trx, {
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

    itUsesTrxAnd(`allows admin access to invite`, async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
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

    itUsesTrxAnd("doesn't allow unemployed access to employees", async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
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

    itUsesTrxAnd("doesn't allow non-admin to invite page", async (trx) => {
      const mock = await addTestHealthWorkerWithSession(trx)
      await employee.add(trx, [{
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
