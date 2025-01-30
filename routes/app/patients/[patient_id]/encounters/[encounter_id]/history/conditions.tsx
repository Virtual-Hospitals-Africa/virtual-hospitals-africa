import * as patient_conditions from '../../../../../../../db/models/patient_conditions.ts'
import * as patient_allergies from '../../../../../../../db/models/patient_allergies.ts'
import * as examinations from '../../../../../../../db/models/examinations.ts'
import PatientPreExistingConditions from '../../../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import { z } from 'zod'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import generateUUID from '../../../../../../../util/uuid.ts'
import { completeStep, EncounterContext } from '../_middleware.tsx'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { HistoryPage } from './_middleware.tsx'

export const ConditionsSchema = z.object({
  allergies: z.array(
    z.object({
      patient_allergy_id: z.string().uuid().optional().transform((value) =>
        value || generateUUID()
      ),
      snomed_concept_id: z.number(),
      snomed_english_term: z.string(),
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
          id: z.string().uuid().optional(),
          name: z.string().optional(),
          medication_id: z.string().uuid().optional(),
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

export const handler = {
  async POST(req: Request, ctx: EncounterContext) {
    // TODO, parallelize
    const completing_step = await completeStep(ctx)
    const form_values = await parseRequest(
      ctx.state.trx,
      req,
      ConditionsSchema.parse,
    )

    const examination = await examinations.createIfNoneExists(ctx.state.trx, {
      patient_id: ctx.state.patient.id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      examination_identifier: 'history_pre_existing_conditions',
    })

    const upserting_conditions = patient_conditions.upsertPreExisting(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        patient_examination_id: examination.id,
        patient_conditions: form_values.pre_existing_conditions,
      },
    )

    const upserting_allergies = patient_allergies.upsert(
      ctx.state.trx,
      ctx.state.patient.id,
      form_values.allergies,
    )

    await Promise.all([upserting_conditions, upserting_allergies])

    return completing_step
  },
}

export default HistoryPage(async function ConditionsPage(ctx) {
  const { trx, patient } = ctx.state
  const patient_id = patient.id

  const { pre_existing_conditions, intake_patient_allergies } =
    await promiseProps({
      pre_existing_conditions: patient_conditions
        .getPreExistingConditionsWithDrugs(
          trx,
          { patient_id },
        ),
      intake_patient_allergies: patient_allergies.getWithName(
        trx,
        patient_id,
      ),
    })

  return (
    <PatientPreExistingConditions
      pre_existing_conditions={pre_existing_conditions}
      patient_allergies={intake_patient_allergies}
    />
  )
})
