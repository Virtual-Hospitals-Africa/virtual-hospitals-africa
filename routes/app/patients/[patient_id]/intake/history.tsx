import { LoggedInHealthWorkerHandler, Maybe } from '../../../../../types.ts'
import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import * as patients from '../../../../../db/models/patients.ts'
import redirect from '../../../../../util/redirect.ts'
import PatientHistoryForm from '../../../../../components/patients/intake/HistoryForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { IntakeContext, IntakeLayout, nextLink } from './_middleware.tsx'
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

export const handler: LoggedInHealthWorkerHandler = {
  async POST(req, ctx) {
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsHistory,
    )
    await patients.upsertIntake(ctx.state.trx, {
      ...patient,
      id: patient_id,
      past_medical_conditions: patient.past_medical_conditions || [],
      major_surgeries: patient.major_surgeries || [],
    })

    return redirect(nextLink(ctx))
  },
}

export default async function HistoryPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const patient_id = patient.id
  const getting_past_medical_conditions = patient_conditions
    .getPastMedicalConditions(trx, { patient_id })
  const getting_major_surgeries = patient_conditions.getMajorSurgeries(trx, {
    patient_id,
  })

  return (
    <IntakeLayout ctx={ctx}>
      <PatientHistoryForm
        patient={patient}
        pastMedicalConditions={await getting_past_medical_conditions}
        majorSurgeries={await getting_major_surgeries}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
