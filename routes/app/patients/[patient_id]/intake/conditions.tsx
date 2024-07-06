import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import * as allergies from '../../../../../db/models/allergies.ts'
import * as patient_allergies from '../../../../../db/models/patient_allergies.ts'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { IntakePage, postHandler } from './_middleware.tsx'

type ConditionsFormValues = {
  allergies?: { id: string; name: string }[]
  pre_existing_conditions?: patient_conditions.PreExistingConditionUpsert[]
}

function assertIsConditions(
  patient: unknown,
): asserts patient is ConditionsFormValues {
  assertOr400(isObjectLike(patient))
  patient.pre_existing_conditions = patient.pre_existing_conditions || []
  patient.allergies = patient.allergies || []
}

export const handler = postHandler(assertIsConditions)

export default IntakePage(async function ConditionsPage({ ctx, patient }) {
  const { trx } = ctx.state
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
    <PatientPreExistingConditions
      allergies={await getting_allergies}
      patient_allergies={await getting_patient_allergies}
      pre_existing_conditions={await getting_pre_existing_conditions}
    />
  )
})
