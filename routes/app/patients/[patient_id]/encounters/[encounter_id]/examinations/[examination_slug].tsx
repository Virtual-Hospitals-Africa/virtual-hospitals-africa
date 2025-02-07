import {
  completeExamination,
  ExaminationContext,
  ExaminationPage,
} from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../../types.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ExaminationContext['state']
> = {
  POST(_req: Request, ctx: ExaminationContext) {
    return completeExamination(ctx)
  },
}

export default ExaminationPage((ctx) => {
  return <p>TODO {ctx.state.current_examination!.display_name}</p>
})
