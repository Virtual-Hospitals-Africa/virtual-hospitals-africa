import { assertAllPriorStepsCompleted, completeAndProceedToNextStep, completedProcedure, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { positive_decimal } from '../../../../../../../../util/validators.ts'
import { HeightAndWeight } from '../../../../../../../../components/HeightAndWeight.tsx'
import {
  BMI_DECIMAL_PLACES,
  computeBMI,
  VITAL_COMPUTED_UNITS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPTS,
  VITALS_COMPUTED_SNOMED_CONCEPTS,
} from '../../../../../../../../shared/vitals.ts'
import { parseWithSchema } from '../../../../../../../../shared/s_expression.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import entries from '../../../../../../../../util/entries.ts'
import compact from '../../../../../../../../util/compact.ts'
import { measurement_comparator } from '../../../../../../../../shared/s_expression_schemas.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { redirectToRoutePatientIfEmergency } from './_middleware.tsx'

export const TriageHeightAndWeightSchema = z.object({
  measurements: z.record(
    z.enum(['height', 'weight']),
    z.object({
      value: positive_decimal,
      units: z.string().min(1),
    }),
  ),
})

export const handler = postHandler(
  TriageHeightAndWeightSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      employment_id,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      workflow_step_snomed_concept,
    } = ctx.state

    const completed_procedure = completedProcedure(ctx)

    const measurements_to_insert = compact(
      entries(form_values.measurements).map(([vital, measurement]) => {
        if (!measurement) return undefined
        const snomed_concept = VITAL_MEASUREMENTS_SNOMED_CONCEPTS[vital]
        return parseWithSchema(
          `(= (measurement ${snomed_concept.s_expression} ${measurement.units}) ${measurement.value})`,
          measurement_comparator,
        )
      }),
    )

    const { height, weight } = form_values.measurements
    if (height && weight) {
      const bmi = computeBMI(height.value.toNumber(), weight.value.toNumber())
        .toFixed(BMI_DECIMAL_PLACES)
      measurements_to_insert.push(parseWithSchema(
        `(= (measurement ${VITALS_COMPUTED_SNOMED_CONCEPTS.body_mass_index.s_expression} ${VITAL_COMPUTED_UNITS.body_mass_index}) ${bmi})`,
        measurement_comparator,
      ))
    }

    await patient_findings.insertMany(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      procedure: completed_procedure || {
        create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id),
      },
      findings: [],
      measurements: measurements_to_insert,
    })

    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageHeightAndWeightPage(
  ctx: OpenEncounterWorkflowContext,
) {
  redirectToRoutePatientIfEmergency(ctx)
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const most_recent_patient_vitals = await patient_vitals
    .getMostRecentMeasurements(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker.id,
        patient_id: ctx.state.patient.id,
        snomed_concept_ids: [
          VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
          VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
        ],
      },
    )

  return (
    <HeightAndWeight
      most_recent_patient_vitals={most_recent_patient_vitals}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageHeightAndWeightPage)
