import { z } from 'zod'
import { EventData, TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'

export const EventInsert = z.object({
  type: z.string(),
  data: z.object({}),
})

export const parseInsert = EventInsert.parse
export type EventInsert = z.infer<typeof EventInsert>

export async function insert(
  trx: TrxOrDb,
  data: EventInsert,
): Promise<{ id: string }> {
  return await trx
    .insertInto('events')
    .values(data)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export const EventUpsert = z.object({
  error_message: z.string().nullable().optional(),
  retry_count: z.number().int().optional(),
  backoff_until: z.string().datetime().nullable().optional(),
  processed_at: z.string().datetime().optional(),
}).refine((data) => {
  if (data.backoff_until) {
    return !!data.error_message && !data.processed_at && !!data.retry_count
  }
  return !data.error_message && !!data.processed_at
}, {
  message:
    'Invalid state: Ensure that error_message and processed_at are set correctly based on backoff_until.',
})

export const parseUpsert = EventUpsert.parse
export type EventUpsert = z.infer<typeof EventUpsert>

export async function upsert(
  trx: TrxOrDb,
  id: string,
  data: EventUpsert,
): Promise<void> {
  await trx
    .updateTable('events')
    .set(data)
    .where('id', '=', id)
    .execute()
}

export async function selectAll(
  trx: TrxOrDb,
) {
  return await trx
    .selectFrom('events')
    .where((eb) =>
      eb.and([
        eb('processed_at', 'is', null),
        eb.or([
          eb('backoff_until', '<', now),
          eb('backoff_until', 'is', null),
        ]),
      ])
    )
    .selectAll()
    .execute()
}

function calculateBackoff(retryCount: number): string {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  const backoffMs = Math.pow(2, retryCount) * 1000
  return new Date(Date.now() + backoffMs).toISOString()
}

export async function processEvents(
  trx: TrxOrDb,
  type: string,
  handler: (trx: TrxOrDb, data: EventData) => Promise<void>,
  max_retry_count: number = 3,
) {
  await trx.transaction().execute(async (trx) => {
    const eventsToProcess = await trx
      .selectFrom('events')
      .where((eb) =>
        eb.and([
          eb('processed_at', 'is', null),
          eb('retry_count', '<', max_retry_count),
          eb.or([
            eb('backoff_until', '<', now),
            eb('backoff_until', 'is', null),
          ]),
        ])
      )
      .where('type', '=', type)
      .forUpdate()
      .skipLocked()
      .select(['id', 'data', 'retry_count'])
      .execute()

    for (const eventData of eventsToProcess) {
      try {
        await handler(trx, eventData)
        await upsert(trx, eventData.id, {
          processed_at: new Date().toISOString(),
          backoff_until: null,
          error_message: null,
        })
      } catch (error) {
        const errorMessage = (error instanceof Error)
          ? error.message
          : 'Error performing the task'

        const newRetryCount = eventData.retry_count + 1
        const hasReachedMaxRetries = newRetryCount >= max_retry_count

        await upsert(trx, eventData.id, {
          error_message: hasReachedMaxRetries ? null : errorMessage,
          retry_count: newRetryCount,
          backoff_until: hasReachedMaxRetries
            ? null
            : calculateBackoff(eventData.retry_count),
        })
      }
    }
  })
}
