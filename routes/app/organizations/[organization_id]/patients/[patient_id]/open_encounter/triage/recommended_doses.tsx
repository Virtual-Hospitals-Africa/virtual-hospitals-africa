import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { recommended_dose_calculator } from '../../../../../../../../db/models/recommended_dose_calculator.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import { RecommendedDosesResults } from '../../../../../../../../components/RecommendedDosesResults.tsx'
import { assertAllPriorStepsCompleted, completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import {
  buildPatientCaseFromEncounter,
  snomedConceptIdsFromEncounter,
} from '../../../../../../../../shared/recommended_dose_calculator/patient_case_from_encounter.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from '../../../../../../../../shared/vitals.ts'

export const TriageRecommendedDosesSchema = z.object({})

export const handler = postHandler(
  TriageRecommendedDosesSchema,
  (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

function missingPatientDetailsMessage(
  missing: Array<'dob' | 'sex' | 'height_cm' | 'weight_kg'>,
) {
  const labels = missing.map((field) => {
    switch (field) {
      case 'dob':
        return 'date of birth (registration)'
      case 'sex':
        return 'sex recorded as male or female (registration)'
      case 'height_cm':
        return 'height (Height & Weight step)'
      case 'weight_kg':
        return 'weight (Height & Weight step)'
    }
  })
  return `Complete ${labels.join(' and ')} before reviewing suggested doses.`
}

export default OpenEncounterWorkflowPage(async function TriageRecommendedDosesPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const {
    trx,
    patient,
    health_worker,
    this_visit_diagnoses,
    this_visit_findings,
  } = ctx.state

  const most_recent_patient_vitals = await patient_vitals.getMostRecentMeasurements(
    trx,
    {
      health_worker_id: health_worker.id,
      patient_id: patient.id,
      snomed_concept_ids: [
        VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
        VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
      ],
    },
  )

  const height_measurement = most_recent_patient_vitals.find(
    (measurement) => measurement.specific_snomed_concept_id === VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
  )
  const weight_measurement = most_recent_patient_vitals.find(
    (measurement) => measurement.specific_snomed_concept_id === VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
  )

  const snomed_concept_ids = snomedConceptIdsFromEncounter({
    this_visit_diagnoses,
    this_visit_findings,
  })

  const built_patient_case = buildPatientCaseFromEncounter({
    patient,
    measurements: {
      height_cm: height_measurement?.value.value ?? null,
      weight_kg: weight_measurement?.value.value ?? null,
    },
    snomed_concept_ids,
  })

  if (!built_patient_case.ok) {
    return {
      next_step_text: 'Continue',
      children: (
        <div class='flex flex-col gap-4'>
          <h2 class='text-lg font-semibold text-gray-900'>Suggested medication doses</h2>
          <p class='text-sm text-gray-700'>
            {missingPatientDetailsMessage(built_patient_case.missing)}
          </p>
        </div>
      ),
    }
  }

  const lookup = await recommended_dose_calculator.lookup(trx, built_patient_case.patient_case)

  return {
    next_step_text: 'Continue to route patient',
    children: (
      <div class='flex flex-col gap-4'>
        <h2 class='text-lg font-semibold text-gray-900'>Suggested medication doses</h2>
        <p class='text-sm text-gray-600'>
          Based on this visit&apos;s patient details, findings, and system diagnoses. Review each suggestion before prescribing.
        </p>
        <RecommendedDosesResults
          patient_case={built_patient_case.patient_case}
          lookup={lookup}
        />
      </div>
    ),
  }
})
