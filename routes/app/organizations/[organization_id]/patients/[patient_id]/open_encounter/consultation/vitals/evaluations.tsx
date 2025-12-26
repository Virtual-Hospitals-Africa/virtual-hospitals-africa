import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../../util/postHandler.ts'
import { snomed_concept_id } from '../../../../../../../../../util/validators.ts'
import { PRIORITIES } from '../../../../../../../../../shared/priorities.ts'
// import * as patient_evaluations from '../../../../../../../../../db/models/patient_evaluations.ts'
// import { VitalsEvaluationsForm } from '../../../../../../../../../components/vitals/EvaluationsForm.tsx'

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
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    // await patient_evaluations.insertMany(ctx.state.trx, {
    //   patient_id,
    //   patient_encounter_id: ctx.state.encounter.patient_encounter_id,
    //   patient_encounter_employee_id:
    //     ctx.state.encounter_employee_presence.patient_encounter_employee_id,
    //   evaluations: form_values.findings,
    // })

    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function VitalsEvaluationsPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO: reimplement</>
  // const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  // const recent_measurements = await patient_evaluations
  //   .getMostRecentVitalsWithEvaluations(
  //     ctx.state.trx,
  //     { patient_id },
  //   )

  // const measurements_with_evaluations = recent_measurements.map(
  //   (measurement) => ({
  //     ...measurement,
  //     evaluation: measurement.evaluations[0]
  //       ? {
  //         evaluation_id: measurement.record_id,
  //         evaluates_record_id: measurement.record_id,
  //         priority: patient_evaluations.mapPriorityFromSnomedCode(
  //           measurement.evaluations[0].snomed_concept_id,
  //         ),
  //         note: measurement.evaluations[0].note,
  //         snomed_concept_id: measurement.evaluations[0].snomed_concept_id,
  //       }
  //       : undefined,
  //   }),
  // )

  // return <VitalsEvaluationsForm measurements={measurements_with_evaluations} />
}

export default OpenEncounterWorkflowPage(VitalsEvaluationsPage)
