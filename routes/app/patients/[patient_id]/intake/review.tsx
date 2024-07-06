import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import PatientReview from '../../../../../components/patients/intake/Review.tsx'
import {
  IntakeContext,
  IntakePage,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { INTAKE_STEPS } from '../../../../../shared/intake.ts'
import { assertAllPriorStepsCompleted } from '../../../../../util/assertAllPriorStepsCompleted.ts'

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  // deno-lint-ignore require-await
  async POST(_req, ctx) {
    return upsertPatientAndRedirect(ctx, {})
  },
}

const assertAllIntakeStepsCompleted = assertAllPriorStepsCompleted(
  INTAKE_STEPS,
  '/app/patients/:patient_id/intake/:step',
  'completing the intake process',
)

export default IntakePage(
  async function ReviewPage({ ctx, patient }) {
    const patient_review = await patients.getIntakeReviewById(
      ctx.state.trx,
      patient.id,
    )
    assertAllIntakeStepsCompleted(
      patient.intake_steps_completed,
      ctx.params,
    )
    return <PatientReview patient={patient_review} />
  },
)
