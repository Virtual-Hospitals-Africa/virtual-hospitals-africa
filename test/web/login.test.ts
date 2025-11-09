import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import * as employment from '../../db/models/employment.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
import { addTestRegulatorWithSession } from '../_helpers/regulators.ts'
import { withTestOrganization } from '../_helpers/organizations.ts'
import { testHealthWorker } from '../_helpers/health_workers.ts'
import sample from '../../util/sample.ts'
import { route } from '../route.ts'
import { testNurseRegistrationDetails } from '../../mocks/testRegistrationDetails.ts'
import selfUrl from '../../util/selfUrl.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_worker_google_tokens.ts'

describe('/login', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  it('redirects to google if not already logged in', async () => {
    const response = await fetch(`${route}/login`, {
      redirect: 'manual',
    })
    const redirect_location = response.headers.get('location')
    assert(redirect_location, `Is self_url the issue? ${selfUrl()}`)
    assert(
      redirect_location.startsWith(
        'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Flocalhost%3A8005%2Flogged-in',
      ),
      redirect_location,
    )
    await response.body?.cancel()
  })

  describe('when logged in', () => {
    it("doesn't allow unemployed access to /app", async () => {
      const mock = await addTestEmployeeWithSession(db, { profession: 'none' })
      const response = await mock.fetch(`/app`, {
        headers: {
          accept: 'text/html',
        },
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
      assertEquals(
        response.url,
        `${route}/?warning=Could%20not%20locate%20your%20account.%20Please%20try%20logging%20in%20once%20more.%20If%20this%20issue%20persists%2C%20please%20contact%20your%20organization%27s%20administrator.`,
      )
      await response.body?.cancel()
    })

    it('allows admin access to /app', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'admin',
      })
      const $ = await mock.fetchCheerio(`${route}/app`)
      assert($.html().includes('Open Encounters'))
    })

    it('allows doctor access /app', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'doctor',
      })

      const response = await mock.fetch(`/app`)

      if (!response.ok) throw new Error(await response.text())
      assertEquals(
        response.url,
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/waiting_room`,
      )
      const page_contents = await response.text()
      assert(page_contents.includes('Open Encounters'))
    })

    it('allows regulator to access /regulator/[country]/pharmacies', async () => {
      const { fetchCheerio } = await addTestRegulatorWithSession(db)
      const $ = await fetchCheerio(`/regulator/ZW/pharmacies`)
      assertEquals($('h1').text(), 'Pharmacies')
    })

    it('redirects from /login to /app', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: sample(['admin', 'doctor', 'nurse']),
      })

      const response = await mock.fetch(`/login`, {
        redirect: 'manual',
      })
      const redirect_location = response.headers.get('location')
      assertEquals(redirect_location, '/app?from_login=true')
      return response.body?.cancel()
    })

    // TODO turn off SKIP_NURSE_REGISTRATION
    it.skip('redirects unregistered nurse to registration', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'nurse',
        registration_status: 'not started',
      })
      const response = await mock.fetch(`/app`)
      assertEquals(
        response.url,
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/register/personal`,
      )
      const page_contents = await response.text()
      assert(page_contents.includes('First Name'))
    })

    // TODO turn off SKIP_NURSE_REGISTRATION
    it.skip('redirects unapproved nurse to /app/pending_approval', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'nurse',
        specialty: 'primary care',
        registration_status: 'awaiting approval',
      })
      const response = await mock.fetch(`/app`)
      assertEquals(response.url, `${route}/app/pending_approval`)
      await response.text()
    })

    it('allows approved nurse access to /app', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'nurse',
        specialty: 'primary care',
        registration_status: 'approved',
      })
      const $ = await mock.fetchCheerio(`${route}/app`)
      assert($.html().includes('Open Encounters'))
    })

    it('starts in an empty waiting room with sidebar links', () =>
      withTestOrganization(db, async (organization_id) => {
        const mock = await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          specialty: 'primary care',
          registration_status: 'approved',
          organization_id,
        })

        const $ = await mock.fetchCheerio(`${route}/app`)
        const waiting_room_add_link = $(
          `form[action="/app/organizations/${organization_id}/patients/start-registration"] > button`,
        )
        assertEquals(
          waiting_room_add_link.first().text(),
          'Register patient',
        )

        const patients_link = $(
          `a[href="/app/organizations/${organization_id}/waiting_room"]`,
        )
        assert(patients_link.first().text().includes('Open Encounters'))

        const employees_link = $('a[href="/app/employees"]')
        assert(employees_link.first().text().includes('Employees'))

        const calendar_link = $('a[href="/app/calendar"]')
        assert(calendar_link.first().text().includes('Calendar'))

        const inventory_link = $(
          `a[href="/app/organizations/${organization_id}/inventory"]`,
        )
        assert(inventory_link.first().text().includes('Inventory'))

        const logout_link = $('a[href="/app/logout"]')
        assert(logout_link.first().text().includes('Log Out'))
      }))

    it('allows a health worker employed at a organization to view/approve its employees', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'admin',
      })
      const nurse = await upsertWithGoogleCredentials(db, testHealthWorker())
      const admin = await upsertWithGoogleCredentials(db, testHealthWorker())

      await employment.add(db, [{
        organization_id: '00000000-0000-0000-0000-000000000001',
        health_worker_id: nurse.id,
        profession: 'nurse',
      }, {
        organization_id: '00000000-0000-0000-0000-000000000001',
        health_worker_id: admin.id,
        profession: 'admin',
      }])

      const details = await testNurseRegistrationDetails(db, {
        health_worker_id: nurse.id,
      })

      await nurse_registration_details.add(db, details)

      const response = await mock.fetch(`/app/employees`)

      if (!response.ok) throw new Error(await response.text())
      assert(response.redirected)
      assertEquals(
        response.url,
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees`,
      )
      const page_contents = await response.text()
      assert(
        page_contents.includes(
          `href="/app/organizations/00000000-0000-0000-0000-000000000001/employees/${mock.health_worker.id}"`,
        ),
      )
      assert(
        page_contents.includes(
          `href="/app/organizations/00000000-0000-0000-0000-000000000001/employees/${nurse.id}"`,
        ),
      )
    })

    it(`allows admin access to invite`, async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'admin',
      })
      let response = await mock.fetch(
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees`,
      )
      if (!response.ok) {
        throw new Error(await response.text())
      }
      assertEquals(
        response.url,
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees`,
      )
      let page_contents = await response.text()
      assert(
        page_contents.includes(
          'href="/app/organizations/00000000-0000-0000-0000-000000000001/employees/invite"',
        ),
      )

      response = await mock.fetch(
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees/invite`,
      )

      if (!response.ok) throw new Error(await response.text())
      assertEquals(
        response.url,
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees/invite`,
      )
      page_contents = await response.text()
      assert(page_contents.includes('Email'))
      assert(page_contents.includes('Profession'))
      assert(page_contents.includes('Invite'))
    })

    it("doesn't allow access to employees if you are employed at a different organization", async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'doctor',
      })
      const response = await mock.fetch(
        `${route}/app/organizations/00000000-0000-0000-0000-000000000002/employees?expectedTestError=1`,
      )
      assertEquals(response.status, 403)
      await response.body?.cancel()
    })

    it("doesn't allow non-admin to invite page", async () => {
      const mock = await addTestEmployeeWithSession(db, {
        profession: 'doctor',
      })

      const employees_response = await mock.fetch(
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees`,
      )

      assert(
        employees_response.ok,
      )
      assert(
        employees_response.url ===
          `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees`,
      )
      const page_contents = await employees_response.text()
      assert(
        !page_contents.includes(
          'href="/app/organizations/00000000-0000-0000-0000-000000000001/employees/invite"',
        ),
      )

      const invites_response = await mock.fetch(
        `${route}/app/organizations/00000000-0000-0000-0000-000000000001/employees/invite?expectedTestError=1`,
      )

      assertEquals(invites_response.status, 403)
      await invites_response.body?.cancel()
    })
  })
})
