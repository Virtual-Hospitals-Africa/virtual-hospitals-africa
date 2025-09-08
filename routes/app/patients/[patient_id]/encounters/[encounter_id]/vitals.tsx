import { assertOr405 } from '../../../../../../util/assertOr.ts'
import redirect from '../../../../../../util/redirect.ts'
import { EncounterContext } from './_middleware.tsx'

// deno-lint-ignore require-await
export default async function (req: Request, ctx: EncounterContext) {
  assertOr405(req.method === 'GET')
  const url = new URL(ctx.url)
  url.pathname += '/measurements'
  return redirect(url)
}
