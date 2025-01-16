import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ReviewContext['state']
> = {
  // deno-lint-ignore require-await
  async POST(_req, ctx: ReviewContext) {
    const completing_step = completeStep(ctx)
    return completing_step
  },
}

// deno-lint-ignore require-await
export default async function RevertPage(
  _req: Request,
  ctx: ReviewContext,
) {
  return (
    <ReviewLayout ctx={ctx}>
      <FormButtons />
    </ReviewLayout>
  )
}
