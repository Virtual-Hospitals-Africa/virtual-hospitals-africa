import { RecordPanel } from '../../../../../../../../components/library/RecordPanel.tsx'
import { now } from '../../../../../../../../db/helpers.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { patient_record_providers } from '../../../../../../../../db/models/patient_record_providers.ts'
import { OpenEncounterWorkflowContext, RenderedFindingRelativeToHealthWorker } from '../../../../../../../../types.ts'
import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'

export const handler = {
  // deno-lint-ignore require-await
  async POST(ctx: OpenEncounterWorkflowContext) {
    const completing_step = completeAndProceedToNextStep(ctx)
    return completing_step
  },
}

export default OpenEncounterWorkflowPage(
  async function FindingsPage(
    ctx,
  ) {
    const { trx, encounter, health_worker_id, patient_id, patient_encounter_id, organization_id } = ctx.state
    const prior_findings_this_encounter: RenderedFindingRelativeToHealthWorker[] = await patient_findings.findAll(trx, {
      patient_id,
      patient_encounter_id,
      include_negative: false,
      before: now,
    }).then((findings) =>
      patient_record_providers.hydrateIntermediateRecords(trx, {
        records: findings,
        encounter,
        health_worker_id,
      })
    )

    // const x = prior_findings_this_encounter[0]

    return (
      <ul>
        {prior_findings_this_encounter.map((finding) => <RecordPanel record={finding} organization_id={organization_id} />)}
      </ul>
    )
  },
)
