import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import PatientHistoryForm from '../../../../../components/patients/intake/HistoryForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  IntakeContext,
  IntakePage,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'

type HistoryFormValues = {
  past_medical_conditions?: patient_conditions.PastMedicalConditionUpsert[]
  major_surgeries?: patient_conditions.MajorSurgeryUpsert[]
}

function assertIsHistory(
  patient: unknown,
): asserts patient is HistoryFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsHistory,
    )
    return upsertPatientAndRedirect(ctx, {
      ...patient,
      past_medical_conditions: patient.past_medical_conditions || [],
      major_surgeries: patient.major_surgeries || [],
    })
  },
}

export default IntakePage(async function HistoryPage({ ctx, patient }) {
  assert(!patient.is_review)

  const { trx } = ctx.state
  const patient_id = patient.data.id
  const getting_past_medical_conditions = patient_conditions
    .getPastMedicalConditions(trx, { patient_id })
  const getting_major_surgeries = patient_conditions.getMajorSurgeries(trx, {
    patient_id,
  })

  return (
    <PatientHistoryForm
      past_medical_conditions={await getting_past_medical_conditions}
      major_surgeries={await getting_major_surgeries}
    />
  )
})
