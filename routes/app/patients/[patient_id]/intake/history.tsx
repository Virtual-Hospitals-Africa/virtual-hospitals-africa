import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import PatientHistoryForm from '../../../../../components/patients/intake/HistoryForm.tsx'
import { IntakePage, postHandler } from './_middleware.tsx'
import { z } from 'zod'

type HistoryFormValues = {
  past_medical_conditions: patient_conditions.PastMedicalConditionUpsert[]
  major_surgeries: patient_conditions.MajorSurgeryUpsert[]
}

export const HistorySchema = z.object({
  past_medical_conditions: z.array(
    z.object({
      id: z.string(),
      start_date: z.string(),
      end_date: z.string(),
    }),
  ).default([]),
  major_surgeries: z.array(
    z.object({
      id: z.string(),
      start_date: z.string(),
    }),
  ).default([]),
})

export const handler = postHandler(
  HistorySchema.parse,
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
