import { TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'
import { EventInsertAny, EVENTS } from '../../events/handlers.ts'

export function insert(
  trx: TrxOrDb,
  { type, data }: EventInsertAny,
): Promise<{ id: string }> {
  console.log(type, EVENTS[type])
  return trx
    .insertInto('events')
    .values({
      type,
      data: EVENTS[type].schema.parse(data),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function getById(
  trx: TrxOrDb,
  event_id: string,
) {
  return trx
    .selectFrom('events')
    .selectAll()
    .where('id', '=', event_id)
    .executeTakeFirstOrThrow()
}

export function withoutListeners(
  trx: TrxOrDb,
) {
  return trx
    .selectFrom('events')
    .where('listeners_inserted_at', 'is', null)
    .where('error_message_no_automated_retry', 'is', null)
    .forUpdate()
    .skipLocked()
    .select(['id', 'type', 'data'])
    .limit(50)
    .execute()
}

export function selectUnprocessedListeners(
  trx: TrxOrDb,
  opts: {
    max_error_count?: number
    limit?: number
  } = {},
) {
  const { max_error_count = 3, limit = 8 } = opts
  return trx
    .selectFrom('event_listeners')
    .innerJoin('events', 'event_listeners.event_id', 'events.id')
    .where('event_listeners.processed_at', 'is', null)
    .where('event_listeners.error_count', '<', max_error_count)
    .where('events.error_message_no_automated_retry', 'is', null)
    .where((eb) =>
      eb.or([
        eb('event_listeners.backoff_until', '<', now),
        eb('event_listeners.backoff_until', 'is', null),
      ])
    )
    .forUpdate()
    .skipLocked()
    .selectAll('event_listeners')
    .select('events.type')
    .select('events.data')
    .limit(limit)
    .execute()
}

export function selectListenersOfEvent(
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
}

export function processedListener(
  trx: TrxOrDb,
  { event_listener_id }: { event_listener_id: string },
) {
  return trx
    .updateTable('event_listeners')
    .set({
      error_message: null,
      error_count: 0,
      backoff_until: null,
      processed_at: now,
    })
    .where('id', '=', event_listener_id)
    .executeTakeFirstOrThrow()
}

export function markUnrecoverableError(
  trx: TrxOrDb,
  id: string,
  error: Error,
) {
  console.error(error)
  return trx
    .updateTable('events')
    .set({ error_message_no_automated_retry: error.message })
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

/*
  Exponential backoff
  error_count backoff_ms
  1           10000
  2           60000
  3           360000
*/
function calculateBackoff(error_count: number): string {
  const backoff_ms = Math.pow(6, error_count - 1) * 10000
  return new Date(Date.now() + backoff_ms).toISOString()
}

export function markErroredListener(
  trx: TrxOrDb,
  { event_listener_id, error_message, error_count }: {
    event_listener_id: string
    error_message: string
    error_count: number
  },
) {
  return trx
    .updateTable('event_listeners')
    .set({
      error_count,
      error_message,
      processed_at: null,
      backoff_until: calculateBackoff(error_count),
    })
    .where('id', '=', event_listener_id)
    .executeTakeFirstOrThrow()
}

export function clearBackoff(
  trx: TrxOrDb,
  { event_listener_id }: { event_listener_id: string },
) {
  return trx.updateTable('event_listeners')
    .where('id', '=', event_listener_id)
    .set({ backoff_until: null })
    .executeTakeFirstOrThrow()
}
