import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { recommended_dose_calculator } from '../../../../../../../../db/models/recommended_dose_calculator.ts'
import { RecommendedDosesResults } from '../../../../../../../../components/RecommendedDosesResults.tsx'
import { assertAllPriorStepsCompleted, completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { positiveRecordsFromEncounter } from '../../../../../../../../shared/recommended_dose_calculator/patient_case_from_encounter.ts'
import { PatientCaseSchema } from '../../../../../../../../shared/recommended_doses.ts'

export const TriageRecommendedDosesSchema = z.object({})

export const handler = postHandler(
  TriageRecommendedDosesSchema,
  (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

export default OpenEncounterWorkflowPage(async function TriageRecommendedDosesPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const {
    trx,
    patient,
    patient_age_determination,
    this_visit_diagnoses,
    this_visit_findings,
  } = ctx.state

  const positive_records = Array.from(positiveRecordsFromEncounter({
    this_visit_diagnoses,
    this_visit_findings,
  }))

  const positive_record_snomed_concept_ids = positive_records.map((r) => r.specific_snomed_concept_id)

  const patient_case = PatientCaseSchema.parse({
    sex: patient.sex,
    dob: patient.date_of_birth,
    height_cm: patient.most_recent_height?.cm,
    weight_kg: patient.most_recent_weight?.kg,
    snomed_concept_ids: positive_record_snomed_concept_ids,
  })

  const lookup = await recommended_dose_calculator.lookup(trx, patient_case)

  return {
    next_step_text: 'Continue to route patient',
    children: (
      <div class='flex flex-col gap-4'>
        <h2 class='text-lg font-semibold text-gray-900'>Suggested medication doses</h2>
        <p class='text-sm text-gray-600'>
          Based on this visit&apos;s patient details, findings, and system diagnoses. Review each suggestion before prescribing.
        </p>
        <RecommendedDosesResults
          patient_case={patient_case}
          lookup={lookup}
        />
      </div>
    ),
  }
})
