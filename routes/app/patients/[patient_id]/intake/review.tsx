import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import PatientReview from '../../../../../components/patients/intake/Review.tsx'
import Buttons, {
  ButtonsContainer,
} from '../../../../../islands/form/buttons.tsx'
import {
  getOrganizationEmployees,
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
import { INTAKE_STEPS } from '../../../../../shared/intake.ts'
import { assertAllPriorStepsCompleted } from '../../../../../util/assertAllPriorStepsCompleted.ts'
import SendToMenu from '../../../../../islands/SendToMenu.tsx'

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

  const { healthWorker, patient } = ctx.state

  const employees = await getOrganizationEmployees(
    {
      ctx,
      organization_id: healthWorker.employment[0].organization.id,
      exclude_health_worker_id: ctx.state.healthWorker.id,
    },
  )

  return (
    <IntakeLayout ctx={ctx}>
      <PatientReview patient={patient} />
      <hr className='my-2' />
      <ButtonsContainer>
        <SendToMenu employees={employees} />
        <Buttons
          submitText='Continue to vitals'
          className='flex-1 max-w-xl '
        />
      </ButtonsContainer>
    </IntakeLayout>
  )
}
