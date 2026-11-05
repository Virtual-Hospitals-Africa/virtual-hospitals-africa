import { assertOr405 } from '../../../../../../../../util/assertOr.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { OpenEncounterWorkflowPostContext } from '../../../../../../../../types.ts'

// deno-lint-ignore require-await
export default async function (
  ctx: OpenEncounterWorkflowPostContext,
) {
  const req = ctx.req

  assertOr405(req.method === 'GET')
  const url = new URL(ctx.url)
  url.pathname += '/measurements'
  return redirect(url)
}
