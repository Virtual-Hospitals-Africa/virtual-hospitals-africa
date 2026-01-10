import { patient_conditions } from '../../../../../../../../../db/models/patient_conditions.ts'
import { patient_allergies } from '../../../../../../../../../db/models/patient_allergies.ts'
import { examinations } from '../../../../../../../../../db/models/examinations.ts'
import PatientPreExistingConditions from '../../../../../../../../../components/patients/registration/PreExistingConditionsForm.tsx'
import { z } from 'zod'
import { promiseProps } from '../../../../../../../../../util/promiseProps.ts'
import generateUUID from '../../../../../../../../../util/uuid.ts'
import { parseRequest } from '../../../../../../../../../backend/parseForm.ts'
import {
  completeAssessment,
  HistoryContext,
  HistoryPage,
} from './_middleware.tsx'
import {
  positive_decimal,
  snomed_concept_id,
} from '../../../../../../../../../util/validators.ts'

export const ConditionsSchema = z.object({
  allergies: z.array(
    z.object({
      patient_allergy_id: z.string().uuid().optional().transform((value) =>
        value || generateUUID()
      ),
      snomed_concept_id,
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
          route: z.string(),
          strength: positive_decimal.transform((d) => d.toFixed()),
          dosage: positive_decimal.transform((d) => d.toFixed()),
          registration_frequency: z.string(),
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
  async POST(ctx: HistoryContext) {
    const req = ctx.req

    // TODO, parallelize
    const completing_assessment = await completeAssessment(ctx)
    const form_values = await parseRequest(
      req,
      ConditionsSchema.parse,
    )

    const examination = await examinations.createCompletedIfNoneExists(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        patient_encounter_id: ctx.state.encounter.patient_encounter_id,
        patient_encounter_employee_id:
          ctx.state.encounter_employee_presence.patient_encounter_employee_id,
        examination_identifier:
          ctx.state.current_assessment.examination_identifier,
      },
    )

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

    return completing_assessment
  },
}

export default HistoryPage(async function ConditionsPage(ctx) {
  const { trx, patient } = ctx.state
  const patient_id = patient.id

  const { pre_existing_conditions, registration_patient_allergies } =
    await promiseProps({
      pre_existing_conditions: patient_conditions
        .getPreExistingConditionsWithDrugs(
          trx,
          { patient_id },
        ),
      registration_patient_allergies: patient_allergies.getWithName(
        trx,
        patient_id,
      ),
    })

  return (
    <PatientPreExistingConditions
      pre_existing_conditions={pre_existing_conditions}
      patient_allergies={registration_patient_allergies}
    />
  )
})
