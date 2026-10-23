import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { describeParallel, itParallel } from '../../_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../_helpers/organizations.ts'
import { route } from '../../_route.ts'
import generateUUID from '../../../util/uuid.ts'
import waitUntilTestServerUp from '../../_helpers/waitUntilTestServerUp.ts'

describeParallel('/app/messaging/employee/[employee_id]', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('shows a coming soon message without employee details', async () => {
    const target = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
    })
    const viewer = await addTestEmployeeWithSession(db, {
      role: 'doctor',
      organization_id: TEST_ORGANIZATION_UUIDS.ZA.hospital,
    })

    const $ = await viewer.fetchCheerio(`/app/messaging/employee/${target.health_worker.employee_id}`)
    assertEquals($('#employee-messaging-back').attr('aria-label'), 'Back')
    const placeholder = $('#employee-messaging-placeholder').text()
    assert(placeholder.includes('Coming soon'))
    assert(placeholder.includes('TODO'))
    assert(!placeholder.includes(target.health_worker.name))
    assert(!placeholder.includes(target.health_worker.email))
    assert(!$.html().includes(target.health_worker.email))
  })

  itParallel('rejects a missing employee and a non-uuid', async () => {
    const viewer = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
    })

    const missing = await viewer.fetch(`/app/messaging/employee/${generateUUID()}`, { redirect: 'manual' })
    assertEquals(missing.status, 404)
    await missing.body?.cancel()

    const invalid = await viewer.fetch('/app/messaging/employee/not-a-uuid', { redirect: 'manual' })
    assertEquals(invalid.status, 400)
    await invalid.body?.cancel()
  })

  itParallel('requires a signed-in health worker', async () => {
    const target = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
    })
    const response = await fetch(
      `${route}/app/messaging/employee/${target.health_worker.employee_id}`,
      { redirect: 'manual' },
    )
    assertEquals(response.status, 302)
    await response.body?.cancel()
  })
})
