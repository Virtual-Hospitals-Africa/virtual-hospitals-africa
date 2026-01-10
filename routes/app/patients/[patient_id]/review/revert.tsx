import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'

import FormButtons from '../../../../../islands/form/buttons.tsx'
import { events } from '../../../../../db/models/events.ts'
import { complete } from '../../../../../db/models/doctor_reviews.ts'
import redirect from '../../../../../util/redirect.ts'

export const handler = {
  async POST(ctx: ReviewContext) {
    const { review_id } = ctx.state.doctor_review
    await Promise.all([
      complete(ctx.state.trx, { review_id }),
      completeStep(ctx),
      events.insert(ctx.state.trx, {
        type: 'DoctorReviewCompleted',
        data: {
          review_id,
        },
      }),
    ])

    const success = encodeURIComponent(
      'Thanks for your review! The original requester has been notified 🩺',
    )
    return redirect(
      `/app/organizations/${ctx.state.reviewing_via_employment.organization_id}/waiting_room?success=${success}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function RevertPage(
  ctx: ReviewContext,
) {
  return (
    <ReviewLayout ctx={ctx}>
      <FormButtons />
    </ReviewLayout>
  )
}
