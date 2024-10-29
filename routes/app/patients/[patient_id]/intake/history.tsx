import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import PatientHistoryForm from '../../../../../components/patients/intake/HistoryForm.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { IntakePage, postHandlerAsserts } from './_middleware.tsx'

type HistoryFormValues = {
  past_medical_conditions: patient_conditions.PastMedicalConditionUpsert[]
  major_surgeries: patient_conditions.MajorSurgeryUpsert[]
}

function assertIsHistory(
  patient: unknown,
): asserts patient is HistoryFormValues {
  assertOr400(isObjectLike(patient))
  patient.past_medical_conditions = patient.past_medical_conditions || []
  patient.major_surgeries = patient.major_surgeries || []
}

export const handler = postHandlerAsserts(
  assertIsHistory,
  async function updateHistory(ctx, patient_id, form_values) {
    const upserting_past_medical_conditions = patient_conditions
      .upsertPastMedical(
        ctx.state.trx,
        {
          patient_id,
          employment_id: ctx.state.encounter_provider.employment_id,
          patient_conditions: form_values.past_medical_conditions,
        },
      )

    const upserting_major_surgeries = patient_conditions.upsertMajorSurgeries(
      ctx.state.trx,
      {
        patient_id,
        employment_id: ctx.state.encounter_provider.employment_id,
        major_surgeries: form_values.major_surgeries,
      },
    )

    await Promise.all([
      upserting_past_medical_conditions,
      upserting_major_surgeries,
    ])
  },
)

export default IntakePage(async function HistoryPage({ ctx, patient }) {
  const { trx } = ctx.state
  const patient_id = patient.id
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
