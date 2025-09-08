import { EncounterContext, EncounterPage } from './../_middleware.tsx'
import { z } from 'zod'
import * as patient_evaluations from '../../../../../../../db/models/patient_evaluations.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { completeStep } from './../_middleware.tsx'
import { postHandler } from '../../../../../../../util/postHandler.ts'
import { snomed_concept_id } from '../../../../../../../util/validators.ts'
import { PRIORITIES } from '../../../../../../../types.ts'
import { VitalsEvaluationsForm } from '../../../../../../../components/vitals/EvaluationsForm.tsx'

const VitalsEvaluationSchema = z.object({
  findings: z.record(
    z.string().uuid(),
    z.object({
      finding_id: z.string().uuid(),
      snomed_concept_id,
      priority: z.enum(PRIORITIES).optional(),
      note: z.string().trim().optional(),
    }),
  ).optional().transform((findings) =>
    Object.entries(findings || {}).map(([_, evaluation_data]) =>
      evaluation_data
    )
  ),
})

export const handler = postHandler(
  VitalsEvaluationSchema,
  async (_req, ctx: EncounterContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await patient_evaluations.insertMany(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      evaluations: form_values.findings,
    })

    return completeStep(ctx)
  },
)

export async function VitalsEvaluationsPage(ctx: EncounterContext) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const recent_measurements = await patient_evaluations
    .getMostRecentVitalsWithEvaluations(
      ctx.state.trx,
      { patient_id },
    )

  const measurements_with_evaluations = recent_measurements.map(
    (measurement) => ({
      ...measurement,
      existing_evaluation: measurement.evaluations[0]
        ? {
          evaluation_id: measurement.finding_id,
          evaluates_record_id: measurement.finding_id,
          priority: patient_evaluations.mapPriorityFromSnomedCode(
            measurement.evaluations[0].snomed_concept_id,
          ),
          note: measurement.evaluations[0].note,
          snomed_concept_id: measurement.evaluations[0].snomed_concept_id,
        }
        : undefined,
    }),
  )

  return <VitalsEvaluationsForm measurements={measurements_with_evaluations} />
}

export default EncounterPage(VitalsEvaluationsPage)
