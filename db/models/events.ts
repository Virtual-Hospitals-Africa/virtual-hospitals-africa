import { TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'
import { EventInsertAny, EVENTS } from '../../events/handlers.ts'
import { sql } from 'kysely'
import { Client } from 'pg'
import { opts } from '../db.ts'
import { assert } from 'std/assert/assert.ts'
import { isUUID } from '../../util/uuid.ts'
import { once } from '../../util/once.ts'
import { timeout } from '../../util/timeout.ts'
import keys from '../../util/keys.ts'
import { exists } from '../../util/exists.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { promiseProps } from '../../util/promiseProps.ts'

/**
 * We need a dedicated query for the listener.
 * Provides the ability to subscribe to processed events by id or in general
 */
export const initializeAllProcessedPubSub = once(
  async function initializeAllProcessedPubSub() {
    const by_id_subscribers = new Map<string, Set<(err?: Error) => void>>()
    const any_subscribers = new Set<(event_id: string, err?: Error) => void>()

    const all_processed_client = new Client(opts || {})
    await all_processed_client.connect()
    await all_processed_client.query(`LISTEN event_all_processed`)
    all_processed_client.on('notification', function (event) {
      const event_id = event.payload
      assert(isUUID(event_id))
      // console.log(`event_all_processed ${event_id}`)
      const by_id_subscriptions = by_id_subscribers.get(event_id)
      // console.log({ by_id_subscriptions })
      if (!by_id_subscriptions?.size) return
      for (const subscription of by_id_subscriptions) {
        subscription()
      }
      for (const subscription of any_subscribers) {
        subscription(event_id)
      }
    })

    const event_failure_client = new Client(opts || {})
    await event_failure_client.connect()
    await event_failure_client.query(`LISTEN event_listener_failure`)
    event_failure_client.on('notification', function (event) {
      console.log('FAILURE', event)
      assert(event.payload)
      const event_listener = JSON.parse(event.payload)
      assertHasProperty(event_listener, 'id')
      assertHasProperty(event_listener, 'listener_name')
      assertHasProperty(event_listener, 'event_id')
      assertHasProperty(event_listener, 'error_message')

      const error = new Error(`Listener ${event_listener.listener_name} with id ${event_listener.id} failed with message ${event_listener.error_message}`)
      // console.log(`event_all_processed ${event_id}`)
      const by_id_subscriptions = by_id_subscribers.get(event_listener.event_id)
      // console.log({ by_id_subscriptions })
      if (!by_id_subscriptions?.size) return
      for (const subscription of by_id_subscriptions) {
        subscription(error)
      }
      for (const subscription of any_subscribers) {
        subscription(event_listener.event_id, error)
      }
    })

    // TODO stop accepting new subscriptions after shutdown
    return {
      by_id: {
        subscribe(event_id: string, callback: (err?: Error) => void) {
          // console.log('subscribing', event_id)
          assert(isUUID(event_id))
          if (!by_id_subscribers.has(event_id)) {
            by_id_subscribers.set(event_id, new Set())
          }
          const subscriptions = exists(by_id_subscribers.get(event_id))
          subscriptions.add(callback)
        },
        unsubscribe(event_id: string, callback: (err?: Error) => void) {
          assert(isUUID(event_id))
          const subscriptions = by_id_subscribers.get(event_id)
          subscriptions?.delete(callback)
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
      __all_processed_client__: all_processed_client,
      __event_failure_client__: event_failure_client,
    }
  },
)

export const events = {
  initializeAllProcessedPubSub,
  async closeAllProcessedPubSub(opts: { graceful: boolean }) {
    assert(!opts.graceful, 'TODO support a graceful mode')
    if (!initializeAllProcessedPubSub.called) return
    const pub_sub = await initializeAllProcessedPubSub()
    await pub_sub.__all_processed_client__.end()
    await pub_sub.__event_failure_client__.end()
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
   * An event is considered for this encounter if its data jsonb contains a matching patient_encounter_id.
   */
  async allProcessedForEncounter(
    trx: TrxOrDb,
    { patient_encounter_id, timeout_ms = 10000 }: {
      patient_encounter_id: string
      timeout_ms?: number
    },
  ): Promise<void> {
    // Do we care about events that come in later?
    // const start = Date.now()

    const pub_sub = await initializeAllProcessedPubSub()
    const events_processed_while_waiting = new Set<string>()
    const events_failed_while_waiting = new Map<string, Error>()

    const callback = (event_id: string, err?: Error) => {
      console.log({ event_id, err })
      if (err) {
        return events_failed_while_waiting.set(event_id, err)
      }
      events_processed_while_waiting.add(event_id)
    }

    async function unprocessedEventsRelatedToThisEncounter() {
      try {
        pub_sub.any.subscribe(callback)
        return await trx
          .selectFrom('events')
          .where(
            sql<boolean>`events.data->>'patient_encounter_id' = ${patient_encounter_id}`,
          )
          .where('events.all_processed_at', 'is', null)
          .select('events.id')
          .execute()
      } finally {
        pub_sub.any.unsubscribe(callback)
      }
    }

    async function alreadyErroredListenersRelatedToThisEncounter() {
      return await trx
        .selectFrom('events')
        .innerJoin('event_listeners', 'event_listeners.event_id', 'events.id')
        .where(
          sql<boolean>`events.data->>'patient_encounter_id' = ${patient_encounter_id}`,
        )
        .where('events.all_processed_at', 'is', null)
        .where('event_listeners.error_message', 'is not', null)
        .selectAll('event_listeners')
        .execute()
    }

    const { unprocessed_events_related_to_this_encounter, already_errored_listeners_related_to_this_encounter } = await promiseProps({
      unprocessed_events_related_to_this_encounter: unprocessedEventsRelatedToThisEncounter(),
      already_errored_listeners_related_to_this_encounter: alreadyErroredListenersRelatedToThisEncounter(),
    })

    if (already_errored_listeners_related_to_this_encounter.length) {
      const message = already_errored_listeners_related_to_this_encounter
        .map((listener) => `[${listener.listener_name}] ${listener.error_message}`)
        .join('\n\n')

      throw new AggregateError(already_errored_listeners_related_to_this_encounter.map((listener) => listener.error_message), message)
    }

    if (!unprocessed_events_related_to_this_encounter.length) return

    const timer = timeout(timeout_ms)

    await Promise.all(
      unprocessed_events_related_to_this_encounter.map((e) => {
        if (events_processed_while_waiting.has(e.id)) {
          return
        }
        if (events_failed_while_waiting.has(e.id)) {
          const error = events_failed_while_waiting.get(e.id)
          throw error
        }

        const promise = Promise.withResolvers<void>()
        const callback = (err: unknown) => {
          if (err) {
            return promise.reject(err)
          }
          promise.resolve()
        }
        pub_sub.by_id.subscribe(e.id, callback)
        return Promise.race([promise.promise, timer])
          .finally(() => pub_sub.by_id.unsubscribe(e.id, callback))
      }),
    )

    timer.cancel()
  },
}
