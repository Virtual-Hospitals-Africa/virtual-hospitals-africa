import db from '../db/db.ts'
import { EVENTS, isEventType } from './handlers.ts'
import * as events from '../db/models/events.ts'
import { forEach } from '../util/inParallel.ts'
import { TrxOrDb } from '../types.ts'
import { now } from '../db/helpers.ts'

export type EventProcessor = { start(): void; exit(): void }

export async function addListeners(trx: TrxOrDb) {
  const unprocessed = await events.withoutListeners(trx)
  await forEach(unprocessed, async (event) => {
    if (!isEventType(event.type)) {
      return events.markUnrecoverableError(
        trx,
        event.id,
        new Error(`No event with type: ${event.type}`),
      )
    }

    const handler = EVENTS[event.type]
    const parsed = handler.schema.safeParse(event.data)
    if (parsed.error) {
      return events.markUnrecoverableError(
        trx,
        event.id,
        parsed.error,
      )
    }

    const listeners = Object.keys(handler.listeners)
    await trx
      .insertInto('event_listeners')
      .values(listeners.map((listener_name) => ({
        listener_name,
        event_id: event.id,
      })))
      .execute()

    await trx.updateTable('events')
      .where('id', '=', event.id)
      .set({
        listeners_inserted_at: now,
      })
      .execute()
  })
}

export async function processListeners(
  trx: TrxOrDb,
) {
  const unprocessed = await events.selectUnprocessedListeners(trx)

  await forEach(
    unprocessed,
    async (event_listener) => {
      if (!isEventType(event_listener.type)) {
        return events.markUnrecoverableError(
          trx,
          event_listener.event_id,
          new Error(`No event with type: ${event_listener.type}`),
        )
      }

      const handler = EVENTS[event_listener.type]

      const listener = handler.listeners[event_listener.listener_name]

      if (!listener) {
        return events.markErroredListener(
          trx,
          {
            event_listener_id: event_listener.id,
            error_message: 'No such listener found by name',
            error_count: event_listener.error_count + 1,
          },
        )
      }
      try {
        await listener(trx, {
          id: event_listener.event_id,
          // deno-lint-ignore no-explicit-any
          data: event_listener.data as any,
          metadata: {
            error_count: event_listener.error_count,
          },
        })
        await events.processedListener(trx, {
          event_listener_id: event_listener.id,
        })
      } catch (error) {
        console.error(error)
        await events.markErroredListener(trx, {
          event_listener_id: event_listener.id,
          // deno-lint-ignore no-explicit-any
          error_message: (error as any).message,
          error_count: event_listener.error_count + 1,
        })
      }
    },
  )
}

export function createEventProcessor(): EventProcessor {
  let add_listeners_timer: number
  let process_listeners_timer: number

  async function addListenersOnLoop(): Promise<void> {
    await db.transaction().execute(addListeners)
    add_listeners_timer = setTimeout(addListenersOnLoop, 100)
  }
  async function processListenersOnLoop(): Promise<void> {
    await db.transaction().execute(processListeners)
    process_listeners_timer = setTimeout(processListenersOnLoop, 100)
  }
  return {
    start: () => {
      console.log('Starting event processor')
      addListenersOnLoop()
      processListenersOnLoop()
    },
    exit: () => {
      console.log('Stopping event processor')
      clearTimeout(add_listeners_timer)
      clearTimeout(process_listeners_timer)
    },
  }
}

if (import.meta.main) {
  createEventProcessor().start()
}
