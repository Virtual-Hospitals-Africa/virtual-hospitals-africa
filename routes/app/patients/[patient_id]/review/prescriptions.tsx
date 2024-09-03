import * as diagnoses from '../../../../../db/models/diagnoses.ts'
import * as prescriptions from '../../../../../db/models/prescriptions.ts'
import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { assertAllUniqueBy } from '../../../../../util/assertAllUniqueBy.ts'
import PrescriptionsForm from '../../../../../islands/prescriptions/Form.tsx'

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

export default async function PrescriptionsPage(
  _req: Request,
  ctx: ReviewContext,
) {
  const { trx, doctor_review: { review_id } } = ctx.state
  const { patient_diagnoses, patient_prescription } = await promiseProps({
    patient_diagnoses: diagnoses.getFromReview(trx, { review_id }),
    patient_prescription: prescriptions.getFromReview(trx, { review_id }),
  })

  const medications = patient_prescription?.medications || []

  assertAllUniqueBy(medications, 'medication_id')

  return (
    <ReviewLayout ctx={ctx}>
      <PrescriptionsForm
        medications={medications}
        diagnoses={patient_diagnoses}
      />
      <FormButtons />
    </ReviewLayout>
  )
}
