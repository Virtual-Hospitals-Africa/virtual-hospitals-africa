import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'

import FormButtons from '../../../../../islands/form/buttons.tsx'

export const handler = {
  // deno-lint-ignore require-await
  async POST(ctx: ReviewContext) {
    const completing_step = completeStep(ctx)
    return completing_step
  },
}

// deno-lint-ignore require-await
export default async function ReferralPage(
  ctx: ReviewContext,
) {
  return (
    <ReviewLayout ctx={ctx}>
      <FormButtons />
    </ReviewLayout>
  )
}
