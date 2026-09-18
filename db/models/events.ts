import { RenderedEventListenerStatus, RenderedEventRow, TrxOrDbOrQueryCreator, VoidResult } from '../../types.ts'
import { isoDate, jsonArrayFrom, now } from '../helpers.ts'
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
import { SelectQueryBuilder } from 'kysely'
import { DB } from '../../db.d.ts'

// Key used to persist the pub/sub instance across HMR re-evaluations.
// Without this, each HMR reload creates a new pg client while the old one
// stays connected (the old module closure keeps the client alive via its
// 'notification' event listener).
const _PUBSUB_GLOBAL_KEY = '__vha_allProcessedPubSub__'

type ListenerResult = { listener_id: string; listener_name: string; event_type: string } & VoidResult

/**
 * We need a dedicated query for the listener.
 * Provides the ability to subscribe to processed events by id or in general
 */
export const initializeAllProcessedPubSub = once(
  async function initializeAllProcessedPubSub() {
    // Reuse the existing instance across HMR re-evaluations
    // deno-lint-ignore no-explicit-any
    if ((globalThis as any)[_PUBSUB_GLOBAL_KEY]) {
      console.log('initializeAllProcessedPubSub ok')
      // deno-lint-ignore no-explicit-any
      return (globalThis as any)[_PUBSUB_GLOBAL_KEY]
    }

    const event_listener_by_patient_encounter_id_subscribers = new Map<string, Set<(listener: ListenerResult) => void>>()
    const all_settled_for_encounter_subscribers = new Map<string, Set<(err?: Error) => void>>()

    const client = new Client(opts || {})
    await client.connect()
    await client.query(`LISTEN event_inserted`)
    // await client.query(`LISTEN event_all_processed`)
    await client.query(`LISTEN event_listener_failure`)
    await client.query(`LISTEN event_listener_processed`)
    await client.query(`LISTEN all_events_settled_for_patient_encounter`)
    client.on('notification', function (event) {
      switch (event.channel) {
        case 'event_listener_processed': {
          assert(event.payload)
          const event_listener = JSON.parse(event.payload)
          assertHasProperty(event_listener, 'id')
          assertHasProperty(event_listener, 'event_id')
          assertHasProperty(event_listener, 'event_type')
          assertHasProperty(event_listener, 'listener_name')
          assertHasProperty(event_listener, 'patient_encounter_id')

          const subscriptions = event_listener_by_patient_encounter_id_subscribers.get(event_listener.patient_encounter_id)
          if (!subscriptions?.size) break
          for (const subscription of subscriptions) {
            subscription({
              listener_id: event_listener.id,
              listener_name: event_listener.listener_name,
              event_type: event_listener.event_type,
              success: true as const,
            })
          }
          break
        }
        case 'event_listener_failure': {
          assert(event.payload)
          const event_listener = JSON.parse(event.payload)
          assertHasProperty(event_listener, 'id')
          assertHasProperty(event_listener, 'event_id')
          assertHasProperty(event_listener, 'event_type')
          assertHasProperty(event_listener, 'listener_name')
          assertHasProperty(event_listener, 'patient_encounter_id')
          assertHasProperty(event_listener, 'error_message')

          const error = new Error(`Listener ${event_listener.listener_name} with id ${event_listener.id} failed with message ${event_listener.error_message}`)

          const listener_subscriptions = event_listener_by_patient_encounter_id_subscribers.get(event_listener.patient_encounter_id)
          if (listener_subscriptions?.size) {
            for (const subscription of listener_subscriptions) {
              subscription({
                listener_id: event_listener.id,
                listener_name: event_listener.listener_name,
                event_type: event_listener.event_type,
                success: false as const,
                error,
              })
            }
          }

          const all_settled_subscriptions = all_settled_for_encounter_subscribers.get(event_listener.patient_encounter_id)
          if (all_settled_subscriptions?.size) {
            for (const subscription of all_settled_subscriptions) {
              subscription(error)
            }
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
      }
    })

    // TODO stop accepting new subscriptions after shutdown
    const instance = {
      by_event_listener_encounter: {
        subscribe(patient_encounter_id: string, callback: (listener: ListenerResult) => void) {
          assert(isUUID(patient_encounter_id))
          if (!event_listener_by_patient_encounter_id_subscribers.has(patient_encounter_id)) {
            event_listener_by_patient_encounter_id_subscribers.set(patient_encounter_id, new Set())
          }
          const subscriptions = exists(event_listener_by_patient_encounter_id_subscribers.get(patient_encounter_id))
          subscriptions.add(callback)
        },
        unsubscribe(patient_encounter_id: string, callback: (listener: ListenerResult) => void) {
          assert(isUUID(patient_encounter_id))
          const subscriptions = event_listener_by_patient_encounter_id_subscribers.get(patient_encounter_id)
          subscriptions?.delete(callback)
          if (!subscriptions?.size) {
            event_listener_by_patient_encounter_id_subscribers.delete(patient_encounter_id)
          }
        },
      },
      all_settled_for_encounter: {
        subscribe(patient_encounter_id: string, callback: (err?: Error) => void) {
          assert(isUUID(patient_encounter_id))
          if (!all_settled_for_encounter_subscribers.has(patient_encounter_id)) {
            all_settled_for_encounter_subscribers.set(patient_encounter_id, new Set())
          }
          const subscriptions = exists(all_settled_for_encounter_subscribers.get(patient_encounter_id))
          subscriptions.add(callback)
        },
        unsubscribe(patient_encounter_id: string, callback: (err?: Error) => void) {
          assert(isUUID(patient_encounter_id))
          const subscriptions = all_settled_for_encounter_subscribers.get(patient_encounter_id)
          subscriptions?.delete(callback)
          if (!subscriptions?.size) {
            all_settled_for_encounter_subscribers.delete(patient_encounter_id)
          }
        },
      },
      // am I a pythonista? 🐍
      __client__: client,
    } // deno-lint-ignore no-explicit-any
    ;(globalThis as any)[_PUBSUB_GLOBAL_KEY] = instance
    return instance
  },
)

export const events = {
  initializeAllProcessedPubSub,
  async search(
    trx: TrxOrDbOrQueryCreator,
    search_terms: { search?: string | null; type?: string | null },
    opts?: { page?: number; rows_per_page?: number },
  ) {
    const page = opts?.page ?? 1
    const rows_per_page = opts?.rows_per_page ?? 10
    const offset = (page - 1) * rows_per_page

    const results = await trx
      .selectFrom('events')
      .select((eb) => [
        'events.id',
        'events.type',
        isoDate(eb.ref('events.created_at')).as('created_at'),
        'events.all_processed_at',
        'events.error_message',
        'events.listener_names',
        jsonArrayFrom(
          eb.selectFrom('event_listeners')
            .whereRef('event_listeners.event_id', '=', 'events.id')
            .select([
              'event_listeners.listener_name',
              'event_listeners.error_message',
              'event_listeners.processed_at',
              'event_listeners.started_processing_at',
            ]),
        ).as('raw_listeners'),
      ])
      .$if(!!search_terms.search, (qb) => qb.where('events.type', 'ilike', `%${search_terms.search}%`))
      .$if(!!search_terms.type, (qb) => qb.where('events.type', '=', search_terms.type!))
      .orderBy('events.created_at', 'desc')
      .limit(rows_per_page + 1)
      .offset(offset)
      .execute()

    return {
      page,
      rows_per_page,
      results: results.slice(0, rows_per_page).map((r): RenderedEventRow => ({
        id: r.id,
        type: r.type,
        created_at: r.created_at,
        all_processed_at: r.all_processed_at?.toISOString() ?? null,
        error_message: r.error_message,
        listener_names: r.listener_names,
        listeners: r.raw_listeners.map((l): RenderedEventListenerStatus => ({
          listener_name: l.listener_name,
          error_message: l.error_message,
          status: l.error_message ? 'error' : l.processed_at ? 'processed' : l.started_processing_at ? 'processing' : 'pending',
        })),
      })),
      has_next_page: results.length > rows_per_page,
      search_terms,
    }
  },
  getListenerOfEvent(
    trx: TrxOrDbOrQueryCreator,
    { event_id, listener_name }: { event_id: string; listener_name: string },
  ) {
    return trx
      .selectFrom('event_listeners')
      .innerJoin('events', 'event_listeners.event_id', 'events.id')
      .where('event_listeners.event_id', '=', event_id)
      .where('event_listeners.listener_name', '=', listener_name)
      .selectAll('event_listeners')
      .select(['events.type', 'events.data'])
      .executeTakeFirst()
  },
  async closeAllProcessedPubSub(opts: { graceful: boolean }) {
    assert(!opts.graceful, 'TODO support a graceful mode')
    if (!initializeAllProcessedPubSub.called) return
    const pub_sub = await initializeAllProcessedPubSub()
    // deno-lint-ignore no-explicit-any
    delete (globalThis as any)[_PUBSUB_GLOBAL_KEY]
    await pub_sub.__client__.end()
  },
  insert(
    trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
    event_id: string,
  ) {
    return trx
      .selectFrom('events')
      .selectAll()
      .where('id', '=', event_id)
      .executeTakeFirstOrThrow()
  },
  async selectUnprocessedListener(
    trx: TrxOrDbOrQueryCreator,
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
  //   trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
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
  //   trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
    { patient_encounter_id, timeout_ms = 10000 }: {
      patient_encounter_id: string
      timeout_ms?: number
    },
  ): Promise<void> {
    const pub_sub = await initializeAllProcessedPubSub()
    const timer = timeout(timeout_ms)

    // Subscribe BEFORE querying to avoid missing notifications
    const settled = Promise.withResolvers<void>()
    function callback(err?: Error) {
      if (err) return settled.reject(err)
      settled.resolve()
    }

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
  /**
   * Waits until one listener of one event in an encounter has been processed, the event picked out
   * by `modifyQuery`. Throws if there is no such listener, if it errored, or if it has not been
   * processed within `timeout_ms`.
   *
   * Notifications only say which (event_type, listener_name) was processed, and several events in
   * an encounter can carry the same pair, so each notification re-reads the listener rather than
   * being taken as the answer. Nothing is missed in the window before the first read either, as
   * that read is what decides whether to keep waiting at all.
   */
  async processedListenerForEncounter<EventName extends keyof typeof EVENTS>(
    trx: TrxOrDbOrQueryCreator,
    { patient_encounter_id, event_type, listener_name, timeout_ms = 10000, modifyQuery = (qb) => qb }: {
      patient_encounter_id: string
      event_type: EventName
      listener_name: keyof (typeof EVENTS)[EventName]['listeners']
      timeout_ms?: number
      modifyQuery?(query: EventListenerQuery): EventListenerQuery
    },
  ): Promise<void> {
    const pub_sub = await initializeAllProcessedPubSub()
    const timer = timeout(timeout_ms)

    const processed_a_matching_listener = Promise.withResolvers<void>()
    let event_listener: ReturnedEventListener
    function callback(result: ListenerResult) {
      if (result.event_type !== event_type) return
      if (result.listener_name !== listener_name) return
      if (result.listener_id !== event_listener?.id) return
      if (result.success) return processed_a_matching_listener.resolve()
      return processed_a_matching_listener.reject(result.error)
    }
    // Subscribe BEFORE querying to avoid missing notifications
    pub_sub.by_event_listener_encounter.subscribe(patient_encounter_id, callback)

    try {
      await Promise.race([
        timer,
        (async () => {
          const query: EventListenerQuery = trx
            .selectFrom('events')
            .innerJoin('event_listeners', 'event_listeners.event_id', 'events.id')
            .where('events.patient_encounter_id', '=', patient_encounter_id)
            .where('events.type', '=', event_type)
            .where('event_listeners.listener_name', '=', listener_name as string)
            .selectAll('event_listeners')
            .orderBy('event_listeners.created_at', 'desc')

            // Taken before the read, so a notification arriving during it still counts
            event_listener = await modifyQuery(query).executeTakeFirstOrThrow()

            if (event_listener.error_message) {
              throw new Error(`[${event_listener.listener_name}] ${event_listener.error_message}`)
            }
            if (event_listener.processed_at) return

            await processed_a_matching_listener.promise
          
        })(),
      ])
    } finally {
      pub_sub.by_event_listener_encounter.unsubscribe(patient_encounter_id, callback)
      timer.cancel()
    }
  },
}

type ReturnedEventListener = {
  created_at: Date
  error_message: string | null
  event_id: string
  id: string
  listener_name: string
  processed_at: Date | null
  started_processing_at: Date | null
  success_message: string | null
  updated_at: Date
}
type EventListenerQuery = SelectQueryBuilder<DB, 'event_listeners' | 'events', ReturnedEventListener>
