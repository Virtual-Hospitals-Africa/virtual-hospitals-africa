import z from 'zod'
import { parseRequest } from './parseForm.ts'
import { LoggedInHealthWorkerContext } from '../types.ts'
import db from '../db/db.ts'

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
        .execute((trx) => {
          console.log('starting to execute trx')
          ctx.state.trx = trx
          return Promise.resolve(callback(ctx, form_values))
        })
    },
  }
}
