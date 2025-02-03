import { FreshContext } from '$fresh/server.ts'
import z from 'zod'
import { parseRequest } from './parseForm.ts'
import { TrxOrDb } from '../types.ts'

export function postHandler<
  Context extends FreshContext & {
    state: {
      trx: TrxOrDb
    }
  },
  T extends z.ZodRawShape,
>(
  schema: z.ZodObject<T>,
  callback: (
    req: Request,
    ctx: Context,
    form_values: z.infer<z.ZodObject<T>>,
  ) => Response | Promise<Response>,
) {
  return {
    async POST(req: Request, ctx: Context) {
      const form_values = await parseRequest(ctx.state.trx, req, schema.parse)
      return callback(req, ctx, form_values)
    },
  }
}
