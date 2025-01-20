import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import * as events from '../../../../../db/models/events.ts'
import { complete } from '../../../../../db/models/doctor_reviews.ts'
import redirect from '../../../../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ReviewContext['state']
> = {
  async POST(_req, ctx: ReviewContext) {
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
  _req: Request,
  ctx: ReviewContext,
) {
  return (
    <ReviewLayout ctx={ctx}>
      <FormButtons />
    </ReviewLayout>
  )
}
