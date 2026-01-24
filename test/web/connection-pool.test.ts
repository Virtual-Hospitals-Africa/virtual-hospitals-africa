import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'
import { route } from '../_route.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'

describeParallel('Connection Pool Management', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('returns connections to pool after failed POST requests', async () => {
    const mock = await addTestEmployeeWithSession(db, {
      profession: 'admin',
    })

    const failing_requests = Array.from({ length: 150 }, () =>
      mock.fetch(`${route}/app/test-always-fails`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      }))

    const failing_results = await Promise.all(failing_requests)

    // All requests should complete (even though they fail)
    failing_results.forEach((response) => {
      assertEquals(response.status, 500)
    })

    // Cancel all response bodies
    await Promise.all(failing_results.map((r) => r.body?.cancel()))

    // Now make a successful request - this will hang if connections weren't returned
    const success_response = await mock.fetch(`${route}/app/test-always-passes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    assertEquals(success_response.status, 200)
    const text = await success_response.text()
    assertEquals(text, 'OK')
  })

  itParallel('returns connections to pool after GET requests through middleware', async () => {
    const organization = await createTestOrganization(db)
    const mock = await addTestEmployeeWithSession(db, {
      profession: 'admin',
      organization_id: organization.id,
    })

    // Fire concurrent GET requests to /app which goes through middleware
    // The middleware calls sessions.tickUpdatedAt(db, session_id)
    // If attachTrx doesn't properly manage connections, they will leak
    const requests = Array.from({ length: 150 }, () =>
      mock.fetch(`${route}/app`, {
        headers: {
          'accept': 'text/html',
        },
      }))

    const results = await Promise.all(requests)

    // All requests should complete successfully
    results.forEach((response) => {
      assertEquals(response.status, 200)
    })

    // Cancel all response bodies
    await Promise.all(results.map((r) => r.body?.cancel()))

    // Make one more request - this will hang if connections leaked
    const final_response = await mock.fetch(`${route}/app`, {
      headers: {
        'accept': 'text/html',
      },
    })

    assertEquals(final_response.status, 200)
    await final_response.body?.cancel()
  })
})
