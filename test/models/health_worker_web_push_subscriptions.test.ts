import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { health_worker_web_push_subscriptions } from '../../db/models/health_worker_web_push_subscriptions.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'

describe('db/models/health_worker_web_push_subscriptions.ts', () => {
  afterAll(() => db.destroy())
  it('upserts, lists, and deletes subscriptions by endpoint', async () => {
    const organization = await createTestOrganization(db)
    const health_worker = await addTestEmployee(db, {
      role: 'nurse',
      organization_id: organization.id,
    })
    const endpoint = 'https://push.example.test/subscription/1'

    const subscription = await health_worker_web_push_subscriptions.upsertForHealthWorker(
      db,
      {
        health_worker_id: health_worker.id,
        endpoint,
        p256dh: 'test-p256dh',
        auth: 'test-auth',
        user_agent: 'test-agent',
      },
    )

    assertEquals(subscription.endpoint, endpoint)
    assertEquals(subscription.health_worker_id, health_worker.id)

    const updated = await health_worker_web_push_subscriptions.upsertForHealthWorker(
      db,
      {
        health_worker_id: health_worker.id,
        endpoint,
        p256dh: 'updated-p256dh',
        auth: 'updated-auth',
      },
    )

    assertEquals(updated.id, subscription.id)
    assertEquals(updated.p256dh, 'updated-p256dh')
    assertEquals(updated.auth, 'updated-auth')
    assertEquals(updated.user_agent, null)

    const listed = await health_worker_web_push_subscriptions.listByHealthWorkerId(db, {
      health_worker_id: health_worker.id,
    })

    assertEquals(listed.length, 1)
    assertEquals(listed[0]?.endpoint, endpoint)

    await health_worker_web_push_subscriptions.deleteByEndpoint(db, { endpoint })

    assertEquals(
      await health_worker_web_push_subscriptions.listByHealthWorkerId(db, {
        health_worker_id: health_worker.id,
      }),
      [],
    )
  })
})
