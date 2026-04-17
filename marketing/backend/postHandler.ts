import z from 'zod'
import { Context } from 'fresh'
import { requestAsRecord } from '../../backend/parseForm.ts'

export function postHandler<
  // deno-lint-ignore no-explicit-any
  Ctx extends Context<any>,
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
      const record = await requestAsRecord(ctx.req)
      const form_values = schema.parse(record) as z.infer<Schema>
      return await callback(ctx, form_values)
    },
  }
}
