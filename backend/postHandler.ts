import z from 'zod'
import { sql } from 'kysely'
import { parseRequest } from './parseForm.ts'
import { LoggedInHealthWorkerContext } from '../types.ts'
import db from '../db/db.ts'
import { setApplicationName } from './attachTrx.ts'

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
          console.log('starting to execute trx')

          // Tag queries with application_name for AWS RDS Performance Insights
          const tag = `${ctx.req.method}:${ctx.url.pathname}`
          // Note: SET commands don't support parameterized queries, use raw SQL
          await sql.raw(`SET LOCAL application_name = '${tag.replace(/'/g, "''")}'`).execute(trx)

          ctx.state.trx = setApplicationName(ctx, trx)
          return Promise.resolve(callback(ctx, form_values))
        })
    },
  }
}
