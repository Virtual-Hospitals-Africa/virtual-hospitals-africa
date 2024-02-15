import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400, assertOrRedirect } from '../../../../../util/assertOr.ts'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import * as patient_lifestyle from '../../../../../db/models/patient_lifestyle.ts'
import * as patient_age from '../../../../../db/models/patient_age.ts'
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

  const getting_lifestyle = patient_lifestyle.get(trx, { patient_id })
  const age = await patient_age.getYears(trx, { patient_id })

  const warning = encodeURIComponent(
    "Please fill out the patient's personal information beforehand.",
  )
  assertOrRedirect(
    age != null,
    `/app/patients/${patient_id}/intake/personal?warning=${warning}`,
  )

  return (
    <IntakeLayout ctx={ctx}>
      {/* call to database for lifestyle patient information */}
      <LifestyleForm
        age={age}
        lifestyle={await getting_lifestyle}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
