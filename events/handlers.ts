import { TrxOrDb } from '../types.ts'

import { sendToHealthWorkerLoggedInChannel } from '../external-clients/slack.ts'
import * as health_workers from '../db/models/health_workers.ts'
// import * as doctor_reviews from '../db/models/doctor_reviews.ts'
import { assert } from 'std/assert/assert.ts'
import { z } from 'zod'
import { debug } from '../util/debug.ts'

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
  ReviewRequested: defineEvent(
    z.object({
      review_request_id: z.string().uuid(),
    }),
    {
      async notifyHealthWorker(_trx, _payload) {
        // const review_request = await doctor_reviews.getRequest()
      },
    },
  ),
  TEST_WORKS_ON_SECOND_TRY: defineEvent(
    z.object({
      foo: z.string().uuid(),
    }),
    {
      // deno-lint-ignore require-await
      async workOnSecondTry(_trx, payload) {
        debug('foo bar')
        if (payload.metadata.error_count === 0) {
          throw new Error('Fails at first')
        }
      },
    },
  ),
  TEST_NEVER_WORKS: defineEvent(
    z.object({
      bar: z.string().uuid(),
    }),
    {
      neverWorks(_trx, _payload) {
        throw new Error('Never Works')
      },
    },
  ),
}

export type EventType = keyof typeof EVENTS

export type EventInsert<ET extends EventType> = {
  type: ET
  data: z.infer<(typeof EVENTS)[ET]['schema']>
}

export type EventInsertRecord = {
  [K in EventType]: EventInsert<K>
}

export type EventInsertAny = EventInsertRecord[keyof EventInsertRecord]

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
      payload: {
        id: string
        data: z.infer<z.ZodObject<T>>
        metadata: { error_count: number }
      },
    ) => Promise<unknown>
  >,
) {
  return {
    schema,
    listeners,
  }
}
