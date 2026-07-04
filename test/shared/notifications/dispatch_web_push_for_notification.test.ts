import { afterAll, afterEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { type Stub, stub } from 'std/testing/mock.ts'
import db from '../../../db/db.ts'
import { notifications } from '../../../db/models/notifications.ts'
import { health_worker_web_push_subscriptions } from '../../../db/models/health_worker_web_push_subscriptions.ts'
import { dispatchWebPushForNotification, type DispatchWebPushForNotificationDeps } from '../../../backend/notifications/dispatch_web_push_for_notification.ts'
import type { SendWebPushNotificationResult, WebPushNotificationPayload, WebPushSubscriptionInput } from '../../../external-clients/web-push.ts'
import { addTestEmployee } from '../../_helpers/employees.ts'
import generateUUID from '../../../util/uuid.ts'

type SendWebPushCall = WebPushSubscriptionInput & { payload: WebPushNotificationPayload }

function createSendMock(
  handler: (call: SendWebPushCall) => Promise<SendWebPushNotificationResult> | SendWebPushNotificationResult,
) {
  const calls: SendWebPushCall[] = []
  const sendWebPushNotification = async (call: SendWebPushCall) => {
    calls.push(call)
    return await handler(call)
  }
  const deps: DispatchWebPushForNotificationDeps = { sendWebPushNotification }
  return { calls, deps }
}

async function insertTestNotification(
  health_worker_id: string,
  {
    action_href = '/app/patients/123',
    notification_type = 'test',
  }: {
    action_href?: string
    notification_type?: string
  } = {},
) {
  return await notifications.insert(db, {
    health_worker_id,
    title: 'Web push title',
    description: 'Web push description',
    avatar_url: '/images/test.svg',
    table_name: 'patient_encounters',
    row_id: generateUUID(),
    notification_type,
    action_title: 'View',
    action_href,
  })
}

async function insertTestSubscription(health_worker_id: string, endpoint: string) {
  return await health_worker_web_push_subscriptions.upsertForHealthWorker(db, {
    health_worker_id,
    endpoint,
    p256dh: 'test-p256dh',
    auth: 'test-auth',
  })
}

describe('backend/notifications/dispatch_web_push_for_notification.ts', () => {
  afterAll(() => db.destroy())

  describe('dispatchWebPushForNotification', () => {
    let log_error: Stub | undefined

    afterEach(() => {
      log_error?.restore()
      log_error = undefined
    })

    it('sends a mapped payload to one subscription', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id, {
        action_href: '/app/custom',
        notification_type: 'encounter_update',
      })
      await insertTestSubscription(health_worker.id, 'https://push.example.test/one')

      const { calls, deps } = createSendMock(() => ({ ok: true }))
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(calls.length, 1)
      let payload: WebPushNotificationPayload | undefined
      for (const call of calls) {
        payload = call.payload
      }
      assertEquals(payload, {
        title: 'Web push title',
        body: 'Web push description',
        url: '/app/notifications',
        action_href: '/app/custom',
        notification_id,
        notification_type: 'encounter_update',
      })
    })

    it('attempts delivery to every subscription', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id)
      await insertTestSubscription(health_worker.id, 'https://push.example.test/a')
      await insertTestSubscription(health_worker.id, 'https://push.example.test/b')

      const { calls, deps } = createSendMock(() => ({ ok: true }))
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(calls.length, 2)
      assertEquals(
        calls.map((call) => call.endpoint).sort(),
        ['https://push.example.test/a', 'https://push.example.test/b'],
      )
    })

    it('returns safely when there are no subscriptions', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id)

      const { calls, deps } = createSendMock(() => ({ ok: true }))
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(calls.length, 0)
    })

    it('returns safely when the notification does not exist', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })

      const { calls, deps } = createSendMock(() => ({ ok: true }))
      await dispatchWebPushForNotification({
        notification_id: generateUUID(),
        health_worker_id: health_worker.id,
      }, deps)

      assertEquals(calls.length, 0)
    })

    it('returns safely when the notification belongs to a different health worker', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const other_health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id)
      log_error = stub(console, 'error')

      const { calls, deps } = createSendMock(() => ({ ok: true }))
      await dispatchWebPushForNotification({
        notification_id,
        health_worker_id: other_health_worker.id,
      }, deps)

      assertEquals(calls.length, 0)
      assertEquals(log_error.calls.length, 1)
    })

    it('omits action_href when it is #todo', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id, {
        action_href: '#todo',
      })
      await insertTestSubscription(health_worker.id, 'https://push.example.test/todo')

      const { calls, deps } = createSendMock(() => ({ ok: true }))
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(calls.length, 1)
      for (const call of calls) {
        assertEquals(call.payload.url, '/app/notifications')
        assertEquals('action_href' in call.payload, false)
      }
    })

    it('omits action_href when it is empty', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id, {
        action_href: '',
      })
      await insertTestSubscription(health_worker.id, 'https://push.example.test/empty')

      const { calls, deps } = createSendMock(() => ({ ok: true }))
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(calls.length, 1)
      for (const call of calls) {
        assertEquals(call.payload.url, '/app/notifications')
        assertEquals('action_href' in call.payload, false)
      }
    })

    it('deletes expired subscriptions', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id)
      const endpoint = 'https://push.example.test/expired'
      await insertTestSubscription(health_worker.id, endpoint)

      const { deps } = createSendMock(() => ({
        ok: false,
        expired_subscription: true,
        error: new Error('gone'),
      }))
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(
        await health_worker_web_push_subscriptions.listByHealthWorkerId(db, {
          health_worker_id: health_worker.id,
        }),
        [],
      )
    })

    it('logs non-expired failures without deleting the subscription', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id)
      const endpoint = 'https://push.example.test/failed'
      await insertTestSubscription(health_worker.id, endpoint)
      log_error = stub(console, 'error')

      const { deps } = createSendMock(() => ({
        ok: false,
        expired_subscription: false,
        error: new Error('temporary failure'),
      }))
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(log_error.calls.length, 1)
      assertEquals(
        await health_worker_web_push_subscriptions.listByHealthWorkerId(db, {
          health_worker_id: health_worker.id,
        }).then((rows) => rows.map((row) => row.endpoint)),
        [endpoint],
      )
    })

    it('still attempts other subscriptions when one send throws unexpectedly', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse' })
      const { id: notification_id } = await insertTestNotification(health_worker.id)
      await insertTestSubscription(health_worker.id, 'https://push.example.test/throws')
      await insertTestSubscription(health_worker.id, 'https://push.example.test/ok')
      log_error = stub(console, 'error')

      const { calls, deps } = createSendMock((call) => {
        if (call.endpoint === 'https://push.example.test/throws') {
          throw new Error('unexpected send failure')
        }
        return { ok: true }
      })
      await dispatchWebPushForNotification({ notification_id, health_worker_id: health_worker.id }, deps)

      assertEquals(calls.length, 2)
      assertEquals(log_error.calls.length, 1)
    })
  })
})
