import z from 'zod'
import { parseRequest } from './parseForm.ts'
import { LoggedInHealthWorkerContext } from '../types.ts'
import db from '../db/db.ts'

import { timeout, TimeoutError } from '../util/timeout.ts'

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
  return {
    async POST(ctx: Ctx) {
      const form_values = await parseRequest(
        ctx.req,
        schema.parse,
      )

      return await db
        .transaction()
        .setIsolationLevel('read committed')
        .execute(async (trx) => {
          ctx.state.trx = trx
          const response = Promise.resolve(callback(ctx, form_values))
          const timer = timeout(10000)
          try {
            return await Promise.race([response, timer])
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
