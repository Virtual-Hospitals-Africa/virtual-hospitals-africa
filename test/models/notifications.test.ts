import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { notifications } from '../../db/models/notifications.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'
import { timeout } from '../../util/timeout.ts'

function insertTestNotification(health_worker_id: string, row_id: string) {
  return notifications.insert(db, {
    health_worker_id,
    title: 'Test notification',
    description: 'Test description',
    avatar_url: '/images/test.svg',
    table_name: 'patient_encounters',
    row_id,
    notification_type: 'test',
    action_title: 'View',
    action_href: '/app',
  })
}

describe('db/models/notifications.ts', () => {
  let organization_id: string
  before(async () => {
    organization_id = (await createTestOrganization(db)).id
    await notifications.initializeNotificationsPubSub()
  })
  afterAll(async () => {
    await notifications.closeNotificationsPubSub({ graceful: false })
    await db.destroy()
  })

  describe('initializeNotificationsPubSub', () => {
    it(
      'notifies global and matching health worker subscribers when a notification is inserted',
      async () => {
        const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
        const other_health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
        const pub_sub = await notifications.initializeNotificationsPubSub()
        const global_received = Promise.withResolvers<{ id: string; health_worker_id: string }>()
        const matching_received = Promise.withResolvers<string>()
        let other_received_called = false
        const globalCallback = (notification: { id: string; health_worker_id: string }) => global_received.resolve(notification)
        const matchingCallback = (notification_id: string) => matching_received.resolve(notification_id)
        const otherCallback = (_notification_id: string) => {
          other_received_called = true
        }
        pub_sub.any.subscribe(globalCallback)
        pub_sub.by_health_worker_id.subscribe(health_worker.id, matchingCallback)
        pub_sub.by_health_worker_id.subscribe(other_health_worker.id, otherCallback)

        try {
          const { id } = await notifications.insert(db, {
            health_worker_id: health_worker.id,
            title: 'Test notification',
            description: 'Test description',
            avatar_url: '/images/test.svg',
            table_name: 'patient_encounters',
            row_id: '00000000-0000-1000-8000-000000000099',
            notification_type: 'test',
            action_title: 'View',
            action_href: '/app',
          })

          const timer = timeout(5000)
          try {
            assertEquals(await Promise.race([global_received.promise, timer]), {
              id,
              health_worker_id: health_worker.id,
            })
            assertEquals(await Promise.race([matching_received.promise, timer]), id)
            assertEquals(other_received_called, false)
          } finally {
            timer.cancel()
          }
        } finally {
          pub_sub.any.unsubscribe(globalCallback)
          pub_sub.by_health_worker_id.unsubscribe(health_worker.id, matchingCallback)
          pub_sub.by_health_worker_id.unsubscribe(other_health_worker.id, otherCallback)
        }
      },
    )

    it(
      'still notifies other subscribers when one subscriber throws',
      async () => {
        const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
        const pub_sub = await notifications.initializeNotificationsPubSub()
        const received = Promise.withResolvers<string>()
        const throwingCallback = () => {
          throw new Error('subscriber failed')
        }
        const succeedingCallback = (notification_id: string) => received.resolve(notification_id)
        pub_sub.by_health_worker_id.subscribe(health_worker.id, throwingCallback)
        pub_sub.by_health_worker_id.subscribe(health_worker.id, succeedingCallback)

        try {
          const { id } = await notifications.insert(db, {
            health_worker_id: health_worker.id,
            title: 'Test notification',
            description: 'Test description',
            avatar_url: '/images/test.svg',
            table_name: 'patient_encounters',
            row_id: '00000000-0000-1000-8000-000000000098',
            notification_type: 'test',
            action_title: 'View',
            action_href: '/app',
          })

          const timer = timeout(5000)
          try {
            assertEquals(await Promise.race([received.promise, timer]), id)
          } finally {
            timer.cancel()
          }
        } finally {
          pub_sub.by_health_worker_id.unsubscribe(health_worker.id, throwingCallback)
          pub_sub.by_health_worker_id.unsubscribe(health_worker.id, succeedingCallback)
        }
      },
    )
  })

  describe('markSeen', () => {
    it('marks unread notifications belonging to the specified health worker', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
      const first = await insertTestNotification(
        health_worker.id,
        '00000000-0000-1000-8000-000000000081',
      )
      const second = await insertTestNotification(
        health_worker.id,
        '00000000-0000-1000-8000-000000000082',
      )

      const updated = await notifications.markSeen(db, {
        health_worker_id: health_worker.id,
        notification_ids: [first.id, second.id],
      })
      assertEquals(updated, 2)

      const rows = await db
        .selectFrom('health_worker_web_notifications')
        .select(['id', 'seen_at'])
        .where('id', 'in', [first.id, second.id])
        .execute()
      assertEquals(rows.every((row) => row.seen_at !== null), true)
    })

    it("does not mark another health worker's notification", async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
      const other_health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
      const others = await insertTestNotification(
        other_health_worker.id,
        '00000000-0000-1000-8000-000000000083',
      )

      const updated = await notifications.markSeen(db, {
        health_worker_id: health_worker.id,
        notification_ids: [others.id],
      })
      assertEquals(updated, 0)

      const row = await db
        .selectFrom('health_worker_web_notifications')
        .select('seen_at')
        .where('id', '=', others.id)
        .executeTakeFirstOrThrow()
      assertEquals(row.seen_at, null)
    })

    it('does not overwrite an existing seen_at', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
      const notification = await insertTestNotification(
        health_worker.id,
        '00000000-0000-1000-8000-000000000084',
      )
      const already_seen_at = new Date('2020-01-01T00:00:00Z')
      await db
        .updateTable('health_worker_web_notifications')
        .set({ seen_at: already_seen_at })
        .where('id', '=', notification.id)
        .execute()

      const updated = await notifications.markSeen(db, {
        health_worker_id: health_worker.id,
        notification_ids: [notification.id],
      })
      assertEquals(updated, 0)

      const row = await db
        .selectFrom('health_worker_web_notifications')
        .select('seen_at')
        .where('id', '=', notification.id)
        .executeTakeFirstOrThrow()
      assertEquals(row.seen_at, already_seen_at)
    })

    it('is idempotent when called twice', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
      const notification = await insertTestNotification(
        health_worker.id,
        '00000000-0000-1000-8000-000000000085',
      )

      const first_call = await notifications.markSeen(db, {
        health_worker_id: health_worker.id,
        notification_ids: [notification.id],
      })
      assertEquals(first_call, 1)

      const second_call = await notifications.markSeen(db, {
        health_worker_id: health_worker.id,
        notification_ids: [notification.id],
      })
      assertEquals(second_call, 0)
    })

    it('returns 0 for an empty notification_ids array', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })

      const updated = await notifications.markSeen(db, {
        health_worker_id: health_worker.id,
        notification_ids: [],
      })
      assertEquals(updated, 0)
    })

    it('countAll only_unread reflects notifications marked as seen', async () => {
      const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })
      const first = await insertTestNotification(
        health_worker.id,
        '00000000-0000-1000-8000-000000000086',
      )
      await insertTestNotification(
        health_worker.id,
        '00000000-0000-1000-8000-000000000087',
      )

      assertEquals(
        await notifications.countAll(db, {
          health_worker_id: health_worker.id,
          only_unread: true,
        }),
        2,
      )

      await notifications.markSeen(db, {
        health_worker_id: health_worker.id,
        notification_ids: [first.id],
      })

      assertEquals(
        await notifications.countAll(db, {
          health_worker_id: health_worker.id,
          only_unread: true,
        }),
        1,
      )
    })
  })

  describe('notification summary data sources', () => {
    it(
      'countAll only_unread reflects unread notifications and excludes seen ones',
      async () => {
        const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })

        assertEquals(
          await notifications.countAll(db, {
            health_worker_id: health_worker.id,
            only_unread: true,
          }),
          0,
        )

        const first = await insertTestNotification(
          health_worker.id,
          '00000000-0000-1000-8000-000000000091',
        )
        await insertTestNotification(
          health_worker.id,
          '00000000-0000-1000-8000-000000000092',
        )

        assertEquals(
          await notifications.countAll(db, {
            health_worker_id: health_worker.id,
            only_unread: true,
          }),
          2,
        )

        await db
          .updateTable('health_worker_web_notifications')
          .set({ seen_at: new Date() })
          .where('id', '=', first.id)
          .execute()

        assertEquals(
          await notifications.countAll(db, {
            health_worker_id: health_worker.id,
            only_unread: true,
          }),
          1,
        )
      },
    )

    it(
      'highestUnreadPriority returns null when there are no unread encounter-linked notifications',
      async () => {
        const health_worker = await addTestEmployee(db, { role: 'nurse', organization_id })

        assertEquals(
          await notifications.highestUnreadPriority(db, {
            health_worker_id: health_worker.id,
          }),
          null,
        )

        await insertTestNotification(
          health_worker.id,
          '00000000-0000-1000-8000-000000000093',
        )

        assertEquals(
          await notifications.highestUnreadPriority(db, {
            health_worker_id: health_worker.id,
          }),
          null,
        )
      },
    )
  })
})
