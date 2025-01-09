import db from '../db/db.ts'
import { EVENTS, isEventType } from './handlers.ts'
import * as events from '../db/models/events.ts'
import { forEach } from '../util/inParallel.ts'

export type EventProcessor = { start(): void; exit(): void }

export function createEventProcessor(): EventProcessor {
  let timer: number

  function processEvents(): Promise<void> {
    return db.transaction().execute(async (trx) => {
      const unprocessed = await events.selectUnprocessed(trx)
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

        const error_messages: string[] = []
        const errored_listeners: string[] = []
        const processed_listeners: string[] = event.processed_listeners
        await forEach(
          Object.entries(handler.listeners),
          async ([listener_name, listener]) => {
            const already_ran_listener = processed_listeners.includes(
              listener_name,
            )

            if (already_ran_listener) return

            await listener(trx, {
              id: event.id,
              data: parsed.data,
            })
              .then(() => {
                processed_listeners.push(listener_name)
              })
              // deno-lint-ignore no-explicit-any
              .catch((error: any) => {
                console.error(listener_name, error)
                error_messages.push(`${listener_name}: ${error.message}`)
                errored_listeners.push(listener_name)
              })
          },
        )

        if (errored_listeners.length) {
          return events.markErroredListeners(trx, event.id, {
            errored_listeners,
            processed_listeners,
            error_message: error_messages.join('\n\n'),
            error_count: event.error_count + 1,
          })
        }

        return events.processed(trx, event.id, processed_listeners)
      })

      timer = setTimeout(processEvents, 100)
    })
  }
  return {
    start: () => {
      console.log('Starting event processor')
      processEvents()
    },
    exit: () => {
      console.log('Stopping event processor')
      clearTimeout(timer)
    },
  }
}

if (import.meta.main) {
  createEventProcessor().start()
}
