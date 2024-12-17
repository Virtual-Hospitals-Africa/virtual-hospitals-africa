import { EventData, TrxOrDb, EventType, HealthWorkerFirstLoggedInData } from '../types.ts'
import { sendToHealthWorkerLoggedInChannel } from '../external-clients/slack.ts'
import * as health_workers from '../db/models/health_workers.ts'
import { assert } from 'std/assert/assert.ts';

export type EventHandler = (trx: TrxOrDb, event: EventData) => Promise<void>

export const eventHandlers: Record<EventType, EventHandler> = {
  [EventType.HealthWorkerFirstLoggedIn]: async (trx, event) => {
    const { health_worker_id } = event.data as HealthWorkerFirstLoggedInData
    const health_worker = await health_workers.getEmployed(trx, { health_worker_id })
    assert(health_worker, 'Health worker not found')

    const message = `Health worker ${health_worker.name} has logged in for the first time`
    await sendToHealthWorkerLoggedInChannel(message)
  },
}
