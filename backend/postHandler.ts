import z from 'zod'
import { requestAsRecord } from './parseForm.ts'
import { LoggedInHealthWorkerContext } from '../types.ts'
import db from '../db/db.ts'
import { timeout, TimeoutError } from '../util/timeout.ts'
// import { assert } from 'std/assert/assert.ts'
import { parseWithValues } from '../util/assertMatches.ts'

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
      const record = await requestAsRecord(ctx.req)
      const form_values = parseWithValues(schema, record)

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
