import redirect from '../../../../../../util/redirect.ts'
import { EncounterContext } from './_middleware.tsx'

// deno-lint-ignore require-await
export default async function (_req: Request, ctx: EncounterContext) {
  const url = new URL(ctx.url)

  url.pathname += '/measurements'
  return redirect(url)
}
