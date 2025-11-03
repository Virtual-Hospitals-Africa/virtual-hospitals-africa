import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'

import FormButtons from '../../../../../islands/form/buttons.tsx'
import * as events from '../../../../../db/models/events.ts'
import { complete } from '../../../../../db/models/doctor_reviews.ts'
import redirect from '../../../../../util/redirect.ts'

export const handler = {
  async POST(ctx: ReviewContext) {
    const { review_id, requested_by, employment_id, patient } =
      ctx.state.doctor_review
    await Promise.all([
      complete(ctx.state.trx, { review_id }),
      completeStep(ctx),
      events.insert(ctx.state.trx, {
        type: 'DoctorReviewCompleted',
        data: {
          review_id,
          requested_by,
          employment_id,
          patient_id: patient.id,
          patient_name: patient.name,
          doctor_name: ctx.state.health_worker.name,
          doctor_avatar_url: ctx.state.health_worker.avatar_url,
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
