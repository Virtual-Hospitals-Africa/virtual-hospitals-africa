import z from 'zod'
import { requestAsRecord } from './parseForm.ts'
import { LoggedInHealthWorkerContext } from '../types.ts'
import db from '../db/db.ts'
import { timeout, TimeoutError } from '../util/timeout.ts'
// import { assert } from 'std/assert/assert.ts'
import { parseWithValues } from '../util/assertMatches.ts'
import { notifications } from '../db/models/notifications.ts'
import { inBackground } from '../util/inBackground.ts'

export function postHandler<
  // deno-lint-ignore no-explicit-any
  Ctx extends LoggedInHealthWorkerContext<any>,
  Schema extends z.ZodType<Record<string, unknown>>,
>(
  schema: Schema,
  callback: (
    ctx: Ctx,
    form_values: z.infer<Schema>,
  ) => Response | Promise<Response>,
) {
  // assert(schema.description, 'All schemas must include a description')
  return {
    async POST(ctx: Ctx) {
      const record = await requestAsRecord(ctx.req, ctx.params)
      const form_values = parseWithValues(schema, record)
      const health_worker_id = ctx.state.health_worker.id
      const patient_encounter_id = z.string().optional().parse(ctx.state.patient_encounter_id)

      return await db
        .transaction()
        .setIsolationLevel('read committed')
        .execute(async (trx) => {
          ctx.state.trx = trx
          // There may not be one, but
          const response = Promise.resolve(callback(ctx, form_values))
          const timer = timeout(10000)
          try {
            return await Promise.race([
              inBackground(
                response,
                () => notifications.markSeenByActionHref(trx, { health_worker_id, patient_encounter_id, action_href: ctx.url.pathname }),
              ),
              timer,
            ])
          } catch (err) {
            if (err instanceof TimeoutError) {
              console.error(`TIMEOUT ${ctx.req.method}:${ctx.url.pathname}`)
            }
            throw err
          } finally {
            timer.cancel()
          }
        })
    },
  }
}
