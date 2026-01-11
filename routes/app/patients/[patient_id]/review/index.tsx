import { assert } from 'std/assert/assert.ts'
import { LoggedInHealthWorkerContext } from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import { DOCTOR_REVIEW_STEPS } from '../../../../../shared/review.ts'
import { doctor_reviews } from '../../../../../db/models/doctor_reviews.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { Handlers } from 'fresh/compat'

export const handler: Handlers<unknown, LoggedInHealthWorkerContext['state']> = {
  GET: async (ctx) => {
    const { doctor_review } = await doctor_reviews.addSelfAsReviewer(
      ctx.state.trx,
      {
        patient_id: getRequiredUUIDParam(ctx, 'patient_id'),
        health_worker: ctx.state.health_worker,
      },
    )

    if (!doctor_review.completed) {
      const first_incomplete_step = DOCTOR_REVIEW_STEPS.find((step) => !doctor_review.steps_completed.includes(step))
      assert(first_incomplete_step)
      return redirect(
        `/app/patients/${ctx.params.patient_id}/review/${first_incomplete_step}`,
      )
    }
    return redirect(
      `/app/patients/${ctx.params.patient_id}/review/clinical_notes`,
    )
  },
}
