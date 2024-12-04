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
  error_message: z.string().optional(),
  backoff_until: z.string().datetime().optional(),
  processed_at: z.string().datetime().optional(),
}).refine((data) => {
  if (data.backoff_until) return !!data.error_message && !data.processed_at
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

export async function processEvents(
  trx: TrxOrDb,
  type: string,
  handler: (trx: TrxOrDb, data: EventData) => Promise<void>,
) {
  await trx.transaction().execute(async (trx) => {
    const eventsToProcess = await trx
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
      .where('type', '=', type)
      .forUpdate()
      .skipLocked()
      .select([
        'id',
        'data',
      ])
      .execute()

    for (const eventData of eventsToProcess) {
      try {
        await handler(trx, eventData)
        await upsert(trx, eventData.id, {
          processed_at: new Date().toISOString(),
          backoff_until: undefined,
          error_message: undefined,
        })
      } catch (error) {
        const errorMessage = (error instanceof Error)
          ? error.message
          : 'Error performing the task'
        await upsert(trx, eventData.id, {
          error_message: errorMessage,
          backoff_until: calculateBackoff(),
        })
      }
    }
  })
}

function calculateBackoff() {
  return new Date(Date.now() + 60000).toISOString()
}
