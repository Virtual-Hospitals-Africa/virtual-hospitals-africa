import redirect from '../../../../../../util/redirect.ts'
import { ExaminationContext } from './examinations/_middleware.tsx'

// deno-lint-ignore require-await
export default async function (_req: Request, ctx: ExaminationContext) {
  if (ctx.state.current_examination) return ctx.next()
  const goto_assessment = ctx.state.next_incomplete_examination ||
    ctx.state.patient_examinations[0]

  const goto = goto_assessment?.slug || 'none'

  const url = new URL(ctx.url)

  url.pathname += '/' + goto
  return redirect(url)
}
