import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import * as patient_age from '../../../../../db/models/patient_age.ts'
import * as patient_occupation from '../../../../../db/models/patient_occupations.ts'
import PatientOccupationForm from '../../../../../components/patients/intake/OccupationForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400, assertOrRedirect } from '../../../../../util/assertOr.ts'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'

type OccupationFormValues = {
  // deno-lint-ignore no-explicit-any
  occupation: any
}

function assertIsOccupation(
  patient: unknown,
): asserts patient is OccupationFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsOccupation,
    )
    return upsertPatientAndRedirect(ctx, { occupation: patient.occupation })
  },
}

export default async function OccupationPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const patient_id = patient.id

  const getting_occupation = patient_occupation.get(trx, { patient_id })
  const age = await patient_age.get(trx, { patient_id })

  const warning = encodeURIComponent(
    "Please fill out the patient's personal information beforehand.",
  )
  assertOrRedirect(
    age,
    `/app/patients/${patient_id}/intake/personal?warning=${warning}`,
  )

  return (
    <IntakeLayout ctx={ctx}>
      <PatientOccupationForm
        patient={patient}
        patientAge={age}
        occupation={await getting_occupation}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
