import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { ALL_VITAL_SNOMED_CONCEPT_IDS } from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import matching from '../../../../../../../../util/matching.ts'
import { TriageAssignPriorityTableVital } from '../../../../../../../../types.ts'
import { TriageAssignPriorityTable } from '../../../../../../../../components/triage/AssignPriorityTable.tsx'

const TriageAssignPrioritySchema = z.object({})

export const handler = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageAssignPriorityPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, health_worker_id, patient_id, patient_encounter_id } = ctx.state

  // const findings_with_a_triage_level: RenderedFindingRelativeToHealthWorker[] = await patient_findings.getByIds(
  //   trx,
  //   patient_triage_level.distinctIds(
  //     trx,
  //     {
  //       patient_id: ctx.state.patient.id,
  //       patient_encounter_id: ctx.state.encounter.patient_encounter_id,
  //       s_expression: '(evaluation (evaluates (finding)))'
  //     }
  //   )
  // ).then(findings =>
  //   hydrateIntermediateRecords(trx, {
  //     records: findings,
  //     health_worker_id,
  //     encounter,
  //   })
  // )

  // findings_with_a_triage_level.forEach(finding => assertHasProperty(finding, 'priority'))

  // console.log({ findings_with_a_triage_level })

  const vitals_this_encounter = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id,
      patient_id,
      patient_encounter_id,
      snomed_concept_ids: ALL_VITAL_SNOMED_CONCEPT_IDS,
    })

  const previous_vitals = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id,
      patient_id,
      excluding_patient_encounter_id: patient_encounter_id,
      snomed_concept_ids: vitals_this_encounter.map((v) =>
        v.finding_snomed_concept_id
      ),
    })

  const vitals: TriageAssignPriorityTableVital[] = vitals_this_encounter.map(
    (current) => ({
      current,
      previous: previous_vitals.find(matching({
        finding_snomed_concept_id: current.finding_snomed_concept_id,
      })) ?? null,
      reference_range: null,
    }),
  )

  return <TriageAssignPriorityTable vitals={vitals} />
}

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
