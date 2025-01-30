import { FreshContext } from '$fresh/server.ts'
import z from 'zod'
import { parseRequest } from './parseForm.ts'
import { TrxOrDb } from '../types.ts'

export function postHandler<
  T extends z.ZodRawShape,
  Context extends FreshContext & {
    state: {
      trx: TrxOrDb
    }
  },
>(
  schema: z.ZodObject<T>,
  callback: (
    ctx: Context,
    req: Request,
    form_values: T,
  ) => Response | Promise<Response>,
) {
  return {
    async POST(req: Request, ctx: Context) {
      const form_values = await parseRequest(ctx.state.trx, req, schema.parse)
      // deno-lint-ignore no-explicit-any
      return callback(ctx, req, form_values as any)
    },
  }
}
