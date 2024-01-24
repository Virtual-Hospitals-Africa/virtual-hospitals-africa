import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import PatientReview from '../../../../../components/patients/intake/Review.tsx'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
import { INTAKE_STEPS } from '../../../../../shared/intake.ts'
import redirect from '../../../../../util/redirect.ts'
import words from '../../../../../util/words.ts'
import capitalize from '../../../../../util/capitalize.ts'

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  // deno-lint-ignore require-await
  async POST(_req, ctx) {
    return upsertPatientAndRedirect(ctx, {})
  },
}

// deno-lint-ignore require-await
export default async function ReviewPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(ctx.state.is_review)

  const steps_completed = new Set(ctx.state.patient.intake_steps_completed)
  const incomplete = INTAKE_STEPS.find((step) =>
    step !== 'review' && !steps_completed.has(step)
  )
  if (incomplete) {
    const is_plural = incomplete.endsWith('s')
    const pretty_name = is_plural ? incomplete : incomplete + ' information'
    const warning = encodeURIComponent(
      `Please fill out the patient's ${
        pretty_name.replace('_', ' ')
      } completing the review process`,
    )
    return redirect(
      `/app/patients/${ctx.params.patient_id}/intake/${incomplete}?warning=${warning}`,
    )
  }

  const { healthWorker, patient } = ctx.state

  return (
    <IntakeLayout ctx={ctx}>
      <PatientReview patient={patient} />
      <hr className='my-2' />
      <Buttons
        submitText='Continue to vitals'
        cancel={{
          href: `/app/facilities/${
            healthWorker.employment[0].facility.id
          }/waiting-room/add?patient_id=${patient.id}&intake=completed`,
          text: 'Add patient to waiting room',
        }}
      />
    </IntakeLayout>
  )
}
