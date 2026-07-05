import { sql } from 'kysely'
import { Client } from 'pg'
import { isPriority, ORDERED_PRIORITIES, Priority, PRIORITY_SNOMED_CODES } from '../../shared/priorities.ts'
import { Maybe, NonEmptyArray, PostgresInterval, RenderedNotification, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { orderByArrayPosition } from '../helpers.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { opts } from '../db.ts'
import { assert } from 'std/assert/assert.ts'
import { isUUID } from '../../util/uuid.ts'
import { exists } from '../../util/exists.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'

const _PUBSUB_GLOBAL_KEY = '__vha_notificationsPubSub__'

type NotificationInsertedPayload = {
  id: string
  health_worker_id: string
}

type NotificationsPubSub = {
  any: {
    subscribe(callback: (notification: NotificationInsertedPayload) => void): void
    unsubscribe(callback: (notification: NotificationInsertedPayload) => void): void
  }
  by_health_worker_id: {
    subscribe(health_worker_id: string, callback: (notification_id: string) => void): void
    unsubscribe(health_worker_id: string, callback: (notification_id: string) => void): void
  }
  shutdown(): Promise<void>
}

function notifySubscribers<T>(subscribers: Iterable<(value: T) => void>, value: T) {
  for (const subscriber of subscribers) {
    try {
      subscriber(value)
    } catch (error) {
      console.error('notifications pub/sub subscriber threw', { value, error })
    }
  }
}

let notifications_pub_sub_promise: Promise<NotificationsPubSub> | undefined

async function createNotificationsPubSub(): Promise<NotificationsPubSub> {
  const any_subscribers = new Set<(notification: NotificationInsertedPayload) => void>()
  const by_health_worker_id_subscribers = new Map<string, Set<(notification_id: string) => void>>()

  const client = new Client(opts || {})
  await client.connect()
  await client.query(`LISTEN health_worker_notification_inserted`)

  const onNotification = (event: { channel?: string; payload?: string }) => {
    if (event.channel !== 'health_worker_notification_inserted') return
    assert(event.payload)
    const notification = JSON.parse(event.payload)
    assertHasProperty(notification, 'id')
    assertHasProperty(notification, 'health_worker_id')
    assert(isUUID(notification.id))
    assert(isUUID(notification.health_worker_id))
    const payload: NotificationInsertedPayload = {
      id: notification.id,
      health_worker_id: notification.health_worker_id,
    }
    notifySubscribers(any_subscribers, payload)
    const subscriptions = by_health_worker_id_subscribers.get(payload.health_worker_id)
    if (subscriptions?.size) {
      notifySubscribers(subscriptions, payload.id)
    }
  }
  client.on('notification', onNotification)

  return {
    any: {
      subscribe(callback: (notification: NotificationInsertedPayload) => void) {
        any_subscribers.add(callback)
      },
      unsubscribe(callback: (notification: NotificationInsertedPayload) => void) {
        any_subscribers.delete(callback)
      },
    },
    by_health_worker_id: {
      subscribe(health_worker_id: string, callback: (notification_id: string) => void) {
        assert(isUUID(health_worker_id))
        if (!by_health_worker_id_subscribers.has(health_worker_id)) {
          by_health_worker_id_subscribers.set(health_worker_id, new Set())
        }
        const subscriptions = exists(by_health_worker_id_subscribers.get(health_worker_id))
        subscriptions.add(callback)
      },
      unsubscribe(health_worker_id: string, callback: (notification_id: string) => void) {
        assert(isUUID(health_worker_id))
        const subscriptions = by_health_worker_id_subscribers.get(health_worker_id)
        subscriptions?.delete(callback)
        if (!subscriptions?.size) {
          by_health_worker_id_subscribers.delete(health_worker_id)
        }
      },
    },
    async shutdown() {
      any_subscribers.clear()
      by_health_worker_id_subscribers.clear()
      client.removeListener('notification', onNotification)
      client.removeAllListeners('notification')
      try {
        await client.query('UNLISTEN health_worker_notification_inserted')
      } catch {
        // Connection may already be closing.
      }
      await client.end()
    },
  }
}

// Deceased is in ORDERED_PRIORITIES but is not assigned as a live encounter triage level.
const ENCOUNTER_ORDERED_PRIORITIES = ORDERED_PRIORITIES.filter(
  (priority) => priority !== 'Deceased',
) as NonEmptyArray<Priority>

const ENCOUNTER_PRIORITY_SNOMED_ORDER = ENCOUNTER_ORDERED_PRIORITIES.map(
  (priority) => PRIORITY_SNOMED_CODES[priority],
) as NonEmptyArray<string>

type Terms = {
  health_worker_id?: Maybe<string>
  originator_health_worker_id?: Maybe<string>
  patient_encounter_id?: Maybe<string>
  notification_type?: Maybe<string>
  past_ts?: number | Date
  only_unread?: boolean
  recent_first?: boolean
}

export const notifications = base({
  top_level_table: 'health_worker_web_notifications',
  baseQuery(trx, terms: Terms) {
    assertOr400(terms.health_worker_id || terms.originator_health_worker_id)
    return trx
      .selectFrom('health_worker_web_notifications')
      .selectAll('health_worker_web_notifications')
      .select(
        sql<
          PostgresInterval
        >`(current_timestamp - health_worker_web_notifications.created_at)::interval`
          .as('wait_time'),
      )
      .$if(!!terms.health_worker_id, (qb) => qb.where('health_worker_id', '=', terms.health_worker_id!))
      .$if(!!terms.originator_health_worker_id, (qb) => qb.where('originator_health_worker_id', '=', terms.originator_health_worker_id!))
      .$if(!!terms.patient_encounter_id, (qb) => qb.where('patient_encounter_id', '=', terms.patient_encounter_id!))
      .$if(!!terms.notification_type, (qb) => qb.where('notification_type', '=', terms.notification_type!))
      .orderBy(
        'health_worker_web_notifications.created_at',
        terms?.recent_first ? 'desc' : 'asc',
      )
      .$if(
        !!terms?.past_ts,
        (qb) =>
          qb.where(
            'health_worker_web_notifications.created_at',
            '>',
            new Date(terms?.past_ts!),
          ),
      )
      .$if(
        !!terms?.only_unread,
        (qb) =>
          qb.where(
            'health_worker_web_notifications.seen_at',
            'is',
            null,
          ),
      )
  },
  formatResult({ id, wait_time, action_title, action_href, ...n }): RenderedNotification {
    return (
      {
        ...n,
        notification_id: id,
        time_display: timeAgoDisplay(wait_time),
        action: {
          title: action_title,
          href: action_href,
        },
      }
    )
  },
  insert(
    trx: TrxOrDbOrQueryCreator,
    { health_worker_id, employment_id, patient_encounter_id, ...notification }:
      & {
        action_title: string
        action_href: string
        avatar_url: string
        description: string
        table_name: string
        row_id: string
        notification_type: string
        title: string
        patient_encounter_id?: string | null
        originator_health_worker_id?: Maybe<string>
      }
      & (
        | { health_worker_id: string; employment_id?: never }
        | { health_worker_id?: never; employment_id: string }
      ),
  ): Promise<{ id: string }> {
    return trx
      .insertInto('health_worker_web_notifications')
      .values({
        ...notification,
        patient_encounter_id: patient_encounter_id ?? null,
        health_worker_id: health_worker_id ||
          trx.selectFrom('employment').select('health_worker_id').where(
            'id',
            '=',
            employment_id!,
          ),
      })
      .returning('id')
      .executeTakeFirstOrThrow()
  },
  async highestUnreadPriority(
    trx: TrxOrDb,
    { health_worker_id }: { health_worker_id: string },
  ): Promise<Priority | null> {
    assertOr400(health_worker_id)
    const row = await trx
      .selectFrom((eb) =>
        eb
          .selectFrom('health_worker_web_notifications')
          .where('health_worker_id', '=', health_worker_id)
          .where('seen_at', 'is', null)
          .where('patient_encounter_id', 'is not', null)
          .select((eb_notification) =>
            eb_notification
              .selectFrom('patient_triage_level')
              .innerJoin(
                'patient_records',
                'patient_triage_level.id',
                'patient_records.id',
              )
              .innerJoin(
                'patient_records_still_valid',
                'patient_records.id',
                'patient_records_still_valid.id',
              )
              .innerJoin(
                'snomed_inferred_canonical_name_and_category',
                'patient_records.value_snomed_concept_id',
                'snomed_inferred_canonical_name_and_category.id',
              )
              .whereRef(
                'patient_records.patient_encounter_id',
                '=',
                'health_worker_web_notifications.patient_encounter_id',
              )
              .where((eb_x) =>
                eb_x.exists(
                  trx
                    .selectFrom('patient_records_still_valid as associated_findings_still_valid')
                    .innerJoin(
                      'patient_record_relations as triage_relations',
                      'triage_relations.destination_id',
                      'associated_findings_still_valid.id',
                    )
                    .where(
                      'triage_relations.source_id',
                      '=',
                      eb_x.ref('patient_triage_level.id'),
                    ),
                )
              )
              .select('snomed_inferred_canonical_name_and_category.name')
              .orderBy((eb_triage_level) =>
                orderByArrayPosition(
                  eb_triage_level,
                  'patient_records.value_snomed_concept_id',
                  ENCOUNTER_PRIORITY_SNOMED_ORDER,
                ), 'desc')
              .limit(1)
              .as('encounter_priority')
          )
          .as('unread_encounter_notification_priorities')
      )
      .where('encounter_priority', 'is not', null)
      .select('encounter_priority')
      .orderBy((eb) =>
        orderByArrayPosition(
          eb,
          'encounter_priority',
          ENCOUNTER_ORDERED_PRIORITIES,
        ), 'desc')
      .limit(1)
      .executeTakeFirst()

    const priority = row?.encounter_priority
    return priority && isPriority(priority) ? priority : null
  },
  async markSeen(
    trx: TrxOrDb,
    { health_worker_id, notification_ids }: {
      health_worker_id: string
      notification_ids: string[]
    },
  ): Promise<number> {
    assertOr400(health_worker_id)
    if (!notification_ids.length) return 0
    const result = await trx
      .updateTable('health_worker_web_notifications')
      .set({ seen_at: new Date() })
      .where('health_worker_id', '=', health_worker_id)
      .where('id', 'in', notification_ids)
      .where('seen_at', 'is', null)
      .executeTakeFirst()
    return Number(result.numUpdatedRows)
  },
  markSeenByActionHref(
    trx: TrxOrDb,
    { health_worker_id, action_href, patient_encounter_id }: {
      health_worker_id: string
      action_href: string
      patient_encounter_id: Maybe<string>
    },
  ) {
    // Reminder that for all other routes we want the route to uniquely identify a resource.
    // Maybe this `open_encounter` was a bad idea, but it's grandfathered in for sure
    if (action_href.includes('/open_encounter')) {
      assert(
        patient_encounter_id,
        'Must include patient_encounter_id for actions involving the open encounter, lest we mark notifications seen for past encounters',
      )
    }
    return trx
      .updateTable('health_worker_web_notifications')
      .set({ seen_at: new Date() })
      .where('health_worker_id', '=', health_worker_id)
      .where('action_href', '=', action_href)
      .where('seen_at', 'is', null)
      .$if(!!patient_encounter_id, (qb) => qb.where('patient_encounter_id', '=', patient_encounter_id!))
      .execute()
  },
  async initializeNotificationsPubSub(): Promise<NotificationsPubSub> {
    // deno-lint-ignore no-explicit-any
    const existing = (globalThis as any)[_PUBSUB_GLOBAL_KEY] as NotificationsPubSub | undefined
    if (existing) return existing

    notifications_pub_sub_promise ||= createNotificationsPubSub().then((instance) => {
      // deno-lint-ignore no-explicit-any
      ;(globalThis as any)[_PUBSUB_GLOBAL_KEY] = instance
      return instance
    })
    return await notifications_pub_sub_promise
  },
  async closeNotificationsPubSub(opts: { graceful: boolean }) {
    assert(!opts.graceful, 'TODO support a graceful mode')
    if (!notifications_pub_sub_promise) return
    const pub_sub = await notifications_pub_sub_promise
    await pub_sub.shutdown()
    // deno-lint-ignore no-explicit-any
    delete (globalThis as any)[_PUBSUB_GLOBAL_KEY]
    notifications_pub_sub_promise = undefined
  },
})
