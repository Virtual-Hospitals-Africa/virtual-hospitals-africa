import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import * as allergies from '../../../../../db/models/allergies.ts'
import * as patient_allergies from '../../../../../db/models/patient_allergies.ts'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../islands/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'

type ConditionsFormValues = {
  allergies?: { id: string; name: string }[]
  pre_existing_conditions?: patient_conditions.PreExistingConditionUpsert[]
}

function assertIsConditions(
  patient: unknown,
): asserts patient is ConditionsFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const { pre_existing_conditions, allergies, ...patient } =
      await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertIsConditions,
      )
    return upsertPatientAndRedirect(ctx, {
      ...patient,
      pre_existing_conditions: pre_existing_conditions || [],
      allergies: allergies || [],
    })
  },
}

export default async function PreExistingConditionsPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const patient_id = patient.id

  const getting_pre_existing_conditions = patient_conditions
    .getPreExistingConditionsWithDrugs(
      trx,
      { patient_id },
    )

  const getting_allergies = allergies.getAll(trx)
  const getting_patient_allergies = patient_allergies
    .getWithName(
      trx,
      patient_id,
    )

  return (
    <IntakeLayout ctx={ctx}>
      <PatientPreExistingConditions
        allergies={await getting_allergies}
        patient_allergies={await getting_patient_allergies}
        pre_existing_conditions={await getting_pre_existing_conditions}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
