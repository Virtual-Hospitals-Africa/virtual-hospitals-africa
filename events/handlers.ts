import { TrxOrDb } from '../types.ts'

import { sendToHealthWorkerLoggedInChannel } from '../external-clients/slack.ts'
import * as health_workers from '../db/models/health_workers.ts'
import { assert } from 'std/assert/assert.ts'
import { z } from 'zod'

export const EVENTS = {
  HealthWorkerFirstLoggedIn: defineEvent(
    z.object({
      health_worker_id: z.string().uuid(),
    }),
    {
      async notifySlack(trx, payload) {
        const { health_worker_id } = payload.data
        const health_worker = await health_workers.getEmployed(trx, {
          health_worker_id,
        })
        assert(health_worker, 'Health worker not found')

        const message =
          `Health worker ${health_worker.name} has logged in for the first time`
        await sendToHealthWorkerLoggedInChannel(message)
      },
    },
  ),
  PatientIntake: defineEvent(
    z.object({
      patient_id: z.string().uuid(),
    }),
    {},
  ),
  AddToWaitingRoom: defineEvent(
    z.object({
      organization_id: z.string().uuid(),
      patient_encounter_id: z.string().uuid(),
    }),
    {},
  ),
  PatientNextOfKinSet: defineEvent(
    z.object({
      patient_id: z.string().uuid(),
    }),
    {},
  ),
}

export type EventType = keyof typeof EVENTS

export type EventInsert<ET extends EventType> = {
  type: ET
  data: z.infer<(typeof EVENTS)[ET]['schema']>
}

export type EventInsertAny = EventInsert<EventType>

export function isEventType(
  event_type: string,
): event_type is EventType {
  return event_type in EVENTS
}

export function defineEvent<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  listeners: Record<
    string,
    (
      trx: TrxOrDb,
      payload: { id: string; data: z.infer<z.ZodObject<T>> },
    ) => Promise<unknown>
  >,
) {
  return {
    schema,
    listeners,
  }
}
