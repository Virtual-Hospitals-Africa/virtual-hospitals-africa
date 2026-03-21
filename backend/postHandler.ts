import z from 'zod'
import { requestAsRecord } from './parseForm.ts'
import { LoggedInHealthWorkerContext } from '../types.ts'
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
      return callback(ctx, form_values)
    },
  }
}
