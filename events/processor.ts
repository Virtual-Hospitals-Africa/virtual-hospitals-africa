import db from '../db/db.ts'
import { eventHandlers } from './handlers.ts'
import * as events from '../db/models/events.ts'
import { EventType } from '../types.ts'

export type EventProcessor = { start(): void; exit(): void }

export function createEventProcessor(): EventProcessor {
  let timer: number

  async function processEvents(): Promise<void> {
    try {
      // Process each event type
      for (const eventType of Object.keys(eventHandlers)) {
        await events.processEvents(
          db,
          eventType,
          async (trx, event) => {
            const handler = eventHandlers[eventType as EventType]
            if (!handler) {
              throw new Error(`No handler found for event type: ${eventType}`)
            }
            await handler(trx, event)
          },
        )
      }
    } catch (error) {
      console.error('Error processing events:', error)
    }
    timer = setTimeout(processEvents, 100)
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
