import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  completedProcedure,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { positive_decimal } from '../../../../../../../../util/validators.ts'
import { VitalsMeasurementsForm } from '../../../../../../../../components/vitals/MeasurementsForm.tsx'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from '../../../../../../../../shared/vitals.ts'
import { parseWithSchema } from '../../../../../../../../shared/s_expression.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import entries from '../../../../../../../../util/entries.ts'
import compact from '../../../../../../../../util/compact.ts'
import { comparator } from '../../../../../../../../shared/s_expression_schemas.ts'
import { exists } from '../../../../../../../../util/exists.ts'

export const TriageHeightAndWeightSchema = z.object({
  measurements: z.record(
    z.enum(['height', 'weight']),
    z.object({
      value: positive_decimal,
      units: z.string().min(1),
    }).strict(),
  ),
}).strict()

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
          comparator,
        )
      }),
    )

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
    <VitalsMeasurementsForm
      vital_measurements_for_this_encounter={[
        {
          vital: 'height',
          snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
          required: true,
          units: 'cm',
        },
        {
          vital: 'weight',
          snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
          required: true,
          units: 'kg',
        },
      ]}
      triage_assessments={[]}
      most_recent_patient_vitals={most_recent_patient_vitals}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageHeightAndWeightPage)
