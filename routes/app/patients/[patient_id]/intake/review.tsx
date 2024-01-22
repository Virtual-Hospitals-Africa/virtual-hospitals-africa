import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import redirect from '../../../../../util/redirect.ts'
import PatientReview from '../../../../../components/patients/intake/Review.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { IntakeContext, IntakeLayout } from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'

type ReviewFormValues = { completed_intake: boolean }

function assertIsReview(
  patient: unknown,
): asserts patient is ReviewFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(
    typeof patient.completed_intake === 'boolean' &&
      patient.completed_intake,
  )
}

export const handler: LoggedInHealthWorkerHandler = {
  async POST(req, ctx) {
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsReview,
    )
    await patients.upsertIntake(ctx.state.trx, {
      ...patient,
      id: patient_id,
    })

    return redirect(`/app/patients/${patient_id}/encounters/open/vitals`)
  },
}

// deno-lint-ignore require-await
export default async function ReviewPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(ctx.state.is_review)
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
