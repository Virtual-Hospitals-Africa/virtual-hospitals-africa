import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
// import PatientLifestyleForm from '../../../../../components/patients/intake/LifestyleForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'

type LifestyleFormValues = Record<string, unknown>

function assertIsLifestyle(
  patient: unknown,
): asserts patient is LifestyleFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsLifestyle,
    )
    return upsertPatientAndRedirect(ctx, patient)
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
