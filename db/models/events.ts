import { TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'
import { EventInsertAny, EVENTS } from '../../events/handlers.ts'
import { Client } from 'pg'
import { opts } from '../db.ts'
import { assert } from 'std/assert/assert.ts'
import { isUUID } from '../../util/uuid.ts'
import { once } from '../../util/once.ts'
import { timeout } from '../../util/timeout.ts'
import keys from '../../util/keys.ts'
import { exists } from '../../util/exists.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'

/**
 * We need a dedicated query for the listener.
 * Provides the ability to subscribe to processed events by id or in general
 */
export const initializeAllProcessedPubSub = once(
  async function initializeAllProcessedPubSub() {
    const by_patient_encounter_id_subscribers = new Map<string, Set<(event_id: string) => void>>()
    const by_event_id_subscribers = new Map<string, Set<(err?: Error) => void>>()
    const any_subscribers = new Set<(event_id: string, err?: Error) => void>()
    const all_settled_for_encounter_subscribers = new Map<string, Set<() => void>>()

    const client = new Client(opts || {})
    await client.connect()
    await client.query(`LISTEN event_inserted`)
    await client.query(`LISTEN event_all_processed`)
    await client.query(`LISTEN event_listener_failure`)
    await client.query(`LISTEN all_events_settled_for_patient_encounter`)
    client.on('notification', function (event) {
      switch (event.channel) {
        case 'event_inserted': {
          assert(event.payload)
          const { id, data } = JSON.parse(event.payload)
          if (!data.patient_encounter_id) break
          const by_patient_encounter_id_subscriptions = by_patient_encounter_id_subscribers.get(data.patient_encounter_id)
          if (!by_patient_encounter_id_subscriptions?.size) break
          for (const subscription of by_patient_encounter_id_subscriptions) {
            subscription(id)
          }
          break
        }
        case 'event_all_processed': {
          const event_id = event.payload
          assert(isUUID(event_id))
          const by_id_subscriptions = by_event_id_subscribers.get(event_id)
          if (!by_id_subscriptions?.size) return
          for (const subscription of by_id_subscriptions) {
            subscription()
          }
          for (const subscription of any_subscribers) {
            subscription(event_id)
          }
          break
        }
        case 'all_events_settled_for_patient_encounter': {
          const patient_encounter_id = event.payload
          assert(isUUID(patient_encounter_id))
          const subscriptions = all_settled_for_encounter_subscribers.get(patient_encounter_id)
          if (!subscriptions?.size) break
          for (const subscription of subscriptions) {
            subscription()
          }
          break
        }
        case 'event_listener_failure': {
          assert(event.payload)
          const event_listener = JSON.parse(event.payload)
          assertHasProperty(event_listener, 'id')
          assertHasProperty(event_listener, 'listener_name')
          assertHasProperty(event_listener, 'event_id')
          assertHasProperty(event_listener, 'error_message')

          const error = new Error(`Listener ${event_listener.listener_name} with id ${event_listener.id} failed with message ${event_listener.error_message}`)
          const by_id_subscriptions = by_event_id_subscribers.get(event_listener.event_id)
          if (!by_id_subscriptions?.size) return
          for (const subscription of by_id_subscriptions) {
            subscription(error)
          }
          for (const subscription of any_subscribers) {
            subscription(event_listener.event_id, error)
          }
          break
        }
      }
    })

    // TODO stop accepting new subscriptions after shutdown
    return {
      by_patient_encounter_id: {
        subscribe(patient_encounter_id: string, callback: (event_id: string) => void) {
          // console.log('subscribing', event_id)
          assert(isUUID(patient_encounter_id))
          if (!by_patient_encounter_id_subscribers.has(patient_encounter_id)) {
            by_patient_encounter_id_subscribers.set(patient_encounter_id, new Set())
          }
          const subscriptions = exists(by_patient_encounter_id_subscribers.get(patient_encounter_id))
          subscriptions.add(callback)
        },
        unsubscribe(patient_encounter_id: string, callback: (event_id: string) => void) {
          assert(isUUID(patient_encounter_id))
          const subscriptions = by_patient_encounter_id_subscribers.get(patient_encounter_id)
          subscriptions?.delete(callback)
          if (!subscriptions?.size) {
            by_patient_encounter_id_subscribers.delete(patient_encounter_id)
          }
        },
      },
      by_event_id: {
        subscribe(event_id: string, callback: (err?: Error) => void) {
          // console.log('subscribing', event_id)
          assert(isUUID(event_id))
          if (!by_event_id_subscribers.has(event_id)) {
            by_event_id_subscribers.set(event_id, new Set())
          }
          const subscriptions = exists(by_event_id_subscribers.get(event_id))
          subscriptions.add(callback)
        },
        unsubscribe(event_id: string, callback: (err?: Error) => void) {
          assert(isUUID(event_id))
          const subscriptions = by_event_id_subscribers.get(event_id)
          subscriptions?.delete(callback)
          if (!subscriptions?.size) {
            by_event_id_subscribers.delete(event_id)
          }
        },
      },
      all_settled_for_encounter: {
        subscribe(patient_encounter_id: string, callback: () => void) {
          assert(isUUID(patient_encounter_id))
          if (!all_settled_for_encounter_subscribers.has(patient_encounter_id)) {
            all_settled_for_encounter_subscribers.set(patient_encounter_id, new Set())
          }
          const subscriptions = exists(all_settled_for_encounter_subscribers.get(patient_encounter_id))
          subscriptions.add(callback)
        },
        unsubscribe(patient_encounter_id: string, callback: () => void) {
          assert(isUUID(patient_encounter_id))
          const subscriptions = all_settled_for_encounter_subscribers.get(patient_encounter_id)
          subscriptions?.delete(callback)
          if (!subscriptions?.size) {
            all_settled_for_encounter_subscribers.delete(patient_encounter_id)
          }
        },
      },
      any: {
        subscribe(callback: (event_id: string) => void) {
          any_subscribers.add(callback)
        },
        unsubscribe(callback: (event_id: string) => void) {
          any_subscribers.delete(callback)
        },
      },
      // am I a pythonista? 🐍
      __client__: client,
    }
  },
)

export const events = {
  initializeAllProcessedPubSub,
  async closeAllProcessedPubSub(opts: { graceful: boolean }) {
    assert(!opts.graceful, 'TODO support a graceful mode')
    if (!initializeAllProcessedPubSub.called) return
    const pub_sub = await initializeAllProcessedPubSub()
    await pub_sub.__client__.end()
  },
  insert(
    trx: TrxOrDb,
    { type, data }: EventInsertAny,
  ): Promise<{ id: string }> {
    const event_def = EVENTS[type]
    const listener_names = keys(event_def.listeners)
    return trx
      .insertInto('events')
      .values({
        type,
        data: event_def.schema.parse(data),
        listener_names,
        all_processed_at: listener_names.length ? null : now,
      })
      .returning('id')
      .executeTakeFirstOrThrow()
  },
  getById(
    trx: TrxOrDb,
    event_id: string,
  ) {
    return trx
      .selectFrom('events')
      .selectAll()
      .where('id', '=', event_id)
      .executeTakeFirstOrThrow()
  },
  async selectUnprocessedListener(
    trx: TrxOrDb,
    event_listener_id: string,
  ) {
    const listener = await trx
      .updateTable('event_listeners')
      .where('event_listeners.started_processing_at', 'is', null)
      .where('event_listeners.id', '=', event_listener_id)
      .set({
        started_processing_at: now,
      })
      .returning([
        'id',
        'event_id',
        'listener_name',
      ])
      .executeTakeFirst()
    if (!listener) return

    const event = await trx
      .selectFrom('events')
      .select(['type', 'data'])
      .where('id', '=', listener.event_id)
      .executeTakeFirstOrThrow()

    return { ...listener, ...event }
  },
  // selectUnprocessedListeners(
  //   trx: TrxOrDb,
  //   opts: {
  //     max_error_count?: number
  //     limit?: number
  //   } = {},
  // ) {
  //   const { max_error_count = 3, limit = 8 } = opts
  //   return trx
  //     .selectFrom('event_listeners')
  //     .innerJoin('events', 'event_listeners.event_id', 'events.id')
  //     .where('event_listeners.processed_at', 'is', null)
  //     .where('event_listeners.error_count', '<', max_error_count)
  //     .where('events.error_message_no_automated_retry', 'is', null)
  //     .where((eb) =>
  //       eb.or([
  //         eb('event_listeners.backoff_until', '<', now),
  //         eb('event_listeners.backoff_until', 'is', null),
  //       ])
  //     )
  //     .forUpdate()
  //     .skipLocked()
  //     .selectAll('event_listeners')
  //     .select('events.type')
  //     .select('events.data')
  //     .limit(limit)
  //     .execute()
  // },
  selectListenersOfEvent(
    trx: TrxOrDb,
    { event_id }: {
      event_id: string
    },
  ) {
    return trx
      .selectFrom('event_listeners')
      .innerJoin('events', 'event_listeners.event_id', 'events.id')
      .selectAll('event_listeners')
      .select('events.type')
      .select('events.data')
      .where('event_listeners.event_id', '=', event_id)
      .execute()
  },
  processedListener(
    trx: TrxOrDb,
    { event_listener_id, success_message }: { event_listener_id: string; success_message: string },
  ) {
    return trx
      .updateTable('event_listeners')
      .set({
        success_message,
        error_message: null,
        processed_at: now,
        // backoff_until: null,
      })
      .where('id', '=', event_listener_id)
      .executeTakeFirstOrThrow()
  },
  markUnrecoverableError(
    trx: TrxOrDb,
    id: string,
    error: Error,
  ) {
    console.error(error)
    return trx
      .updateTable('events')
      .set({ error_message: error.message })
      .where('id', '=', id)
      .executeTakeFirstOrThrow()
  },

  /*
  Exponential backoff
  error_count backoff_ms
  1           10000
  2           60000
  3           360000
  */
  // calculateBackoff(error_count: number): string {
  //   const backoff_ms = Math.pow(6, error_count - 1) * 10000
  //   return new Date(Date.now() + backoff_ms).toISOString()
  // },
  markErroredListener(
    trx: TrxOrDb,
    { event_listener_id, error_message /*, error_count */ }: {
      event_listener_id: string
      error_message: string
      // error_count: number
    },
  ) {
    return trx
      .updateTable('event_listeners')
      .set({
        // error_count,
        error_message,
        processed_at: null,
        // backoff_until: events.calculateBackoff(error_count),
      })
      .where('id', '=', event_listener_id)
      .executeTakeFirstOrThrow()
  },
  // clearBackoff(
  //   trx: TrxOrDb,
  //   { event_listener_id }: { event_listener_id: string },
  // ) {
  //   return trx.updateTable('event_listeners')
  //     .where('id', '=', event_listener_id)
  //     .set({ backoff_until: null })
  //     .executeTakeFirstOrThrow()
  // },

  /**
   * Waits until all events for a given patient encounter have been fully processed.
   */
  async allProcessedForEncounter(
    trx: TrxOrDb,
    { patient_encounter_id, timeout_ms = 10000 }: {
      patient_encounter_id: string
      timeout_ms?: number
    },
  ): Promise<void> {
    const pub_sub = await initializeAllProcessedPubSub()
    const timer = timeout(timeout_ms)

    // Subscribe BEFORE querying to avoid missing notifications
    const settled = Promise.withResolvers<void>()
    const callback = () => settled.resolve()
    pub_sub.all_settled_for_encounter.subscribe(patient_encounter_id, callback)

    try {
      await Promise.race([
        settled.promise,
        timer,
        (async () => {
          const [already_errored, has_unsettled] = await Promise.all([
            trx
              .selectFrom('events')
              .innerJoin('event_listeners', 'event_listeners.event_id', 'events.id')
              .where('events.patient_encounter_id', '=', patient_encounter_id)
              .where('events.all_processed_at', 'is', null)
              .where('event_listeners.error_message', 'is not', null)
              .selectAll('event_listeners')
              .execute(),
            trx
              .selectFrom('events')
              .where('events.patient_encounter_id', '=', patient_encounter_id)
              .where('events.all_processed_at', 'is', null)
              .select('events.id')
              .limit(1)
              .executeTakeFirst(),
          ])

          if (already_errored.length) {
            const message = already_errored
              .map((l) => `[${l.listener_name}] ${l.error_message}`)
              .join('\n\n')
            throw new AggregateError(already_errored.map((l) => l.error_message), message)
          }

          if (!has_unsettled) return

          await settled.promise
        })(),
      ])
    } finally {
      pub_sub.all_settled_for_encounter.unsubscribe(patient_encounter_id, callback)
      timer.cancel()
    }
  },
}
