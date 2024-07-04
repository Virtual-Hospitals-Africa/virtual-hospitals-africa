import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import PatientReview from '../../../../../components/patients/intake/Review.tsx'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
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

// deno-lint-ignore require-await
export default async function ReviewPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(ctx.state.is_review)
  assertAllIntakeStepsCompleted(
    ctx.state.patient.intake_steps_completed,
    ctx.params,
  )

  return (
    <IntakeLayout ctx={ctx}>
      <PatientReview patient={ctx.state.patient} />
    </IntakeLayout>
  )
}
