import redirect from '../../../../../../util/redirect.ts'
import { GeneralAssessmentsContext } from './general_assessments/_middleware.tsx'

// deno-lint-ignore require-await
export default async function (_req: Request, ctx: GeneralAssessmentsContext) {
  if (ctx.state.current_assessment) return ctx.next()
  const goto_assessment = ctx.state.next_incomplete_assessment ||
    ctx.state.patient_general_assessments[0]
  const url = new URL(ctx.url)
  url.pathname += '/' + goto_assessment.slug
  return redirect(url)
}
