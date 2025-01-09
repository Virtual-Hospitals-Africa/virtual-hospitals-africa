import { TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'
import { EventInsertAny, EVENTS } from '../../events/handlers.ts'

export function insert(
  trx: TrxOrDb,
  { type, data }: EventInsertAny,
): Promise<{ id: string }> {
  return trx
    .insertInto('events')
    .values({
      type,
      data: EVENTS[type].schema.parse(data),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function selectUnprocessed(
  trx: TrxOrDb,
  opts: {
    max_error_count?: number
    limit?: number
  } = {},
) {
  const { max_error_count = 3, limit = 5 } = opts
  return trx
    .selectFrom('events')
    .where('processed_at', 'is', null)
    .where('error_count', '<', max_error_count)
    .where('error_no_retry', '=', false)
    .where((eb) =>
      eb.or([
        eb('backoff_until', '<', now),
        eb('backoff_until', 'is', null),
      ])
    )
    .forUpdate()
    .skipLocked()
    .select([
      'id',
      'type',
      'data',
      'error_count',
      'errored_listeners',
      'processed_listeners',
    ])
    .limit(limit)
    .execute()
}

export function processed(
  trx: TrxOrDb,
  id: string,
  processed_listeners: string[],
) {
  return trx
    .updateTable('events')
    .set({
      error_message: null,
      error_no_retry: false,
      errored_listeners: [],
      backoff_until: null,
      processed_at: now,
      processed_listeners,
    })
    .where('id', '=', id)
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
    .set({
      error_message: error.message,
      error_no_retry: true,
      errored_listeners: [],
      backoff_until: null,
      processed_at: null,
    })
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

export function markErroredListeners(
  trx: TrxOrDb,
  id: string,
  {
    error_count,
    error_message,
    errored_listeners,
    processed_listeners,
  }: {
    error_count: number
    error_message: string
    errored_listeners: string[]
    processed_listeners: string[]
  },
) {
  return trx
    .updateTable('events')
    .set({
      error_count,
      error_message,
      errored_listeners,
      processed_listeners,
      error_no_retry: false,
      processed_at: null,
      backoff_until: calculateBackoff(error_count),
    })
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}
