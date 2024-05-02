import { assert } from 'std/assert/assert.ts'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import redirect from '../../../../util/redirect.ts'
import { DOCTOR_REVIEW_STEPS } from '../../../../shared/review.ts'
import { addSelfAsReviewer } from '../../../../db/models/doctor_reviews.ts'
import { getRequiredParam } from '../../../../util/getParam.ts'

export default async function PatientPage(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const { doctor_review } = await addSelfAsReviewer(ctx.state.trx, {
    patient_id: getRequiredParam(ctx, 'patient_id'),
    health_worker: ctx.state.healthWorker,
  })

  if (!doctor_review.completed) {
    const first_incomplete_step = DOCTOR_REVIEW_STEPS.find((step) =>
      !doctor_review.steps_completed.includes(step)
    )
    assert(first_incomplete_step)
    return redirect(
      `/app/patients/${ctx.params.patient_id}/review/${first_incomplete_step}`,
    )
  }
  return redirect(
    `/app/patients/${ctx.params.patient_id}/review/clinical_notes`,
  )
}
