import { completeExamination, ExaminationContext, ExaminationPage } from './_middleware.tsx'
import {} from '../../../../../../../../../types.ts'

export const handler = {
  POST(ctx: ExaminationContext) {
    return completeExamination(ctx)
  },
}

export default ExaminationPage((ctx) => {
  return <p>TODO {ctx.state.current_examination!.display_name}</p>
})
