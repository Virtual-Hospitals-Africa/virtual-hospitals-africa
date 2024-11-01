import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import * as allergies from '../../../../../db/models/allergies.ts'
import * as patient_allergies from '../../../../../db/models/patient_allergies.ts'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import { IntakePage, postHandler } from './_middleware.tsx'
import { z } from 'zod'

type ConditionsFormValues = {
  allergies: { id: string; name: string }[]
  pre_existing_conditions: patient_conditions.PreExistingConditionUpsert[]
}

export const ConditionsSchema = z.object({
  allergies: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
    }).optional(),
  ).optional()
    .transform((allergies) =>
      allergies?.filter((allergy) => allergy !== undefined) || []
    ),
  pre_existing_conditions: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      start_date: z.string().date(),
      medications: z.array(
        z.object({
          id: z.string().optional(),
          name: z.string().optional(),
          medication_id: z.string().optional(),
          manufactured_medication_id: z.string().optional(),
          strength: z.number(),
          route: z.string(),
          dosage: z.number(),
          intake_frequency: z.string(),
          start_date: z.string().date(),
          end_date: z.string().date().optional(),
          special_instructions: z.string().optional(),
        })
          .refine(
            (medication) =>
              medication.medication_id || medication.manufactured_medication_id,
            {
              message:
                'Must provide either medication or manufactured medication',
              path: ['medication_id'],
            },
          ),
      ).optional(),
      comorbidities: z.array(
        z.object({
          id: z.string(),
          start_date: z.string().date().optional(),
        }),
      ).optional(),
    }),
  ).default([]),
})

export const handler = postHandler(
  ConditionsSchema.parse,
  async function updateConditions(ctx, patient_id, form_values) {
    const upserting_conditions = patient_conditions.upsertPreExisting(
      ctx.state.trx,
      {
        patient_id,
        employment_id: ctx.state.encounter_provider.employment_id,
        patient_conditions: form_values.pre_existing_conditions,
      },
    )

    const upserting_allergies = patient_allergies.upsert(
      ctx.state.trx,
      patient_id,
      form_values.allergies,
    )

    await Promise.all([upserting_conditions, upserting_allergies])
  },
)

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
