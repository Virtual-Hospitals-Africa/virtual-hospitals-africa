import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'
import sample from '../../util/sample.ts'
import { port, route } from '../_route.ts'
import selfUrl from '../../util/selfUrl.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
import assertIncludes from '../../util/assertIncludes.ts'

describeParallel('/login', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  itParallel('redirects to google if not already logged in', async () => {
    const response = await fetch(`${route}/login`, {
      redirect: 'manual',
    })
    const redirect_location = response.headers.get('location')
    assert(redirect_location, `Is self_url the issue? ${selfUrl()}`)
    assert(
      redirect_location.startsWith(
        `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Flocalhost%3A${port}%2Flogged-in`,
      ),
      redirect_location,
    )
    await response.body?.cancel()
  })

  describeParallel('when logged in', () => {
    itParallel("doesn't allow unemployed access to /app", async () => {
      const mock = await addTestEmployeeWithSession(db, { role: 'none' })
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

    itParallel('allows admin access to /app', async () => {
      const organization = await createTestOrganization(db)
      const mock = await addTestEmployeeWithSession(db, {
        role: 'admin',
        organization_id: organization.id,
      })
      const $ = await mock.fetchCheerio(`${route}/app`)
      assert($.html().includes('Open Encounters'))
    })

    itParallel('allows doctor access /app', async () => {
      const organization = await createTestOrganization(db)
      const mock = await addTestEmployeeWithSession(db, {
        role: 'doctor',
        organization_id: organization.id,
      })

      const response = await mock.fetch(`/app`)

      if (!response.ok) throw new Error(await response.text())
      assertEquals(
        response.url,
        `${route}/app/organizations/${organization.id}/waiting_room`,
      )
      const page_contents = await response.text()
      assert(page_contents.includes('Open Encounters'))
    })

    itParallel('redirects from /login to /app', async () => {
      const mock = await addTestEmployeeWithSession(db, {
        role: sample(['admin', 'doctor', 'nurse']),
      })

      const response = await mock.fetch(`/login`, {
        redirect: 'manual',
      })
      const redirect_location = response.headers.get('location')
      assertEquals(redirect_location, '/app?from_login=true')
      return response.body?.cancel()
    })

    itParallel('allows approved nurse access to /app', async () => {
      const organization = await createTestOrganization(db)
      const mock = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        specialty: 'Primary care',

        organization_id: organization.id,
      })
      const $ = await mock.fetchCheerio(`${route}/app`)
      assert($.html().includes('Open Encounters'))
    })

    itParallel(
      'starts in an empty waiting room with sidebar links for a nurse',
      async () => {
        const organization = await createTestOrganization(db)
        const mock = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          specialty: 'Primary care',
          organization_id: organization.id,
        })

        const $ = await mock.fetchCheerio(`${route}/app`)

        const waiting_room_add_link = $(
          `form[action="/app/organizations/${organization.id}/patients/start-registration"] > button`,
        )
        assertIncludes(
          waiting_room_add_link.first().text(),
          'Register patient',
        )

        const patients_link = $(
          `a[href="/app/organizations/${organization.id}/waiting_room"]`,
        )
        assert(patients_link.first().text().includes('Open Encounters'))

        const employees_link = $('a[href="/app/employees"]')
        assert(employees_link.first().text().includes('Employees'))

        const calendar_link = $('a[href="/app/calendar"]')
        assert(calendar_link.first().text().includes('Calendar'))

        const inventory_link = $(
          `a[href="/app/organizations/${organization.id}/inventory"]`,
        )
        assert(inventory_link.first().text().includes('Inventory'))

        const logout_link = $('a[href="/app/logout"]')
        assert(logout_link.first().text().includes('Log Out'))
      },
    )

    itParallel(
      'starts in an empty waiting room with a start-registration link for a receptionist',
      async () => {
        const organization = await createTestOrganization(db)
        const mock = await addTestEmployeeWithSession(db, {
          role: 'receptionist',
          organization_id: organization.id,
        })

        const $ = await mock.fetchCheerio(`${route}/app`)

        const waiting_room_add_link = $(
          `form[action="/app/organizations/${organization.id}/patients/start-registration"] > button`,
        )
        assertIncludes(
          waiting_room_add_link.first().text(),
          'Register patient',
        )
      },
    )

    itParallel(
      "doesn't allow access to employees if you are employed at a different organization",
      async () => {
        const mock = await addTestEmployeeWithSession(db, {
          role: 'doctor',
        })
        const response = await mock.fetch(
          `${route}/app/organizations/00000000-0000-1000-8000-000000000002/employees?expectedTestError=1`,
        )
        assertEquals(response.status, 403)
        await response.body?.cancel()
      },
    )
  })
})
