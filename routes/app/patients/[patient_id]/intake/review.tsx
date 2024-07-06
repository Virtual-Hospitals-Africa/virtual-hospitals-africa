import * as patients from '../../../../../db/models/patients.ts'
import PatientReview from '../../../../../components/patients/intake/Review.tsx'
import { IntakePage, postHandler } from './_middleware.tsx'
import { INTAKE_STEPS } from '../../../../../shared/intake.ts'
import { assertAllPriorStepsCompleted } from '../../../../../util/assertAllPriorStepsCompleted.ts'

function assertIsReview(_patient: unknown): asserts _patient is unknown {
}

export const handler = postHandler(assertIsReview)

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
