import { LoggedInHealthWorkerHandler, Maybe } from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import redirect from '../../../../../util/redirect.ts'
// import PatientLifestyleForm from '../../../../../components/patients/intake/LifestyleForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { IntakeContext, IntakeLayout, nextLink } from './_middleware.tsx'

type LifestyleFormValues = Record<string, unknown>

function assertIsLifestyle(
  patient: unknown,
): asserts patient is LifestyleFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler = {
  async POST(req, ctx) {
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsLifestyle,
    )
    await patients.upsertIntake(ctx.state.trx, {
      ...patient,
      id: patient_id,
    })

    return redirect(nextLink(ctx))
  },
}

// deno-lint-ignore require-await
export default async function LifestylePage(
  _req: Request,
  ctx: IntakeContext,
) {
  return (
    <IntakeLayout ctx={ctx}>
      TODO
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
