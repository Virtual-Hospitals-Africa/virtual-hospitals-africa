import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400, assertOrRedirect } from '../../../../../util/assertOr.ts'
import {
  assertAgeYearsKnown,
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import * as patient_lifestyle from '../../../../../db/models/patient_lifestyle.ts'
import { assert } from 'std/assert/assert.ts'
import { LifestyleForm } from '../../../../../islands/LifestyleForm.tsx'

type LifestyleFormValues = Record<string, unknown>

function assertIsLifestyle(
  patient: unknown,
): asserts patient is LifestyleFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  // deno-lint-ignore require-await
  async POST(req, ctx) {
    // const patient = await parseRequestAsserts(
    //   ctx.state.trx,
    //   req,
    //   assertIsLifestyle,
    // )
    return upsertPatientAndRedirect(ctx, {})
  },
}

export default async function LifestylePage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const patient_id = patient.id

  const age_years = assertAgeYearsKnown(ctx)

  return (
    <IntakeLayout ctx={ctx}>
      {/* call to database for lifestyle patient information */}
      <LifestyleForm
        age_years={age_years}
        lifestyle={await patient_lifestyle.get(trx, { patient_id })}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
