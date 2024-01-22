import { LoggedInHealthWorkerHandler, Maybe } from '../../../../../types.ts'
import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import * as allergies from '../../../../../db/models/allergies.ts'
import * as patient_allergies from '../../../../../db/models/patient_allergies.ts'
import * as patients from '../../../../../db/models/patients.ts'
import redirect from '../../../../../util/redirect.ts'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { IntakeContext, IntakeLayout, nextLink } from './_middleware.tsx'

type ConditionsFormValues = {
  allergies?: { id: number; name: string }[]
  pre_existing_conditions?: patient_conditions.PreExistingConditionUpsert[]
}

function assertIsConditions(
  patient: unknown,
): asserts patient is ConditionsFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler = {
  async POST(req, ctx) {
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const { pre_existing_conditions, allergies, ...patient } =
      await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertIsConditions,
      )
    await patients.upsertIntake(ctx.state.trx, {
      ...patient,
      id: patient_id,
      pre_existing_conditions: pre_existing_conditions || [],
      allergies: allergies || [],
    })

    return redirect(nextLink(ctx))
  },
}

export default async function AddressPage(
  _req: Request,
  ctx: IntakeContext,
) {
  const { healthWorker, patient, trx } = ctx.state
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
        patient={patient}
        allergies={await getting_allergies}
        patient_allergies={await getting_patient_allergies}
        pre_existing_conditions={await getting_pre_existing_conditions}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
