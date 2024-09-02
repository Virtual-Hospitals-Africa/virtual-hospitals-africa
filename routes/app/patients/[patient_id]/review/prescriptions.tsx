// import * as diagnoses from '../../../../../db/models/diagnoses.ts'
// import * as prescriptions from '../../../../../db/models/prescriptions.ts'
import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
// import { promiseProps } from '../../../../../util/promiseProps.ts'

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
export default async function PrescriptionsPage(
  _req: Request,
  ctx: ReviewContext,
) {
  // const { trx, doctor_review: { review_id } } = ctx.state
  // const { patient_diagnoses } = await promiseProps({
  //   patient_diagnoses: diagnoses.getFromReview(trx, { review_id }),
  //   patient_prescriptions: prescriptions.getFromReview(trx, { review_id }),
  // })

  return (
    <ReviewLayout ctx={ctx}>
      <FormButtons />
    </ReviewLayout>
  )
}
