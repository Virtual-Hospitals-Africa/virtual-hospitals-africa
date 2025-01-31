import redirect from '../../../../../../util/redirect.ts'
import { HistoryContext } from './history/_middleware.tsx'

// deno-lint-ignore require-await
export default async function (_req: Request, ctx: HistoryContext) {
  if (ctx.state.current_assessment) return ctx.next()
  console.log(ctx.state)
  const goto_assessment = ctx.state.next_incomplete_assessment ||
    ctx.state.history_assessments[0]
  const url = new URL(ctx.url)
  url.pathname += '/' + goto_assessment.query_slug
  return redirect(url)
}
